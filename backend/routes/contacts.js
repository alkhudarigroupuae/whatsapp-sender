const path = require("path");
const express = require("express");
const multer = require("multer");

const { importContactsFromUpload } = require("../services/contactImport");
const { normalizePhone } = require("../utils/phone");
const { requireAuth } = require("../middleware/requireAuth");
const { deleteContact, listContacts, upsertContact } = require("../db/contacts");

const router = express.Router();

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads");

const upload = multer({
  dest: path.join(uploadsDir, "imports"),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/", requireAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 100), 500);
  const skip = Math.max(Number(req.query.skip || 0), 0);
  const ownerUserId = req.user.id;
  const { items, total } = await listContacts({ ownerUserId, limit, offset: skip });
  res.json({ items, total });
});

router.post("/", requireAuth, async (req, res) => {
  const ownerUserId = req.user.id;
  const phone = normalizePhone(req.body.phone);
  if (!phone) return res.status(400).json({ error: "Invalid phone" });

  const contact = await upsertContact({
    ownerUserId,
    phone,
    name: String(req.body.name || "").trim(),
    company: String(req.body.company || "").trim(),
    notes: String(req.body.notes || "").trim(),
  });

  res.json({ item: contact });
});

router.post("/import", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Missing file" });
  const result = await importContactsFromUpload(req.file, req.user.id);
  res.json(result);
});

router.delete("/:id", requireAuth, async (req, res) => {
  await deleteContact({ id: req.params.id, ownerUserId: req.user.id });
  res.json({ ok: true });
});

module.exports = router;
