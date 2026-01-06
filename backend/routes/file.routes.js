const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const linksConfig = require("../config/links");
const File = require("../models/File");

const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // store files in per-user folders: uploads/<userId>/
    const userId = req.user && req.user._id ? String(req.user._id) : "anonymous";
    const dest = path.join("uploads", userId);

    try {
      fs.mkdirSync(dest, { recursive: true });
    } catch (err) {
      console.error("Error creating upload dir:", err);
      return cb(err);
    }

    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, crypto.randomUUID() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const file = await File.create({
    userId: req.user._id,
    fileName: req.file.originalname,
    filePath: req.file.path,
    folderPath: req.file.destination,
    size: req.file.size,
  });

  // do not expose server file paths in API responses
  res.json({
    _id: file._id,
    fileName: file.fileName,
    size: file.size,
    ruleType: file.ruleType,
    expiry: file.expiry,
    publicLink: file.publicLink,
    createdAt: file.createdAt,
  });
});

// List files for authenticated user
router.get("/", authMiddleware, async (req, res) => {
  const files = await File.find({ userId: req.user._id }).select("fileName size ruleType expiry publicLink createdAt");
  res.json(files);
});

// Get single file metadata
router.get("/:id", authMiddleware, async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "File not found" });
  if (!file.userId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  // do not expose the server file path
  res.json({
    _id: file._id,
    fileName: file.fileName,
    size: file.size,
    ruleType: file.ruleType,
    expiry: file.expiry,
    publicLink: file.publicLink,
    createdAt: file.createdAt,
  });
});

// Delete a file (both DB record and physical file)
router.delete("/:id", authMiddleware, async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "File not found" });
  if (!file.userId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  // Remove physical file if exists
  try {
    if (file.filePath && fs.existsSync(path.resolve(file.filePath))) {
      fs.unlinkSync(path.resolve(file.filePath));
    }
  } catch (err) {
    console.error("Error deleting file:", err);
  }

  await File.deleteOne({ _id: file._id });
  res.json({ message: "File deleted" });
});

// Replace existing file (upload new file and remove old)
router.post("/:id/replace", authMiddleware, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "File not found" });
  if (!file.userId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  // delete old file
  try {
    if (file.filePath && fs.existsSync(path.resolve(file.filePath))) {
      fs.unlinkSync(path.resolve(file.filePath));
    }
  } catch (err) {
    console.error("Error deleting old file:", err);
  }

  // update record
  file.fileName = req.file.originalname;
  file.filePath = req.file.path;
  file.folderPath = req.file.destination;
  file.size = req.file.size;
  await file.save();

  // do not expose file paths
  res.json({
    _id: file._id,
    fileName: file.fileName,
    size: file.size,
    ruleType: file.ruleType,
    expiry: file.expiry,
    publicLink: file.publicLink,
    createdAt: file.createdAt,
  });
});

// Set rule for a file (one of: PASSCODE, EXPIRY, DEFAULT)
router.post("/:id/rule", authMiddleware, async (req, res) => {
  const { ruleType, passcode, expiry } = req.body;
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "File not found" });
  if (!file.userId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  const allowed = ["PASSCODE", "EXPIRY", "DEFAULT"];
  if (!allowed.includes(ruleType)) return res.status(400).json({ message: "Invalid rule type" });

  file.ruleType = ruleType;
  file.publicLink = crypto.randomUUID();

  // Apply a maximum/default expiry for any generated public link
  const hardExpiry = new Date(Date.now() + linksConfig.DEFAULT_PUBLIC_LINK_VALIDITY_MS);

  if (ruleType === "PASSCODE") {
    if (!passcode) return res.status(400).json({ message: "passcode required for PASSCODE rule" });
    file.passcode = passcode;
    file.expiry = hardExpiry;
  } else if (ruleType === "EXPIRY") {
    if (!expiry) return res.status(400).json({ message: "expiry required for EXPIRY rule" });
    const dt = new Date(expiry);
    if (isNaN(dt.getTime())) return res.status(400).json({ message: "Invalid expiry" });
    // Use the earlier of requested expiry and hard expiry (cap to configured maximum)
    file.expiry = dt < hardExpiry ? dt : hardExpiry;
    file.passcode = null;
  } else if (ruleType === "DEFAULT") {
    // uses user's defaultDownloadPassword at verification time
    file.passcode = null;
    file.expiry = hardExpiry;
  }

  await file.save();

  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const publicUrl = `${baseUrl}/download/${file.publicLink}`;
  res.json({ message: "Rule set", publicUrl });
});

module.exports = router;
