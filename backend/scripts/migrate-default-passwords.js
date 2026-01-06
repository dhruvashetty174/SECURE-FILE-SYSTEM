#!/usr/bin/env node
require("dotenv").config();
const connectDB = require("../config/db");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const migrate = async () => {
  await connectDB();
  const users = await User.find({ defaultDownloadPassword: { $exists: true, $ne: null } });
  let updated = 0;

  for (const user of users) {
    const stored = user.defaultDownloadPassword;
    if (!stored) continue;
    // Skip if already looks like a bcrypt hash
    if (typeof stored === "string" && stored.startsWith("$2")) continue;

    user.defaultDownloadPassword = await bcrypt.hash(stored, 10);
    await user.save();
    updated++;
    console.log(`Updated user ${user._id}`);
  }

  console.log(`Migration complete. ${updated} user(s) updated.`);
  process.exit(0);
};

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});