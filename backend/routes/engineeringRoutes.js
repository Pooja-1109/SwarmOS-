const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getProjectRequirements,
  getProjectScoring,
  runRepairCycle,
} = require("../controllers/engineeringController");

router.use(protect);

router.get("/project/:projectId/requirements", getProjectRequirements);
router.get("/project/:projectId/quality-gate", getProjectScoring);
router.post("/project/:projectId/self-heal", runRepairCycle);

module.exports = router;
