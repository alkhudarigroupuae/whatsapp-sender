const { query } = require("./pool");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    plan: row.plan,
    stripeSubscriptionStatus: row.stripe_subscription_status || null,
  };
}

async function findUserByEmail(email) {
  const normalized = normalizeEmail(email);
  const res = await query("select * from users where email = $1 limit 1", [normalized]);
  return res.rows[0] || null;
}

async function findUserById(id) {
  const res = await query("select * from users where id = $1 limit 1", [id]);
  return res.rows[0] || null;
}

async function createUser({ email, name, passwordHash }) {
  const res = await query(
    `insert into users(email, name, password_hash)
     values ($1, $2, $3)
     returning *`,
    [normalizeEmail(email), String(name || "").trim(), passwordHash],
  );
  return res.rows[0];
}

async function setStripeFieldsByCustomerId({
  stripeCustomerId,
  stripeSubscriptionId,
  stripeSubscriptionStatus,
  plan,
}) {
  const res = await query(
    `update users
     set stripe_subscription_id = $2,
         stripe_subscription_status = $3,
         plan = $4,
         updated_at = now()
     where stripe_customer_id = $1
     returning *`,
    [stripeCustomerId, stripeSubscriptionId, stripeSubscriptionStatus, plan],
  );
  return res.rows[0] || null;
}

async function setStripeCustomerId(userId, stripeCustomerId) {
  const res = await query(
    `update users
     set stripe_customer_id = $2, updated_at = now()
     where id = $1
     returning *`,
    [userId, stripeCustomerId],
  );
  return res.rows[0] || null;
}

async function setStripeFieldsByUserId({ userId, stripeCustomerId, stripeSubscriptionId, stripeSubscriptionStatus, plan }) {
  const res = await query(
    `update users
     set stripe_customer_id = $2,
         stripe_subscription_id = $3,
         stripe_subscription_status = $4,
         plan = $5,
         updated_at = now()
     where id = $1
     returning *`,
    [userId, stripeCustomerId || null, stripeSubscriptionId || null, stripeSubscriptionStatus || null, plan],
  );
  return res.rows[0] || null;
}

async function setStripeFieldsBySubscriptionId({ stripeSubscriptionId, stripeSubscriptionStatus, plan }) {
  const res = await query(
    `update users
     set stripe_subscription_status = $2,
         plan = $3,
         updated_at = now()
     where stripe_subscription_id = $1
     returning *`,
    [stripeSubscriptionId, stripeSubscriptionStatus || null, plan],
  );
  return res.rows[0] || null;
}

module.exports = {
  normalizeEmail,
  toPublicUser,
  findUserByEmail,
  findUserById,
  createUser,
  setStripeCustomerId,
  setStripeFieldsByCustomerId,
  setStripeFieldsByUserId,
  setStripeFieldsBySubscriptionId,
};
