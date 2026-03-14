const OpenAI = require("openai");

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error("Missing OPENAI_API_KEY");
    err.code = "OPENAI_API_KEY_MISSING";
    throw err;
  }

  return new OpenAI({ apiKey });
}

module.exports = { getOpenAIClient };

