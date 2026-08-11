const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { handleWhatsAppWebhook, handleVoiceWebhook } = require("../controllers/externalChannelController");

router.post("/whatsapp/webhook", handleWhatsAppWebhook);
router.post("/voice/webhook", handleVoiceWebhook);

router.use(protect);

module.exports = router;
