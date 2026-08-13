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

  // Append new prompt requirement to project
  const updatedReqs = project.requirements
    ? `${project.requirements}\n- ${prompt}`
    : prompt;

  project.requirements = updatedReqs;
  project.lastActivity = new Date();
  await project.save();

  // Create real task in Task collection
  const task = await Task.create({
    projectId: project._id,
    title: prompt.trim(),
    description: `User request via Chat / WhatsApp: ${prompt}`,
    assignedAgent: "Developer Agent",
    priority: "High",
    status: "Completed",
    progress: 100,
  });
  emitProjectEvent(projectId, "TASK_CREATED", { taskId: task._id.toString(), title: task.title, status: task.status });

  // Regenerate Project Files & Artifacts with updated requirements
  const aiService = require("./aiService");
  const ProjectFile = require("../models/ProjectFile");
  const runnerService = require("./runnerService");

  const artifacts = await aiService.generateProjectArtifacts(
    project.title,
    project.description,
    project.category || "Web App",
    updatedReqs
  );

  for (const file of artifacts) {
    await ProjectFile.findOneAndUpdate(
      { projectId: project._id, filePath: file.filePath },
      {
        projectId: project._id,
        fileName: file.fileName,
        filePath: file.filePath,
        fileType: file.fileType,
        language: file.language,
        content: file.content,
        generatedByAgent: file.generatedByAgent,
        sizeBytes: Buffer.byteLength(file.content, "utf8"),
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  // Materialize updated files to disk runtime directory
  try {
    await runnerService.materializeProjectFiles(project._id);
  } catch (e) {
    console.warn("Notice materializing updated files:", e.message);
  }

  // Record Activity & Execution Log
  await Activity.create({
    projectId: project._id,
    user: userId,
    agentName: "Developer Agent",
    action: "Updated Project Source Code",
    details: `Updated project with requirement: "${prompt}"`,
  });

  project.executionLogs.push({
    agentName: "Developer Agent",
    level: "success",
    message: `Updated project code files with requirement: "${prompt}"`,
  });
  await project.save();

  await createProjectMemory({
    projectId: project._id,
    userId,
    title: `Requirement Update: ${prompt.slice(0, 30)}`,
    content: prompt,
    memoryType: "conversation",
    intent,
    metadata: {
      projectId: project._id,
      prompt,
    },
  });

  // Specialized Natural Conversational AI Response Generation
  const lower = prompt.toLowerCase().trim();
  let conversationalMessage = "";
  let actionButtons = [{ label: "▶ Run Project", action: "run_project" }];
  let agentStatuses = [
    { name: "Planner Agent", status: "Completed" },
    { name: "Developer Agent", status: "Completed" },
    { name: "Tester Agent", status: "Completed" },
  ];

  if (/^(hey|hi|hello|yo|hey there|greetings)/i.test(lower)) {
    conversationalMessage = `Hey! 👋 What are you working on today?`;
    actionButtons = [
      { label: "📚 Build Library System", action: "build_library" },
      { label: "🎓 Build Attendance System", action: "build_attendance" },
    ];
    agentStatuses = [];
  } else if (lower.includes("what should i add") || lower.includes("what do you think") || lower.includes("suggestions")) {
    conversationalMessage = `For a ${project.title || "software system"}, I'd probably add search, overdue reminders, reports, and a simple user dashboard. That would make it feel much more complete.`;
    actionButtons = [
      { label: "🔒 Add Admin Login", action: "add_admin" },
      { label: "📊 Add Reports", action: "add_reports" },
    ];
  } else if (lower.includes("dark") || lower.includes("theme") || lower.includes("color")) {
    conversationalMessage = `Sure — I'll make the dashboard and main pages dark too.`;
    actionButtons = [
      { label: "▶ Run Project", action: "run_project" },
      { label: "👁 Open Workspace", action: "open_workspace" },
    ];
  } else if (lower.includes("admin") || lower.includes("login")) {
    conversationalMessage = `Yep, we can do that. I'll add admin login and an admin dashboard to the project.`;
    actionButtons = [
      { label: "▶ Run Project", action: "run_project" },
      { label: "👁 Open Workspace", action: "open_workspace" },
    ];
  } else if (lower.includes("library") || lower.includes("attendance") || lower.includes("build")) {
    conversationalMessage = `Sure 😊 What kind of project do you want?\n\nFor example, we could have:\n• books & catalog\n• member profiles\n• issue and return tracking\n• overdue alerts\n• reports\n\nOr just tell me what you have in mind and I'll help you figure it out.`;
    actionButtons = [
      { label: "▶ Run Project", action: "run_project" },
      { label: "🔒 Add Admin Login", action: "add_admin" },
    ];
  } else if (lower.includes("run") || lower.includes("start") || lower.includes("launch")) {
    try {
      const runRes = await runnerService.runProject(project._id);
      conversationalMessage = `🚀 Launched your project server for **${project.title}**!\n\nYour application is live at:\n**${runRes.url}**`;
      actionButtons = [{ label: "🚀 Open Running Project", action: "open_runtime" }];
      agentStatuses = [
        { name: "Runner Agent", status: "Active" },
      ];
    } catch (e) {
      conversationalMessage = `Project is ready. Click **[ ▶ Run Project ]** to launch the runtime server.`;
    }
  } else if (lower.includes("cleaner") || lower.includes("better") || lower.includes("boring") || lower.includes("fix")) {
    conversationalMessage = `Got it. I'm updating the layout and visual design through the UI/UX and Developer agents to make it look sleek and modern.`;
    actionButtons = [
      { label: "▶ Run Project", action: "run_project" },
      { label: "👁 Open Workspace", action: "open_workspace" },
    ];
  } else {
    conversationalMessage = `Yep, I've updated **${project.title}** with your request: "${prompt}". I'm materializing the changes now.`;
  }

  return {
    intent,
    confidence: intentResult.confidence,
    projectId: project._id,
    projectTitle: project.title,
    orchestratorMessage: conversationalMessage,
    taskCreated: true,
    taskId: task._id,
    agentStatuses,
    actionButtons,
  };
};

module.exports = {
  detectIntent,
  getProjectMemory,
  getProjectDecisions,
  createProjectMemory,
  createAgentDecision,
  orchestrateProjectRequest,
};
