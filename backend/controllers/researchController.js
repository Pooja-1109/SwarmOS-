const {
  createResearchItems,
  listResearchItems,
  createVisualization,
  getVisualizations,
  createDocumentArtifact,
  getDocumentArtifacts,
} = require("../services/researchVisualizationService");

const handleResearchRequest = async (req, res) => {
  try {
    const { query } = req.body;
    const result = await createResearchItems({
      projectId: req.params.projectId,
      userId: req.user.id,
      query,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Research lookup failed." });
  }
};

const listResearch = async (req, res) => {
  try {
    const result = await listResearchItems(req.params.projectId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Could not load project research." });
  }
};

const createDiagram = async (req, res) => {
  try {
    const result = await createVisualization({
      projectId: req.params.projectId,
      userId: req.user.id,
      title: req.body?.title || "System Architecture",
      type: req.body?.type || "architecture",
      content: req.body?.content || "flowchart TD\nA[User] --> B[SwarmOS] --> C[Agents] --> D[Project Memory]\nD --> E[System Output]",
      description: req.body?.description || "Generated project architecture visualization",
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Diagram generation failed." });
  }
};

const listDiagrams = async (req, res) => {
  try {
    const result = await getVisualizations(req.params.projectId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Could not load visualizations." });
  }
};

const createDocument = async (req, res) => {
  try {
    const result = await createDocumentArtifact({
      projectId: req.params.projectId,
      userId: req.user.id,
      title: req.body?.title || "Project Report",
      type: req.body?.type || "report",
      content: req.body?.content || "# Project Report\n\nThis report was generated from the active project context.",
      format: req.body?.format || "markdown",
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Document generation failed." });
  }
};

const listDocuments = async (req, res) => {
  try {
    const result = await getDocumentArtifacts(req.params.projectId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Could not load project documents." });
  }
};

module.exports = {
  handleResearchRequest,
  listResearch,
  createDiagram,
  listDiagrams,
  createDocument,
  listDocuments,
};
