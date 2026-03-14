const express = require("express");

const { createContactMessage } = require("../db/contactMessages");

const router = express.Router();

router.post("/", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!name || !email || !message) return res.status(400).json({ error: "Missing fields" });
  if (name.length > 100) return res.status(400).json({ error: "Name too long" });
  if (email.length > 200) return res.status(400).json({ error: "Email too long" });
  if (message.length > 4000) return res.status(400).json({ error: "Message too long" });

  const doc = await createContactMessage({ name, email, message, ip: req.ip, userAgent: req.headers["user-agent"] });
  return res.json({ ok: true, id: doc.id });
});

module.exports = router;
