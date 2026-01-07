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

describe("Demo: File upload and download rules", () => {
  let token;
  let user;
  let fileId;

  test("create demo user and login", async () => {
    const hashed = await bcrypt.hash("DemoPass123!", 10);
    user = await User.create({
      role: "USER",
      username: "DemoUser",
      email: "demo@example.com",
      password: hashed,
      defaultDownloadPassword: "default123",
      emailConfirmed: true,
    });

    const res = await serverRequest.post("/api/auth/login").send({
      email: "demo@example.com",
      password: "DemoPass123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test("upload a demo file", async () => {
    const tmp = path.join(__dirname, "tmp.txt");
    fs.writeFileSync(tmp, "Hello Demo World");

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

  test("apply rules sequentially: PASSCODE → EXPIRY → DEFAULT", async () => {
    // 1️⃣ PASSCODE
    const r1 = await serverRequest
      .post(`/api/files/${fileId}/rule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ruleType: "PASSCODE", passcode: "DemoPass456" });

    expect(r1.status).toBe(200);
    const fileAfterPass = await File.findById(fileId);
    expect(fileAfterPass.ruleType).toBe("PASSCODE");
    expect(fileAfterPass.passcode).toBe("DemoPass456");
    expect(fileAfterPass.expiry).toBeNull();

    // 2️⃣ EXPIRY
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

    // Test public link download
    const link2 = r2.body.publicUrl.split("/").pop();
    const dl = await serverRequest.get(`/download/${link2}`);
    expect(dl.status).toBe(200);

    // 3️⃣ DEFAULT
    const r3 = await serverRequest
      .post(`/api/files/${fileId}/rule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ruleType: "DEFAULT" });

    expect(r3.status).toBe(200);
    const fileAfterDef = await File.findById(fileId);
    expect(fileAfterDef.ruleType).toBe("DEFAULT");
    expect(fileAfterDef.passcode).toBeNull();
    expect(fileAfterDef.expiry).toBeNull();

    // DEFAULT password verification
    const link3 = r3.body.publicUrl.split("/").pop();
    const bad = await serverRequest.post(`/download/${link3}/verify`).send({ passcode: "wrong" });
    expect(bad.status).toBe(403);

    const ok = await serverRequest.post(`/download/${link3}/verify`).send({ passcode: "default123" });
    expect(ok.status).toBe(200);
  });
});
