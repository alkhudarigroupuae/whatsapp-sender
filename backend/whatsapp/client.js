const path = require("path");
const { Client, LocalAuth } = require("whatsapp-web.js");

const clients = new Map();
const states = new Map();

function sanitizeId(id) {
  return String(id || "").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function getOrCreateState(userId) {
  const key = sanitizeId(userId);
  const existing = states.get(key);
  if (existing) return existing;
  const fresh = {
    status: "starting",
    qr: null,
    lastError: null,
    lastEventAt: null,
  };
  states.set(key, fresh);
  return fresh;
}

function getStatus(userId) {
  const state = getOrCreateState(userId);
  return { ...state, qr: undefined };
}

function getQr(userId) {
  return getOrCreateState(userId).qr;
}

function createClient(userId) {
  const safeUserId = sanitizeId(userId);
  const sessionBasePath = process.env.WHATSAPP_SESSION_PATH || path.join(__dirname, ".session");
  const dataPath = path.join(sessionBasePath, safeUserId);

  return new Client({
    authStrategy: new LocalAuth({ clientId: safeUserId, dataPath }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });
}

function initWhatsApp(userId) {
  const safeUserId = sanitizeId(userId);
  if (!safeUserId) throw new Error("Missing userId for WhatsApp session");

  const existing = clients.get(safeUserId);
  if (existing) return existing;

  const state = getOrCreateState(safeUserId);
  const client = createClient(safeUserId);
  clients.set(safeUserId, client);

  client.on("qr", (qr) => {
    state.status = "qr";
    state.qr = qr;
    state.lastEventAt = new Date().toISOString();
  });

  client.on("authenticated", () => {
    state.status = "authenticated";
    state.qr = null;
    state.lastEventAt = new Date().toISOString();
  });

  client.on("ready", () => {
    state.status = "ready";
    state.qr = null;
    state.lastEventAt = new Date().toISOString();
  });

  client.on("auth_failure", (msg) => {
    state.status = "auth_failure";
    state.lastError = String(msg || "auth_failure");
    state.lastEventAt = new Date().toISOString();
  });

  client.on("disconnected", (reason) => {
    state.status = "disconnected";
    state.lastError = String(reason || "disconnected");
    state.lastEventAt = new Date().toISOString();
    setTimeout(() => {
      client.initialize().catch((err) => {
        state.status = "error";
        state.lastError = String(err?.message || err);
        state.lastEventAt = new Date().toISOString();
      });
    }, 3000);
  });

  client.initialize().catch((err) => {
    state.status = "error";
    state.lastError = String(err?.message || err);
    state.lastEventAt = new Date().toISOString();
  });

  return client;
}

function getClient(userId) {
  return clients.get(sanitizeId(userId)) || initWhatsApp(userId);
}

async function logout(userId) {
  const safeUserId = sanitizeId(userId);
  const client = clients.get(safeUserId);
  if (!client) return;
  await client.logout();
  await client.destroy();
  clients.delete(safeUserId);
  states.delete(safeUserId);
}

module.exports = { initWhatsApp, getClient, getStatus, getQr, logout };
