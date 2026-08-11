const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { listProjectChannels, saveProjectChannel, syncProjectChannelState, runProjectCommandFromChannel } = require("../controllers/channelController");

router.use(protect);

router.get("/project/:projectId", listProjectChannels);
router.post("/project/:projectId", saveProjectChannel);
router.post("/project/:projectId/sync", syncProjectChannelState);
router.post("/project/:projectId/command", runProjectCommandFromChannel);

module.exports = router;
