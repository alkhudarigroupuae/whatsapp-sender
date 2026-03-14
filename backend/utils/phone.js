function normalizePhone(input) {
  if (!input) return null;
  const digits = String(input).replace(/[^\d]/g, "");
  if (!digits) return null;
  return digits;
}

function toChatId(phoneDigits) {
  return `${phoneDigits}@c.us`;
}

module.exports = { normalizePhone, toChatId };

