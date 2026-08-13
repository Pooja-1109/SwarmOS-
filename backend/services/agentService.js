const Project = require("../models/Project");
const Task = require("../models/Task");
const Activity = require("../models/Activity");
const ProjectFile = require("../models/ProjectFile");
const aiService = require("./aiService");

const DEFAULT_AGENTS = [
  { name: "Planner Agent", role: "Requirements Analysis & Task Breakdown", status: "Idle", currentTask: "Awaiting assignment", progress: 0 },
  { name: "Architecture Agent", role: "System & Data Architecture", status: "Idle", currentTask: "Awaiting assignment", progress: 0 },
  { name: "Database Agent", role: "Schema & Persistence Design", status: "Idle", currentTask: "Awaiting assignment", progress: 0 },
  { name: "Backend Agent", role: "API & Business Logic Implementation", status: "Idle", currentTask: "Awaiting assignment", progress: 0 },
  { name: "Frontend Agent", role: "UI/UX & Client Integration", status: "Idle", currentTask: "Awaiting assignment", progress: 0 },
  { name: "Tester Agent", role: "QA & Integration Testing", status: "Idle", currentTask: "Awaiting assignment", progress: 0 },
  { name: "Reviewer Agent", role: "Code Quality & Security Audit", status: "Idle", currentTask: "Awaiting assignment", progress: 0 },
  { name: "Documentation Agent", role: "Technical Docs & API Spec", status: "Idle", currentTask: "Awaiting assignment", progress: 0 },
  { name: "Project Manager Agent", role: "Swarm Orchestration & Progress Tracking", status: "Idle", currentTask: "Awaiting assignment", progress: 0 },
];

/**
 * Ensures a project has the full suite of multi-agents
 */
const initializeProjectAgents = (existingAgents = []) => {
  if (!existingAgents || existingAgents.length === 0) {
    return DEFAULT_AGENTS.map((agent) => ({ ...agent, lastActivity: new Date() }));
  }

  const existingNames = new Set(existingAgents.map((a) => a.name));
  const merged = [...existingAgents];

  DEFAULT_AGENTS.forEach((defAgent) => {
    if (!existingNames.has(defAgent.name)) {
      merged.push({ ...defAgent, lastActivity: new Date() });
    }
  });

  return merged;
};

const addExecutionLog = async (projectId, agentName, message, level = "info") => {
  try {
    await Project.findByIdAndUpdate(projectId, {
      $push: {
        executionLogs: {
          agentName,
          message,
          level,
          timestamp: new Date(),
        },
      },
    });
  } catch (err) {
    console.warn("Log write warning:", err.message);
  }
};

/**
 * Execute full multi-agent swarm pipeline
 */
const runAgentSwarm = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  project.status = "Running";
  project.agents = initializeProjectAgents(project.agents);
  await project.save();

  await addExecutionLog(projectId, "Swarm Orchestrator", `Started multi-agent orchestration for ${project.title}`, "info");

  // Log activity
  await Activity.create({
    projectId: project._id,
    user: userId,
    agentName: "Project Manager Agent",
    action: "Initiated Multi-Agent Swarm",
    details: `Started multi-agent orchestration for project: ${project.title}`,
  });

  // Step 1: Planner Agent analyzes requirements and generates tasks
  const plannerIdx = project.agents.findIndex((a) => a.name.includes("Planner"));
  if (plannerIdx !== -1) {
    project.agents[plannerIdx].status = "Working";
    project.agents[plannerIdx].currentTask = "Analyzing requirements & generating task breakdown";
    project.agents[plannerIdx].progress = 50;
    await project.save();
  }

  const generatedTasks = await aiService.generateTasksFromRequirements(
    project.title,
    project.description,
    project.requirements
  );

  // Clear existing tasks or create new tasks in Task collection
  const existingCount = await Task.countDocuments({ projectId: project._id });
  if (existingCount === 0) {
    for (const t of generatedTasks) {
      await Task.create({
        projectId: project._id,
        title: t.title,
        description: t.description,
        assignedAgent: t.assignedAgent || "Backend Agent",
        priority: t.priority || "Medium",
        status: t.status || "Todo",
        progress: 0,
      });
    }
  }

  if (plannerIdx !== -1) {
    project.agents[plannerIdx].status = "Completed";
    project.agents[plannerIdx].currentTask = `Generated ${generatedTasks.length} project tasks`;
    project.agents[plannerIdx].progress = 100;
    project.agents[plannerIdx].lastActivity = new Date();
    await project.save();
  }

  await addExecutionLog(projectId, "Planner Agent", `Created ${generatedTasks.length} structured development tasks.`, "success");

  await Activity.create({
    projectId: project._id,
    user: userId,
    agentName: "Planner Agent",
    action: "Generated Task Spec",
    details: `Created ${generatedTasks.length} structured development tasks.`,
  });

  // Step 2: Generate and save actual project code & documentation artifacts to MongoDB
  const artifacts = await aiService.generateProjectArtifacts(
    project.title,
    project.description,
    project.category
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

    await addExecutionLog(projectId, file.generatedByAgent, `Generated artifact: ${file.filePath}`, "info");
  }

  const filesCount = await ProjectFile.countDocuments({ projectId: project._id });
  project.generatedFilesCount = filesCount;
  await project.save();

  // Asynchronous Swarm background execution loop
  executeSwarmLoop(project._id, userId).catch((err) => console.error("Swarm background execution error:", err));

  return project;
};

/**
 * Background loop advancing tasks and agent status
 */
const executeSwarmLoop = async (projectId, userId) => {
  const tasks = await Task.find({ projectId });
  if (!tasks || tasks.length === 0) return;

  const project = await Project.findById(projectId);
  if (!project) return;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    // Find assigned agent
    const agentIndex = project.agents.findIndex(
      (a) => a.name === task.assignedAgent || task.assignedAgent.includes(a.name.split(" ")[0])
    );
    if (agentIndex !== -1) {
      project.agents[agentIndex].status = "Working";
      project.agents[agentIndex].currentTask = `Executing: ${task.title}`;
      project.agents[agentIndex].progress = 50;
      await project.save();
    }

    // Update task to In Progress
    task.status = "In Progress";
    task.progress = 50;
    await task.save();

    await addExecutionLog(projectId, task.assignedAgent || "Swarm Agent", `Started task: "${task.title}"`, "info");

    await new Promise((r) => setTimeout(r, 1200)); // Delay between agent steps

    // Update task to Completed
    task.status = "Completed";
    task.progress = 100;
    await task.save();

    await addExecutionLog(projectId, task.assignedAgent || "Swarm Agent", `Completed task: "${task.title}"`, "success");

    // Log Activity
    await Activity.create({
      projectId,
      user: userId,
      agentName: task.assignedAgent || "Developer Agent",
      action: "Completed Task",
      details: `Finished execution of task: "${task.title}"`,
    });

    if (agentIndex !== -1) {
      project.agents[agentIndex].status = "Completed";
      project.agents[agentIndex].progress = 100;
      project.agents[agentIndex].currentTask = `Completed: ${task.title}`;
      project.agents[agentIndex].lastActivity = new Date();
    }

    // Update overall project progress
    const completedTasksCount = await Task.countDocuments({ projectId, status: "Completed" });
    project.progress = Math.min(100, Math.floor((completedTasksCount / tasks.length) * 100));
    await project.save();
  }

  // Finalize project state
  project.status = "Completed";
  project.progress = 100;
  project.currentPhase = "Completed";
  await project.save();

  await addExecutionLog(projectId, "Project Manager Agent", "All multi-agent workflow tasks completed successfully!", "success");

  await Activity.create({
    projectId,
    user: userId,
    agentName: "Project Manager Agent",
    action: "Project Completed",
    details: "All multi-agent workflow tasks completed successfully!",
  });
};

module.exports = {
  initializeProjectAgents,
  runAgentSwarm,
  addExecutionLog,
};

