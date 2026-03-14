function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error("Missing GEMINI_API_KEY");
    err.code = "GEMINI_API_KEY_MISSING";
    throw err;
  }
  return apiKey;
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL || "gemini-1.5-flash";
}

async function generateText({ prompt, temperature }) {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message || `Gemini request failed (${res.status})`;
    throw new Error(msg);
  }

  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("\n") || "";
  return text;
}

module.exports = { generateText };

