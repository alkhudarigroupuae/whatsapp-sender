const { getOrCreateUsage, incrementUsage } = require("../db/usage");
const { getAppConfig } = require("./config");

function getPeriodKey(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function isPaidUser(user) {
  const status = String(user.stripe_subscription_status || user.stripeSubscriptionStatus || "");
  return user.plan === "pro" && (status === "active" || status === "trialing");
}

function getMonthlyLimit(user) {
  const cfg = getAppConfig();
  if (isPaidUser(user)) {
    return cfg.proMonthlyLimit;
  }
  return cfg.freeMonthlyLimit;
}

async function getUsage(ownerUserId, date = new Date()) {
  const periodKey = getPeriodKey(date);
  return getOrCreateUsage({ ownerUserId, periodKey });
}

async function getRemaining(user, date = new Date()) {
  const limit = getMonthlyLimit(user);
  const usage = await getUsage(user.id, date);
  return Math.max(0, limit - usage.sentCount);
}

async function incrementSent(ownerUserId, date = new Date(), count = 1) {
  const periodKey = getPeriodKey(date);
  await incrementUsage({ ownerUserId, periodKey, count });
}

module.exports = { getMonthlyLimit, getRemaining, incrementSent, isPaidUser };
