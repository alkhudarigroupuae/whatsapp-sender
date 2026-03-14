const express = require("express");

const { requireAuth } = require("../middleware/requireAuth");
const { findCampaignByMediaFilename } = require("../db/campaigns");

const router = express.Router();

router.get("/:filename", requireAuth, async (req, res) => {
  const filename = String(req.params.filename || "");

  const campaign = await findCampaignByMediaFilename({ ownerUserId: req.user.id, filename });
  const mediaPath = campaign?.media?.path;
  if (!mediaPath) return res.status(404).json({ error: "Not found" });

  res.sendFile(mediaPath);
});

module.exports = router;
