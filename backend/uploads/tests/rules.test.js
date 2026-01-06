const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");
const File = require("../models/File");
const connectDB = require("../config/db");
let app;
let mongod;
let serverRequest;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await connectDB();
  app = require("../server");
  serverRequest = request(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  // cleanup uploads folder if exists
  const uploads = path.join(process.cwd(), "uploads");
  try {
    if (fs.existsSync(uploads)) {
      fs.rmSync(uploads, { recursive: true, force: true });
    }
  } catch (e) {
    // ignore
  }
});

describe("File download rules - one rule per file", () => {
  let token;
  let user;
  let fileId;
  let publicLink;

  test("create user and login", async () => {
    const hashed = await bcrypt.hash("Sumathio@74", 10);
    user = await User.create({
      role: "USER",
      username: "Sumathi",
      email: "sumathishetty174@gmail.com",
      password: hashed,
      defaultDownloadPassword: "userDefault123",
      emailConfirmed: true,
    });

    const res = await serverRequest.post("/api/auth/login").send({
      email: "sumathishetty174@gmail.com",
      password: "Sumathio@74",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test("upload a file", async () => {
    const tmp = path.join(__dirname, "tmp.txt");
    fs.writeFileSync(tmp, "hello world");

    const res = await serverRequest
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", tmp);

    expect(res.status).toBe(200);
    expect(res.body._id).toBeDefined();
    expect(res.body.size).toBeDefined();

    fileId = res.body._id;
    fs.unlinkSync(tmp);
  });

  test("set PASSCODE rule then replace with EXPIRY then DEFAULT, verifying only one active", async () => {
    // set PASSCODE
    const r1 = await serverRequest
      .post(`/api/files/${fileId}/rule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ruleType: "PASSCODE", passcode: "linkPass456" });
    expect(r1.status).toBe(200);
    expect(r1.body.publicUrl).toBeDefined();
    const link1 = r1.body.publicUrl.split("/").pop();

    const fileAfterPass = await File.findById(fileId);
    expect(fileAfterPass.ruleType).toBe("PASSCODE");
    expect(fileAfterPass.passcode).toBe("linkPass456");
    expect(fileAfterPass.expiry).toBeNull();

    // now set EXPIRY and ensure PASSCODE cleared
    const exp = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const r2 = await serverRequest
      .post(`/api/files/${fileId}/rule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ruleType: "EXPIRY", expiry: exp });
    expect(r2.status).toBe(200);

    const fileAfterExp = await File.findById(fileId);
    expect(fileAfterExp.ruleType).toBe("EXPIRY");
    expect(fileAfterExp.passcode).toBeNull();
    expect(fileAfterExp.expiry).toBeInstanceOf(Date);

    // GET public link should download (since not expired)
    const link2 = r2.body.publicUrl.split("/").pop();
    const dl = await serverRequest.get(`/download/${link2}`);
    expect(dl.status).toBe(200);
    expect(dl.headers["content-disposition"]).toBeDefined();

    // now set DEFAULT and ensure other fields cleared
    const r3 = await serverRequest
      .post(`/api/files/${fileId}/rule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ruleType: "DEFAULT" });
    expect(r3.status).toBe(200);

    const fileAfterDef = await File.findById(fileId);
    expect(fileAfterDef.ruleType).toBe("DEFAULT");
    expect(fileAfterDef.passcode).toBeNull();
    expect(fileAfterDef.expiry).toBeNull();

    // verify DEFAULT requires default password
    const link3 = r3.body.publicUrl.split("/").pop();
    const bad = await serverRequest.post(`/download/${link3}/verify`).send({ passcode: "wrong" });
    expect(bad.status).toBe(403);

    const ok = await serverRequest.post(`/download/${link3}/verify`).send({ passcode: "userDefault123" });
    expect(ok.status).toBe(200);
  });
});
