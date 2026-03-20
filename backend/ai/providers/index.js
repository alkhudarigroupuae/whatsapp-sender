const { generateText: generateOpenAiText } = require("./openaiProvider");
const { generateText: generateGeminiText } = require("./geminiProvider");
const { generateText: generateMockText } = require("./mockProvider");

function getProvider() {
  return String(process.env.AI_PROVIDER || "openai").toLowerCase();
}

async function generateText({ prompt, temperature }) {
  const provider = getProvider();
  if (provider === "mock") {
    return generateMockText({ prompt, temperature });
  }
  if (provider === "gemini") {
    return generateGeminiText({ prompt, temperature });
  }
  return generateOpenAiText({ prompt, temperature });
}

module.exports = { generateText, getProvider };
