const express = require("express");

const { getStatus, getQr, logout, initWhatsApp } = require("../whatsapp/client");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.get("/status", requireAuth, (req, res) => {
  res.json({ status: getStatus(req.user.id) });
});

router.get("/qr", requireAuth, (_req, res) => {
  const qr = getQr(_req.user.id);
  res.json({ qr });
});

router.post("/reconnect", requireAuth, async (req, res) => {
  initWhatsApp(req.user.id);
  res.json({ ok: true });
});

router.post("/logout", requireAuth, async (req, res) => {
  await logout(req.user.id);
  res.json({ ok: true });
});

module.exports = router;
