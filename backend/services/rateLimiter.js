const { getOrCreateRateLimitRow, incrementSent, resetWindow } = require("../db/rateLimits");
const { getAppConfig } = require("./config");

const KEY = "whatsapp_sender";
const WINDOW_MS = 60 * 60 * 1000;

function buildKey(ownerUserId) {
  return `${KEY}:${ownerUserId}`;
}

async function getWaitMs(ownerUserId, now) {
  const cfg = getAppConfig();
  const key = buildKey(ownerUserId);
  const row = await getOrCreateRateLimitRow({ key, now });
  const windowStart = new Date(row.windowStart);
  const elapsed = now.getTime() - windowStart.getTime();

  if (elapsed >= WINDOW_MS) {
    await resetWindow({ key, now, sentCount: 0 });
    return 0;
  }

  if (row.sentCount >= cfg.maxMessagesPerHour) {
    return windowStart.getTime() + WINDOW_MS - now.getTime();
  }

  return 0;
}

async function increment(ownerUserId, now) {
  const key = buildKey(ownerUserId);
  const row = await getOrCreateRateLimitRow({ key, now });
  const windowStart = new Date(row.windowStart);
  const elapsed = now.getTime() - windowStart.getTime();

  if (elapsed >= WINDOW_MS) {
    await resetWindow({ key, now, sentCount: 1 });
    return;
  }

  await incrementSent({ key });
}

module.exports = { getWaitMs, increment };
