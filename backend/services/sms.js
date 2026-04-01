const twilio = require("twilio");

let client = null;

function getTwilioClient() {
  if (client) return client;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  client = twilio(sid, token);
  return client;
}

function getTwilioFrom() {
  return process.env.TWILIO_PHONE_NUMBER || null;
}

function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER,
  );
}

function generateOtp() {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  return code;
}

async function sendSms(to, body) {
  const cl = getTwilioClient();
  if (!cl) throw new Error("SMS is not configured (missing Twilio credentials)");
  const from = getTwilioFrom();
  if (!from) throw new Error("SMS is not configured (missing TWILIO_PHONE_NUMBER)");
  await cl.messages.create({ body, to, from });
}

module.exports = { isSmsConfigured, generateOtp, sendSms };
