const express = require("express");

const { requireAuth } = require("../middleware/requireAuth");
const { getStripe } = require("../services/stripeClient");
const { getMonthlyLimit, getRemaining, isPaidUser } = require("../services/usageLimiter");
const { getAppConfig } = require("../services/config");
const { findUserById, setStripeCustomerId, setStripeFieldsBySubscriptionId, setStripeFieldsByUserId, toPublicUser } = require("../db/users");

const router = express.Router();

function getProPriceId() {
  const priceId = process.env.STRIPE_PRICE_ID_PRO;
  if (!priceId) {
    const err = new Error("Missing STRIPE_PRICE_ID_PRO");
    err.code = "STRIPE_PRICE_ID_PRO_MISSING";
    throw err;
  }
  return priceId;
}

router.get("/me", requireAuth, async (req, res) => {
  const user = await findUserById(req.user.id);
  const remaining = await getRemaining(user);
  const limit = getMonthlyLimit(user);
  const paid = isPaidUser(user);
  res.json({
    user: toPublicUser(user),
    quota: { limit, remaining, paid },
  });
});

router.post("/checkout", requireAuth, async (req, res) => {
  const stripe = getStripe();
  const cfg = getAppConfig();
  const baseUrl = cfg.appBaseUrl;
  const user = await findUserById(req.user.id);

  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await setStripeCustomerId(user.id, customerId);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: getProPriceId(), quantity: 1 }],
    success_url: `${baseUrl}/app/billing?success=1`,
    cancel_url: `${baseUrl}/app/billing?canceled=1`,
    allow_promotion_codes: true,
  });

  res.json({ url: session.url });
});

router.post("/portal", requireAuth, async (req, res) => {
  const stripe = getStripe();
  const cfg = getAppConfig();
  const baseUrl = cfg.appBaseUrl;
  const user = await findUserById(req.user.id);
  if (!user?.stripe_customer_id) return res.status(400).json({ error: "No Stripe customer" });

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${baseUrl}/app/billing`,
  });

  res.json({ url: session.url });
});

async function handleStripeWebhook(req, res) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");

  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, secret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.userId;
      const subscriptionId = session.subscription;
      const customerId = session.customer;

      if (userId && subscriptionId) {
        await setStripeFieldsByUserId({
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripeSubscriptionStatus: "active",
          plan: "pro",
        });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const status = sub.status;
      const isActive = status === "active" || status === "trialing";
      await setStripeFieldsBySubscriptionId({
        stripeSubscriptionId: sub.id,
        stripeSubscriptionStatus: status,
        plan: isActive ? "pro" : "free",
      });
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).send(String(err?.message || err));
  }
}

module.exports = { billingRouter: router, handleStripeWebhook };
