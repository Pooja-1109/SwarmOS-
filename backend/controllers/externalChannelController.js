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

module.exports = {
  handleWhatsAppWebhook,
  handleVoiceWebhook,
};
