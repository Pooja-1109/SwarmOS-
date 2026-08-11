const express = require("express");
const router = express.Router();
const { startAgents, getProjectAgents, runSingleAgent } = require("../controllers/agentController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.post("/:id/start", startAgents);
router.get("/:id", getProjectAgents);
router.post("/:id/run-agent", runSingleAgent);

module.exports = router;