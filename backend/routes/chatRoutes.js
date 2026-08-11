const express = require("express");
const router = express.Router();
const { sendChatMessage, getChatHistory } = require("../controllers/chatController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", sendChatMessage);
router.get("/:projectId", getChatHistory);

module.exports = router;
