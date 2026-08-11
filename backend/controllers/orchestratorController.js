const {
  orchestrateProjectRequest,
  getProjectMemory,
  getProjectDecisions,
} = require("../services/orchestratorService");

const handleProjectCommand = async (req, res) => {
  try {
    const { prompt } = req.body;
    const { projectId } = req.params;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "A project command is required.",
      });
    }

    const result = await orchestrateProjectRequest({
      projectId,
      userId: req.user.id,
      prompt,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process project command.",
    });
  }
};

const getProjectCommandMemory = async (req, res) => {
  try {
    const { projectId } = req.params;
    const records = await getProjectMemory(projectId);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load project memory.",
    });
  }
};

const getProjectDecisionLog = async (req, res) => {
  try {
    const { projectId } = req.params;
    const records = await getProjectDecisions(projectId);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load project decisions.",
    });
  }
};

module.exports = {
  handleProjectCommand,
  getProjectCommandMemory,
  getProjectDecisionLog,
};
