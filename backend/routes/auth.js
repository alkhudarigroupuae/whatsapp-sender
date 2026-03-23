const express = require("express");
const bcrypt = require("bcryptjs");

const { signAccessToken } = require("../services/authTokens");
const { requireAuth } = require("../middleware/requireAuth");
const { isAdminEmail } = require("../services/admin");
const {
  createUser,
  createUserFromGoogle,
  findUserByEmail,
  findUserByGoogleSub,
  findUserById,
  setGoogleSub,
  toPublicUser,
} = require("../db/users");

const router = express.Router();

router.post("/register", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const name = String(req.body.name || "").trim();
  const password = String(req.body.password || "");

  if (!email || !name || password.length < 8) {
    return res.status(400).json({ error: "Invalid registration details" });
  }

  const existing = await findUserByEmail(email);
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ email, name, passwordHash });

  const token = signAccessToken({ userId: user.id });
  res.json({ token, user: { ...toPublicUser(user), isAdmin: isAdminEmail(user.email) } });
});

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  if (!user.password_hash) {
    return res.status(401).json({ error: "This account uses Google sign-in" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signAccessToken({ userId: user.id });
  res.json({ token, user: { ...toPublicUser(user), isAdmin: isAdminEmail(user.email) } });
});

router.post("/google", async (req, res) => {
  const credential = String(req.body?.credential || "").trim();
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(503).json({ error: "Google sign-in is not configured (missing GOOGLE_CLIENT_ID)" });
  }
  if (!credential) {
    return res.status(400).json({ error: "Missing credential" });
  }

  let payload;
  try {
    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: "Invalid Google credential" });
  }

  const sub = payload.sub;
  const email = String(payload.email || "").trim().toLowerCase();
  const name = String(payload.name || payload.email?.split("@")[0] || "User").trim();
  if (!sub || !email) {
    return res.status(400).json({ error: "Google account did not return email" });
  }

  let user = await findUserByGoogleSub(sub);
  if (!user) {
    const byEmail = await findUserByEmail(email);
    if (byEmail) {
      if (byEmail.google_sub && byEmail.google_sub !== sub) {
        return res.status(409).json({ error: "Email is linked to a different Google account" });
      }
      user = await setGoogleSub(byEmail.id, sub);
      if (!user) return res.status(500).json({ error: "Could not link Google account" });
    } else {
      user = await createUserFromGoogle({ email, name, googleSub: sub });
    }
  } else {
    const row = await findUserById(user.id);
    user = row || user;
  }

  const token = signAccessToken({ userId: user.id });
  res.json({ token, user: { ...toPublicUser(user), isAdmin: isAdminEmail(user.email) } });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = req.user;
  res.json({ user: { ...toPublicUser(user), isAdmin: Boolean(req.isAdmin) } });
});

router.post("/logout", (_req, res) => {
  res.json({ ok: true });
});

module.exports = router;
