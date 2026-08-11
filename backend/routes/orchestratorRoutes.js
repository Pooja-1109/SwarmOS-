const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  handleProjectCommand,
  getProjectCommandMemory,
  getProjectDecisionLog,
} = require("../controllers/orchestratorController");

router.use(protect);

router.post("/project/:projectId/command", handleProjectCommand);
router.get("/project/:projectId/memory", getProjectCommandMemory);
router.get("/project/:projectId/decisions", getProjectDecisionLog);

module.exports = router;
