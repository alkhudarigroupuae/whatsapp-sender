function generateText({ prompt }) {
  const text = String(prompt || "").trim();
  const offerLine = text
    .split("\n")
    .find((l) => l.toLowerCase().startsWith("offer:")) || "";
  const offer = offerLine.replace(/^offer:\s*/i, "").trim();

  const nameLine = text
    .split("\n")
    .find((l) => l.toLowerCase().startsWith("client name:")) || "";
  const name = nameLine.replace(/^client name:\s*/i, "").trim();

  const who = name ? `Hi ${name},` : "Hi there,";
  const msg = offer ? `${who} quick note: ${offer}` : `${who} quick note about our latest offer.`;
  return Promise.resolve(msg);
}

module.exports = { generateText };

