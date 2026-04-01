const express = require("express");
const bcrypt = require("bcryptjs");

const { signAccessToken } = require("../services/authTokens");
const { requireAuth } = require("../middleware/requireAuth");
const { isAdminEmail } = require("../services/admin");
const { isSmsConfigured, generateOtp, sendSms } = require("../services/sms");
const {
  createUser,
  createUserFromGoogle,
  createUserFromPhone,
  findUserByEmail,
  findUserByGoogleSub,
  findUserById,
  findUserByPhone,
  normalizePhone,
  setGoogleSub,
  setUserPassword,
  toPublicUser,
} = require("../db/users");
const { createOtp, verifyOtp, countRecentOtps } = require("../db/otpCodes");
const { createPasswordReset, findValidReset, markResetUsed } = require("../db/passwordResets");

const router = express.Router();

/* ── Email / password ── */

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
    return res.status(401).json({ error: "This account uses Google or phone sign-in" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signAccessToken({ userId: user.id });
  res.json({ token, user: { ...toPublicUser(user), isAdmin: isAdminEmail(user.email) } });
});

/* ── Google ── */

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

/* ── Phone / SMS OTP ── */

router.get("/sms-status", (_req, res) => {
  res.json({ configured: isSmsConfigured() });
});

router.post("/phone/send-otp", async (req, res) => {
  if (!isSmsConfigured()) {
    return res.status(503).json({ error: "SMS sign-in is not configured (missing Twilio credentials)" });
  }

  const phone = normalizePhone(req.body.phone);
  if (!phone || phone.length < 8) {
    return res.status(400).json({ error: "Invalid phone number. Include country code, e.g. +971501234567" });
  }

  const recent = await countRecentOtps(phone, 10);
  if (recent >= 5) {
    return res.status(429).json({ error: "Too many OTP requests. Please wait a few minutes." });
  }

  const code = generateOtp();
  await createOtp(phone, code);

  try {
    await sendSms(phone, `Your Sender Studio verification code is: ${code}`);
  } catch (err) {
    console.error("[send-otp] SMS delivery failed:", err.message);
    return res.status(500).json({ error: "Failed to send SMS. Please try again later." });
  }

  res.json({ ok: true, message: "OTP sent" });
});

router.post("/phone/verify-otp", async (req, res) => {
  if (!isSmsConfigured()) {
    return res.status(503).json({ error: "SMS sign-in is not configured" });
  }

  const phone = normalizePhone(req.body.phone);
  const code = String(req.body.code || "").trim();

  if (!phone || !code) {
    return res.status(400).json({ error: "Phone and code are required" });
  }

  const otp = await verifyOtp(phone, code);
  if (!otp) {
    return res.status(401).json({ error: "Invalid or expired code" });
  }

  let user = await findUserByPhone(phone);
  if (!user) {
    user = await createUserFromPhone({ phone, name: "User" });
  }

  const token = signAccessToken({ userId: user.id });
  res.json({ token, user: { ...toPublicUser(user), isAdmin: isAdminEmail(user.email) } });
});

/* ── Password reset ── */

router.post("/forgot-password", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Email is required" });

  const user = await findUserByEmail(email);
  if (!user) {
    // Don't reveal whether the email exists
    return res.json({ ok: true, message: "If this email exists, a reset link has been sent." });
  }

  const reset = await createPasswordReset(user.id);
  const { getAppConfig } = require("../services/config");
  const cfg = getAppConfig();
  const resetUrl = `${cfg.appBaseUrl}/reset-password?token=${reset.token}`;

  // In production, send this via email. For now, log it.
  process.stdout.write(`[Password Reset] ${user.email} → ${resetUrl}\n`);

  // If SMS is configured and user has a phone, also send via SMS
  if (isSmsConfigured() && user.phone) {
    try {
      await sendSms(user.phone, `Reset your Sender Studio password: ${resetUrl}`);
    } catch {
      // SMS delivery failure is non-fatal for password reset
    }
  }

  res.json({ ok: true, message: "If this email exists, a reset link has been sent." });
});

router.post("/reset-password", async (req, res) => {
  const token = String(req.body.token || "").trim();
  const password = String(req.body.password || "");

  if (!token) return res.status(400).json({ error: "Reset token is required" });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  const reset = await findValidReset(token);
  if (!reset) return res.status(400).json({ error: "Invalid or expired reset link" });

  const passwordHash = await bcrypt.hash(password, 12);
  await setUserPassword(reset.user_id, passwordHash);
  await markResetUsed(reset.id);

  const user = await findUserById(reset.user_id);
  const accessToken = signAccessToken({ userId: user.id });
  res.json({ token: accessToken, user: { ...toPublicUser(user), isAdmin: isAdminEmail(user.email) } });
});

/* ── Session ── */

router.get("/me", requireAuth, async (req, res) => {
  const user = req.user;
  res.json({ user: { ...toPublicUser(user), isAdmin: Boolean(req.isAdmin) } });
});

router.post("/logout", (_req, res) => {
  res.json({ ok: true });
});

module.exports = router;
