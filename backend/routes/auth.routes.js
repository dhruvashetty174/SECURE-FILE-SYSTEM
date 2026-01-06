const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mailer = require("../config/mail");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const { validateEmailAddress } = require("../utils/email");

const router = express.Router();

// Admin creates user
router.post("/create-user", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const { username, email, password, defaultDownloadPassword } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Validate email
    const emailValidation = await validateEmailAddress(email);
    if (!emailValidation.valid) {
      const msg = emailValidation.reason === "format" ? "Invalid email format" : "Email domain does not appear to accept mail (no MX records)";
      return res.status(400).json({ message: msg });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedDefaultPassword = defaultDownloadPassword ? await bcrypt.hash(defaultDownloadPassword, 10) : undefined;

    let user = await User.create({
      username,
      email,
      password: hashedPassword,
      defaultDownloadPassword: hashedDefaultPassword,
      emailValid: true,
      emailDeliveryStatus: "pending",
    });

    // Generate a confirmation token for email verification (expires in 24h)
    const confirmToken = jwt.sign(
      { id: user._id, type: "email_confirmation" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const confirmUrl = `${baseUrl}/api/auth/confirm-email?token=${confirmToken}`;

    try {
      const info = await mailer.sendMail({
        to: user.email,
        subject: "Confirm your registration",
        html: `<p>Thanks for registering. Please confirm your email by clicking the link below:</p>
               <p><a href="${confirmUrl}">Confirm email</a></p>
               <p>This link expires in 24 hours.</p>`,
      });

      user.lastMailSentAt = new Date();
      user.lastMailResponse = JSON.stringify({ accepted: info.accepted, rejected: info.rejected, response: info.response });
      user.emailDeliveryStatus = info.rejected && info.rejected.length > 0 ? "rejected" : "sent";
      await user.save();
    } catch (mailErr) {
      console.error("Mail error:", mailErr);
      user.emailDeliveryStatus = "error";
      user.lastMailResponse = mailErr.message || String(mailErr);
      user.lastMailSentAt = new Date();
      await user.save();
    }

    const msg = user.emailDeliveryStatus === "sent" ? "User created successfully; confirmation email sent" : "User created but confirmation email could not be delivered to this address.";
    res.json({ message: msg, userId: user._id, emailDeliveryStatus: user.emailDeliveryStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Public registration (self-signup) — sends confirmation email
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, defaultDownloadPassword } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Validate email format and MX records
    const emailValidation = await validateEmailAddress(email);
    if (!emailValidation.valid) {
      const msg = emailValidation.reason === "format" ? "Invalid email format" : "Email domain does not appear to accept mail (no MX records)";
      return res.status(400).json({ message: msg });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedDefaultPassword = defaultDownloadPassword ? await bcrypt.hash(defaultDownloadPassword, 10) : undefined;

    let user = await User.create({
      role: "USER",
      username,
      email,
      password: hashedPassword,
      defaultDownloadPassword: hashedDefaultPassword,
      emailConfirmed: false,
      emailValid: true,
      emailDeliveryStatus: "pending",
    });

    const confirmToken = jwt.sign(
      { id: user._id, type: "email_confirmation" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const confirmUrl = `${baseUrl}/api/auth/confirm-email?token=${confirmToken}`;

    // Attempt to send confirmation and capture transporter response to detect immediate rejections
    try {
      const info = await mailer.sendMail({
        to: user.email,
        subject: "Confirm your registration",
        html: `<p>Thanks for registering. Please confirm your email by clicking the link below:</p>
               <p><a href="${confirmUrl}">Confirm email</a></p>
               <p>This link expires in 24 hours.</p>`,
      });

      user.lastMailSentAt = new Date();
      user.lastMailResponse = JSON.stringify({ accepted: info.accepted, rejected: info.rejected, response: info.response });
      user.emailDeliveryStatus = info.rejected && info.rejected.length > 0 ? "rejected" : "sent";
      await user.save();
    } catch (mailErr) {
      console.error("Mail error:", mailErr);
      user.emailDeliveryStatus = "error";
      user.lastMailResponse = mailErr.message || String(mailErr);
      user.lastMailSentAt = new Date();
      await user.save();
    }

    const msg = user.emailDeliveryStatus === "sent" ? "Registered successfully; confirmation email sent" : "Registered, but confirmation email could not be delivered to this address. Please update your email or request a resend.";
    res.json({ message: msg, userId: user._id, emailDeliveryStatus: user.emailDeliveryStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login + confirmation mail
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Do not send any email on login; simply return token and role
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Confirm email endpoint — user clicks the link sent after registration
router.get("/confirm-email", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Token required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type !== "email_confirmation") return res.status(400).json({ message: "Invalid token" });

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.emailConfirmed = true;
    user.lastEmailConfirmedAt = new Date();
    await user.save();

    // If this is intended to be visited in a browser, show a simple message
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.send("Email confirmed. You may close this window.");
    }

    res.json({ message: "Email confirmed" });
  } catch (err) {
    console.error(err);
    if (err.name === "TokenExpiredError") return res.status(400).json({ message: "Token expired" });
    res.status(400).json({ message: "Invalid token" });
  }
});

// Get current user profile (authenticated)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -defaultDownloadPassword");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ username: user.username, email: user.email, role: user.role, emailConfirmed: user.emailConfirmed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Resend confirmation email (public endpoint)
router.post("/resend-confirmation", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.emailConfirmed) return res.status(400).json({ message: "Email already confirmed" });

    const confirmToken = jwt.sign(
      { id: user._id, type: "email_confirmation" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const confirmUrl = `${baseUrl}/api/auth/confirm-email?token=${confirmToken}`;

    try {
      const info = await mailer.sendMail({
        to: user.email,
        subject: "Confirm your registration",
        html: `<p>Please confirm your email by clicking the link below:</p>
               <p><a href="${confirmUrl}">Confirm email</a></p>
               <p>This link expires in 24 hours.</p>`,
      });

      user.lastMailSentAt = new Date();
      user.lastMailResponse = JSON.stringify({ accepted: info.accepted, rejected: info.rejected, response: info.response });
      user.emailDeliveryStatus = info.rejected && info.rejected.length > 0 ? "rejected" : "sent";
      await user.save();

      const msg = user.emailDeliveryStatus === "sent" ? "Confirmation email sent" : "Confirmation email could not be delivered";
      return res.json({ message: msg, emailDeliveryStatus: user.emailDeliveryStatus });
    } catch (mailErr) {
      console.error("Mail error:", mailErr);
      user.emailDeliveryStatus = "error";
      user.lastMailResponse = mailErr.message || String(mailErr);
      user.lastMailSentAt = new Date();
      await user.save();
      return res.status(500).json({ message: "Failed to send confirmation email" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

    // Forgot password - request OTP
    router.post("/forgot-password", async (req, res) => {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email required" });

      try {
        const user = await User.findOne({ email });
        if (!user) {
          // Do not reveal whether email exists
          return res.json({ message: "If an account with that email exists, an OTP has been sent" });
        }

        // generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        if (process.env.NODE_ENV !== "production") {
          console.log(`Password reset OTP for ${user.email}: ${otp}`);
        }
        const hashedOtp = await bcrypt.hash(otp, 10);
        user.passwordResetOTP = hashedOtp;
        user.passwordResetExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await user.save();

        // send OTP email
        try {
          await mailer.sendMail({
            to: user.email,
            subject: "Password reset OTP",
            html: `<p>Your password reset code is: <strong>${otp}</strong></p><p>This code expires in 5 minutes.</p>`,
          });
        } catch (mailErr) {
          console.error("Failed to send reset OTP:", mailErr);
          // still return generic response
        }

        return res.json({ message: "If an account with that email exists, an OTP has been sent" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Reset password using OTP
    router.post("/reset-password", async (req, res) => {
      const { email, otp, newPassword, confirmPassword } = req.body;
      if (!email || !otp || !newPassword || !confirmPassword) return res.status(400).json({ message: "email, otp, newPassword and confirmPassword required" });
      if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

      try {
        const user = await User.findOne({ email });
        if (!user || !user.passwordResetOTP || !user.passwordResetExpiresAt) return res.status(400).json({ message: "Invalid or expired OTP" });

        if (new Date() > user.passwordResetExpiresAt) return res.status(400).json({ message: "OTP expired" });

        const isMatch = await bcrypt.compare(otp, user.passwordResetOTP);
        if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

        // Update password
        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        // Invalidate OTP
        user.passwordResetOTP = undefined;
        user.passwordResetExpiresAt = undefined;
        await user.save();

        return res.json({ message: "Password updated" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    });


// Allow authenticated users to change their email and trigger a confirmation send
router.post("/change-email", authMiddleware, async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) return res.status(400).json({ message: "newEmail required" });

  try {
    const validation = await validateEmailAddress(newEmail);
    if (!validation.valid) {
      const msg = validation.reason === "format" ? "Invalid email format" : "Email domain does not appear to accept mail (no MX records)";
      return res.status(400).json({ message: msg });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.email = newEmail;
    user.emailConfirmed = false;
    user.emailValid = true;
    user.emailDeliveryStatus = "pending";
    await user.save();

    const confirmToken = jwt.sign({ id: user._id, type: "email_confirmation" }, process.env.JWT_SECRET, { expiresIn: "24h" });
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const confirmUrl = `${baseUrl}/api/auth/confirm-email?token=${confirmToken}`;

    try {
      const info = await mailer.sendMail({
        to: user.email,
        subject: "Confirm your new email",
        html: `<p>Your email was updated. Please confirm the new address by clicking the link below:</p>
               <p><a href="${confirmUrl}">Confirm email</a></p>
               <p>This link expires in 24 hours.</p>`,
      });

      user.lastMailSentAt = new Date();
      user.lastMailResponse = JSON.stringify({ accepted: info.accepted, rejected: info.rejected, response: info.response });
      user.emailDeliveryStatus = info.rejected && info.rejected.length > 0 ? "rejected" : "sent";
      await user.save();

      const msg = user.emailDeliveryStatus === "sent" ? "Email updated and confirmation sent" : "Email updated but confirmation could not be delivered";
      return res.json({ message: msg, emailDeliveryStatus: user.emailDeliveryStatus });
    } catch (mailErr) {
      console.error("Mail error:", mailErr);
      user.emailDeliveryStatus = "error";
      user.lastMailResponse = mailErr.message || String(mailErr);
      user.lastMailSentAt = new Date();
      await user.save();
      return res.status(500).json({ message: "Email updated but failed to send confirmation" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
