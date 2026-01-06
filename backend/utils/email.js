const dns = require("dns").promises;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function hasMxRecord(domain) {
  try {
    const mx = await dns.resolveMx(domain);
    return mx && mx.length > 0;
  } catch (err) {
    // treat DNS failures as no MX
    return false;
  }
}

async function validateEmailAddress(email) {
  if (!email || typeof email !== "string") return { valid: false, reason: "format" };
  if (!EMAIL_REGEX.test(email)) return { valid: false, reason: "format" };
  const domain = email.split("@")[1];
  if (!domain) return { valid: false, reason: "format" };
  const hasMx = await hasMxRecord(domain);
  if (!hasMx) return { valid: false, reason: "no_mx" };
  return { valid: true };
}

module.exports = { validateEmailAddress, hasMxRecord };
