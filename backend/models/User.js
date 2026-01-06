const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
  username: String,
  email: String,
  password: String,
  defaultDownloadPassword: String,

  // Email verification / delivery tracking
  emailConfirmed: { type: Boolean, default: false },
  emailValid: { type: Boolean, default: true },
  emailDeliveryStatus: { type: String, enum: ["pending", "sent", "rejected", "error"], default: "pending" },
  lastMailResponse: String,
  lastMailSentAt: Date,

  // Password reset (OTP)
  passwordResetOTP: String, // hashed OTP
  passwordResetExpiresAt: Date,

  lastLoginConfirmedAt: Date,
  lastEmailConfirmedAt: Date
});

module.exports = mongoose.model("User", userSchema);
