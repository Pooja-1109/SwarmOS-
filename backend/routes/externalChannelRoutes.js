const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { verifyWhatsAppWebhook, handleWhatsAppWebhook, handleVoiceWebhook } = require("../controllers/externalChannelController");

router.get("/whatsapp/webhook", verifyWhatsAppWebhook);
router.post("/whatsapp/webhook", handleWhatsAppWebhook);
router.post("/voice/webhook", handleVoiceWebhook);

router.use(protect);

module.exports = router;
