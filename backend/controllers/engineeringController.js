const {
  ensureTraceRecords,
  computeSwarmScore,
  runSelfHealingLoop,
  getRequirementTrace,
} = require("../services/engineeringIntelligenceService");

const getProjectRequirements = async (req, res) => {
  try {
    await ensureTraceRecords({ projectId: req.params.projectId, userId: req.user.id });
    const records = await getRequirementTrace(req.params.projectId);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Failed to load requirements." });
  }
};

const getProjectScoring = async (req, res) => {
  try {
    const project = await computeSwarmScore(req.params.projectId);
    res.json({ success: true, data: project?.qualityGate || {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Failed to compute quality gate." });
  }
};

const runRepairCycle = async (req, res) => {
  try {
    const { errorMessage = "Unknown error" } = req.body;
    const result = await runSelfHealingLoop({
      projectId: req.params.projectId,
      userId: req.user.id,
      errorMessage,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Failed to run self-healing cycle." });
  }
};

module.exports = {
  getProjectRequirements,
  getProjectScoring,
  runRepairCycle,
};
