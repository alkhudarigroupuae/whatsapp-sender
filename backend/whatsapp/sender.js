const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");
const { getClient } = require("./client");
const { toChatId } = require("../utils/phone");

async function sendWhatsAppMessage(ownerUserId, phoneDigits, message, mediaPath) {
  const client = getClient(ownerUserId);
  const chatId = toChatId(phoneDigits);

  if (mediaPath) {
    const absPath = path.isAbsolute(mediaPath) ? mediaPath : path.join(process.cwd(), mediaPath);
    const media = MessageMedia.fromFilePath(absPath);
    return client.sendMessage(chatId, media, { caption: message || "" });
  }

  return client.sendMessage(chatId, message);
}

module.exports = { sendWhatsAppMessage };
