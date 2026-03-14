const path = require("path");
const express = require("express");
const multer = require("multer");

const { generatePersonalizedMessage } = require("../ai/messageGenerator");
const { promisePool } = require("../utils/promisePool");
const { requireAuth } = require("../middleware/requireAuth");
const { getRemaining, getMonthlyLimit } = require("../services/usageLimiter");
const { listCampaigns, getCampaign, createCampaign, setCampaignStatus } = require("../db/campaigns");
const { listLatestContacts, listContacts } = require("../db/contacts");
const { createMessageLog, listCampaignLogs, countCampaignLogsByStatus } = require("../db/messageLogs");
const { createSendJob } = require("../db/sendJobs");

const router = express.Router();

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads");

const upload = multer({
  dest: path.join(uploadsDir, "media"),
  limits: { fileSize: 25 * 1024 * 1024 },
});

function buildCampaignDescription({ campaignIdea, productDescription, promotionDetails }) {
  return [
    String(campaignIdea || "").trim(),
    String(productDescription || "").trim(),
    String(promotionDetails || "").trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

function mediaKindFromMime(mimeType) {
  if (!mimeType) return null;
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";
  return null;
}

router.get("/", requireAuth, async (req, res) => {
  const items = await listCampaigns({ ownerUserId: req.user.id, limit: 100 });
  res.json({ items });
});

router.get("/:id", requireAuth, async (req, res) => {
  const item = await getCampaign({ id: req.params.id, ownerUserId: req.user.id });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ item });
});

router.post("/", requireAuth, upload.single("media"), async (req, res) => {
  const ownerUserId = req.user.id;
  const campaignIdea = String(req.body.campaignIdea || "").trim();
  const productDescription = String(req.body.productDescription || "").trim();
  const promotionDetails = String(req.body.promotionDetails || "").trim();

  if (!campaignIdea || !productDescription || !promotionDetails) {
    return res.status(400).json({ error: "Missing campaign fields" });
  }

  const campaignDescription = buildCampaignDescription({ campaignIdea, productDescription, promotionDetails });

  let media = undefined;
  if (req.file) {
    const kind = mediaKindFromMime(req.file.mimetype);
    if (!kind) return res.status(400).json({ error: "Unsupported media type (image/video/pdf)" });
    media = {
      kind,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };
  }

  const item = await createCampaign({
    ownerUserId,
    campaignIdea,
    productDescription,
    promotionDetails,
    campaignDescription,
    media,
  });

  res.json({ item });
});

router.post("/:id/preview", requireAuth, async (req, res) => {
  const ownerUserId = req.user.id;
  const campaign = await getCampaign({ id: req.params.id, ownerUserId });
  if (!campaign) return res.status(404).json({ error: "Not found" });

  const count = Math.min(Number(req.body.count || 5), 10);
  const contacts = await listLatestContacts({ ownerUserId, limit: count });

  const previews = await promisePool(contacts, 3, async (contact) => {
    const message = await generatePersonalizedMessage({ contact, campaignDescription: campaign.campaignDescription });
    return { contactId: contact._id, name: contact.name, phone: contact.phone, message };
  });

  res.json({ items: previews });
});

router.post("/:id/start", requireAuth, async (req, res) => {
  const ownerUserId = req.user.id;
  const campaign = await getCampaign({ id: req.params.id, ownerUserId });
  if (!campaign) return res.status(404).json({ error: "Not found" });

  const { items: contacts } = await listContacts({ ownerUserId, limit: 5000, offset: 0 });
  if (!contacts.length) return res.status(400).json({ error: "No contacts found" });

  const remaining = await getRemaining(req.user);
  const monthlyLimit = getMonthlyLimit(req.user);
  if (remaining <= 0) {
    return res.status(402).json({
      error: `Monthly limit reached (${monthlyLimit}). Upgrade subscription to send more.`,
      limit: monthlyLimit,
      remaining: 0,
    });
  }

  const contactsToSend = contacts.slice(0, remaining);
  const skipped = Math.max(0, contacts.length - contactsToSend.length);

  await setCampaignStatus({ ownerUserId, id: campaign._id, status: "queued" });

  const now = new Date();

  const created = await promisePool(contactsToSend, 3, async (contact) => {
    const message = await generatePersonalizedMessage({ contact, campaignDescription: campaign.campaignDescription });
    const log = await createMessageLog({
      ownerUserId,
      campaignId: campaign._id,
      contactId: contact._id,
      phone: contact.phone,
      message,
      media: campaign.media || null,
      status: "queued",
    });

    await createSendJob({
      ownerUserId,
      campaignId: campaign._id,
      contactId: contact._id,
      logId: log._id,
      phone: contact.phone,
      message,
      mediaPath: campaign.media?.path || null,
      nextRunAt: now,
    });

    return log._id;
  });

  res.json({ ok: true, queued: created.length, skipped, remainingAfter: Math.max(0, remaining - created.length) });
});

router.get("/:id/logs", requireAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 100), 500);
  const skip = Math.max(Number(req.query.skip || 0), 0);
  const ownerUserId = req.user.id;

  const campaign = await getCampaign({ id: req.params.id, ownerUserId });
  if (!campaign) return res.status(404).json({ error: "Not found" });

  const { items, total } = await listCampaignLogs({ ownerUserId, campaignId: req.params.id, limit, offset: skip });
  res.json({ items, total });
});

router.get("/:id/stats", requireAuth, async (req, res) => {
  const ownerUserId = req.user.id;
  const campaignId = req.params.id;
  const campaign = await getCampaign({ id: campaignId, ownerUserId });
  if (!campaign) return res.status(404).json({ error: "Not found" });

  const stats = await countCampaignLogsByStatus({ ownerUserId, campaignId });
  res.json(stats);
});

module.exports = router;
