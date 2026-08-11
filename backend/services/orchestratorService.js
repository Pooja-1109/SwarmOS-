const Project = require("../models/Project");
const Task = require("../models/Task");
const ProjectMemory = require("../models/ProjectMemory");
const AgentDecision = require("../models/AgentDecision");
const Activity = require("../models/Activity");
const { emitProjectEvent } = require("../controllers/projectController");

const INTENT_KEYWORDS = {
  BUILD: ["build", "create", "develop", "make", "prototype", "generate project", "new project"],
  MODIFY: ["add", "update", "modify", "change", "improve", "enhance", "extend"],
  DEBUG: ["debug", "error", "bug", "fix", "broken", "failing", "why is", "login failing"],
  RESEARCH: ["research", "papers", "literature", "study", "compare", "gap", "related work"],
  EXPLAIN: ["explain", "what is", "why", "how does", "describe"],
  VISUALIZE: ["show architecture", "visualize", "diagram", "flow", "er diagram", "sequence diagram"],
  DOCUMENT: ["document", "documentation", "report", "abstract", "readme", "api docs"],
  TEST: ["test", "run tests", "quality gate", "qa", "verify"],
  SECURITY: ["security", "vulnerability", "scan", "auth", "authorization", "secret"],
  PROJECT_STATUS: ["status", "progress", "what is my project", "project health", "swarm score"],
  DEPLOY: ["deploy", "preview", "release", "launch"],
};

const detectIntent = (prompt = "") => {
  const normalized = (prompt || "").toLowerCase();

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return {
        intent,
        confidence: 0.88,
      };
    }
  }

  return { intent: "GENERAL", confidence: 0.5 };
};

const createProjectMemory = async ({ projectId, userId, title, content, memoryType = "conversation", intent = "GENERAL", metadata = {} }) => {
  if (!projectId || !userId) return null;

  return ProjectMemory.create({
    projectId,
    userId,
    title,
    content,
    memoryType,
    intent,
    metadata,
  });
};

const createAgentDecision = async ({ projectId, userId, question, options = [], agentOpinions = [], finalDecision = "", reason = "" }) => {
  if (!projectId || !userId || !question) return null;

  return AgentDecision.create({
    projectId,
    userId,
    question,
    options,
    agentOpinions,
    finalDecision,
    reason,
  });
};

const getProjectMemory = async (projectId) => {
  return ProjectMemory.find({ projectId }).sort({ createdAt: -1 }).limit(25);
};

const getProjectDecisions = async (projectId) => {
  return AgentDecision.find({ projectId }).sort({ createdAt: -1 }).limit(20);
};

const orchestrateProjectRequest = async ({ projectId, userId, prompt }) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const intentResult = detectIntent(prompt);
  const intent = intentResult.intent;

  const projectSummary = {
    title: project.title,
    status: project.status,
    progress: project.progress,
    category: project.category,
    updatedAt: project.updatedAt,
  };

  const memoryEntry = await createProjectMemory({
    projectId,
    userId,
    title: `Intent: ${intent}`,
    content: prompt,
    memoryType: "conversation",
    intent,
    metadata: {
      projectSummary,
      confidence: intentResult.confidence,
    },
  });

  await Activity.create({
    projectId,
    user: userId,
    agentName: "Swarm Orchestrator",
    action: "Intent Detected",
    details: `Classified request as ${intent} for ${project.title}`,
  });

  const response = {
    intent,
    confidence: intentResult.confidence,
    project: {
      id: project._id,
      title: project.title,
      status: project.status,
      progress: project.progress,
    },
    orchestratorMessage: `SwarmOS classified this as ${intent}. The request is queued for the relevant project workflow.`,
    suggestions: [
      "Create requirements",
      "Review architecture",
      "Run security scan",
      "Generate project documentation",
    ],
    memoryId: memoryEntry?._id,
  };

  if (intent === "PROJECT_STATUS") {
    const pendingTasks = await Task.countDocuments({ projectId, status: { $nin: ["Completed", "Cancelled"] } });
    response.orchestratorMessage = `Project status for ${project.title}: ${project.status} with ${project.progress}% progress. Pending tasks: ${pendingTasks}.`;
  }

  if (intent === "BUILD") {
    project.status = project.status === "Planning" ? "Active" : project.status;
    project.progress = Math.max(project.progress, 15);
    project.currentPhase = "Planning";
    project.lastActivity = new Date();
    await project.save();
    emitProjectEvent(projectId, "PROJECT_STARTED", { projectId: String(projectId), title: project.title, progress: project.progress });

    await createProjectMemory({
      projectId,
      userId,
      title: "Execution plan",
      content: `Project action queued for ${intent}. Requirements and execution planning should continue through the project workflow.`,
      memoryType: "summary",
      intent,
      metadata: { stage: "planning" },
    });

    response.orchestratorMessage = `🚀 Got it. I've started your ${project.title}. I'll notify you as the agents complete their work.`;
    response.taskCreated = true;
  }

  if (intent === "MODIFY") {
    const task = await Task.create({
      projectId,
      title: prompt.trim(),
      description: `User request from orchestrator: ${prompt}`,
      assignedAgent: "Backend Agent",
      priority: "Medium",
      status: "Queued",
      progress: 0,
    });
    emitProjectEvent(projectId, "TASK_CREATED", { taskId: task._id.toString(), title: task.title, status: task.status });
    response.orchestratorMessage = `🔧 Added your request to the project.\nTask:\n${task.title}\n\nStatus:\nQueued`;
    response.taskId = task._id;
  }

  if (intent === "DEBUG") {
    response.suggestions = [
      "Inspect recent activity logs",
      "Review authentication flow",
      "Run targeted test suite",
      "Request human approval if the failure persists",
    ];
  }

  return response;
};

module.exports = {
  detectIntent,
  getProjectMemory,
  getProjectDecisions,
  createProjectMemory,
  createAgentDecision,
  orchestrateProjectRequest,
};
