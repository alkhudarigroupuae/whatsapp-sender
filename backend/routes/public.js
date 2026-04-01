const express = require("express");

const { getAppConfig } = require("../services/config");
const { isSmsConfigured } = require("../services/sms");

const router = express.Router();

router.get("/config", (_req, res) => {
  const cfg = getAppConfig();
  res.json({
    limits: {
      freeMonthly: cfg.freeMonthlyLimit,
      proMonthly: cfg.proMonthlyLimit,
    },
    sending: {
      maxPerHour: cfg.maxMessagesPerHour,
      maxPerMinute: cfg.maxMessagesPerMinute,
      minDelaySeconds: cfg.minDelaySeconds,
      maxDelaySeconds: cfg.maxDelaySeconds,
    },
    auth: {
      google: Boolean(process.env.GOOGLE_CLIENT_ID),
      sms: isSmsConfigured(),
    },
  });
});

module.exports = router;
