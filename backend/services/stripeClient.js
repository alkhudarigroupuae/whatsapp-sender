const Stripe = require("stripe");

let stripe = null;

function getStripe() {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    const err = new Error("Missing STRIPE_SECRET_KEY");
    err.code = "STRIPE_SECRET_KEY_MISSING";
    throw err;
  }
  stripe = new Stripe(key);
  return stripe;
}

module.exports = { getStripe };

