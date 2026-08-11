const ResearchItem = require("../models/ResearchItem");
const Visualization = require("../models/Visualization");
const DocumentArtifact = require("../models/DocumentArtifact");
const Activity = require("../models/Activity");

const mockResearch = [
  {
    title: "AI-assisted software engineering workflows",
    authors: ["A. Smith", "J. Patel"],
    year: "2024",
    source: "IEEE / software engineering review",
    url: "https://example.com/ai-software-engineering",
    doi: "",
    summary: "Explores agentic software workflows and multi-agent coordination in project development pipelines.",
    relevance: "High",
    projectRelationship: "Project orchestration and agent assignment",
  },
  {
    title: "Secure software lifecycle governance",
    authors: ["K. Doe", "L. Chen"],
    year: "2023",
    source: "ACM Digital Library",
    url: "https://example.com/secure-lifecycle",
    doi: "",
    summary: "Documents quality and security controls for continuous software engineering operations.",
    relevance: "High",
    projectRelationship: "Security and quality gate design",
  },
];

const listResearchItems = async (projectId) => {
  return ResearchItem.find({ projectId }).sort({ createdAt: -1 });
};

const createResearchItems = async ({ projectId, userId, query }) => {
  const items = await ResearchItem.find({ projectId, userId });
  if (items.length > 0) return items;

  const generated = mockResearch.map((item) => ({
    projectId,
    userId,
    ...item,
  }));

  await ResearchItem.insertMany(generated);
  return generated;
};

const createVisualization = async ({ projectId, userId, title, type = "architecture", content, description }) => {
  const entry = await Visualization.create({
    projectId,
    userId,
    title,
    type,
    content,
    description,
  });

  await Activity.create({
    projectId,
    user: userId,
    agentName: "Visualization Agent",
    action: "Diagram Generated",
    details: `Created ${type} visualization: ${title}`,
  });

  return entry;
};

const createDocumentArtifact = async ({ projectId, userId, title, type = "report", content, format = "markdown" }) => {
  const artifact = await DocumentArtifact.create({
    projectId,
    userId,
    title,
    type,
    content,
    format,
  });

  await Activity.create({
    projectId,
    user: userId,
    agentName: "Documentation Agent",
    action: "Document Generated",
    details: `Created ${type} document: ${title}`,
  });

  return artifact;
};

const getVisualizations = async (projectId) => Visualization.find({ projectId }).sort({ createdAt: -1 });
const getDocumentArtifacts = async (projectId) => DocumentArtifact.find({ projectId }).sort({ createdAt: -1 });

module.exports = {
  createResearchItems,
  listResearchItems,
  createVisualization,
  getVisualizations,
  createDocumentArtifact,
  getDocumentArtifacts,
  mockResearch,
};
