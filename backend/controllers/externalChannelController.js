const { handleExternalCommand } = require("../services/externalChannelAdapterService");
const { verifySignature } = require("../middleware/externalChannelMiddleware");

const handleWhatsAppWebhook = async (req, res) => {
  try {
    if (!verifySignature({ headers: req.headers, rawBody: JSON.stringify(req.body), provider: "whatsapp" })) {
      return res.status(401).json({ success: false, error: "Invalid WhatsApp webhook signature." });
    }

    const result = await handleExternalCommand({
      source: "whatsapp",
      payload: req.body,
      userId: req.user?.id,
    });

    res.json({ success: true, data: result, source: "whatsapp" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Unable to process WhatsApp command." });
  }
};

const handleVoiceWebhook = async (req, res) => {
  try {
    if (!verifySignature({ headers: req.headers, rawBody: JSON.stringify(req.body), provider: "voice" })) {
      return res.status(401).json({ success: false, error: "Invalid voice webhook signature." });
    }

    const result = await handleExternalCommand({
      source: "voice",
      payload: req.body,
      userId: req.user?.id,
    });

    res.json({ success: true, data: result, source: "voice" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Unable to process voice command." });
  }
};

const verifyWhatsAppWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "swarmos_verify_token";

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      console.log("✅ Meta WhatsApp Webhook verified successfully");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.status(200).json({ status: "SwarmOS WhatsApp Webhook Endpoint Active", mode: process.env.WHATSAPP_MODE || "mock" });
};

module.exports = {
  verifyWhatsAppWebhook,
  handleWhatsAppWebhook,
  handleVoiceWebhook,
};
