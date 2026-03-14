const { getOpenAIClient } = require("../openaiClient");

function getOpenAiModel() {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

async function generateText({ prompt, temperature }) {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: getOpenAiModel(),
    temperature,
    messages: [
      {
        role: "system",
        content: "You write natural WhatsApp messages that feel human and non-spammy.",
      },
      { role: "user", content: prompt },
    ],
  });

  return response?.choices?.[0]?.message?.content || "";
}

module.exports = { generateText };

