const express = require("express");
const File = require("../models/File");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Public download entry
// If rule is EXPIRY and valid: download immediately
// If rule is PASSCODE or DEFAULT: respond with info indicating a passcode is required and the rule type
router.get("/:link", async (req, res) => {
  const file = await File.findOne({ publicLink: req.params.link });
  if (!file) return res.status(404).send("Invalid Link");

  // Enforce expiry for all rule types
  const expired = file.expiry && new Date() > file.expiry;
  if (expired) return res.status(403).send("Link Expired");

  if (file.ruleType === "EXPIRY") {
    // If the client expects JSON (e.g. frontend API call), return metadata instead of forcing a download.
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json({ requiresPasscode: false, ruleType: file.ruleType, expiry: file.expiry, expired: false });
    }
    return res.download(file.filePath);
  }

  // For PASSCODE and DEFAULT, indicate that a passcode is required (frontend handles UI)
  res.json({ requiresPasscode: true, ruleType: file.ruleType, expiry: file.expiry, expired: false });
});

// Verify passcode/default password and download
router.post("/:link/verify", async (req, res) => {
  const { passcode } = req.body;
  const file = await File.findOne({ publicLink: req.params.link }).populate("userId");
  if (!file) return res.status(404).json({ message: "Invalid link" });

  // Enforce expiry for all rule types
  if (file.expiry && new Date() > file.expiry) return res.status(403).json({ message: "Link expired" });

  if (file.ruleType === "EXPIRY") {
    return res.download(file.filePath);
  }

  if (file.ruleType === "PASSCODE") {
    if (!passcode) return res.status(400).json({ message: "Passcode required" });
    if (file.passcode !== passcode) return res.status(403).json({ message: "Invalid passcode" });
    return res.download(file.filePath);
  }

  if (file.ruleType === "DEFAULT") {
    // user's defaultDownloadPassword stored on user record (hashed). Support legacy plaintext fallback.
    const user = file.userId;
    if (!user) return res.status(404).json({ message: "Owner not found" });
    if (!passcode) return res.status(400).json({ message: "Password required" });

    const stored = user.defaultDownloadPassword;
    if (!stored) return res.status(403).json({ message: "Invalid password" });

    let match = false;
    if (typeof stored === "string" && stored.startsWith("$2")) {
      match = await bcrypt.compare(passcode, stored);
    } else {
      match = passcode === stored;
    }

    if (!match) return res.status(403).json({ message: "Invalid password" });
    return res.download(file.filePath);
  }

  res.status(400).json({ message: "Unsupported rule" });
});

module.exports = router;
