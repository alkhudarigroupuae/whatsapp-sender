const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("Missing JWT_SECRET");
    err.code = "JWT_SECRET_MISSING";
    throw err;
  }
  return secret;
}

function signAccessToken(payload) {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyAccessToken(token) {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
}

module.exports = { signAccessToken, verifyAccessToken };

