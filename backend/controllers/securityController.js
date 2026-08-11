const {
  generateSecurityScan,
  runProjectTests,
  getProjectSecurityFindings,
  getProjectTestRuns,
} = require("../services/securityAndTestingService");

const handleSecurityScan = async (req, res) => {
  try {
    const result = await generateSecurityScan({
      projectId: req.params.projectId,
      userId: req.user.id,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Failed to run security scan." });
  }
};

const getSecurityReport = async (req, res) => {
  try {
    const results = await getProjectSecurityFindings(req.params.projectId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Failed to load security report." });
  }
};

const handleTestRun = async (req, res) => {
  try {
    const result = await runProjectTests({
      projectId: req.params.projectId,
      userId: req.user.id,
      testName: req.body?.testName || "Swarm Project Validation",
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Failed to run test suite." });
  }
};

const getTestReport = async (req, res) => {
  try {
    const results = await getProjectTestRuns(req.params.projectId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Failed to load test report." });
  }
};

module.exports = {
  handleSecurityScan,
  handleTestRun,
  getSecurityReport,
  getTestReport,
};
