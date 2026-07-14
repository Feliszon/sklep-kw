const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email.trim());
}

function isValidAmount(amount) {
  const n = Number(amount);
  return Number.isFinite(n) && n > 0;
}

function toGrosze(amountPln) {
  return Math.round(Number(amountPln) * 100);
}

module.exports = { isValidEmail, isValidAmount, toGrosze };
