const nodemailer = require("nodemailer");

// Simple nodemailer transporter using Gmail credentials from .env
// Make sure EMAIL_USER and EMAIL_PASS are set in your .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const DEFAULT_FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER;

module.exports = {
  sendMail: (options) => {
    const opts = Object.assign({ from: DEFAULT_FROM }, options);
    return transporter.sendMail(opts);
  },
  transporter,
};
