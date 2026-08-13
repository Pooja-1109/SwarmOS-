const Project = require("../models/Project");
const Task = require("../models/Task");
const Document = require("../models/Document");
const Activity = require("../models/Activity");
const Message = require("../models/Message");
const ProjectFile = require("../models/ProjectFile");
const { initializeProjectAgents } = require("../services/agentService");

const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crc32Table[i] = c;
}

function calculateCRC32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function generateZipBuffer(files) {
  const buffers = [];
  const cdEntries = [];
  let offset = 0;

  for (const file of files) {
    const filePathBuf = Buffer.from(file.path, "utf8");
    const contentBuf = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content || "", "utf8");
    const crc = calculateCRC32(contentBuf);
    const size = contentBuf.length;

    const localHeader = Buffer.alloc(30 + filePathBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(size, 18);
    localHeader.writeUInt32LE(size, 22);
    localHeader.writeUInt16LE(filePathBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    filePathBuf.copy(localHeader, 30);

    buffers.push(localHeader);
    buffers.push(contentBuf);

    const cdEntry = Buffer.alloc(46 + filePathBuf.length);
    cdEntry.writeUInt32LE(0x02014b50, 0);
    cdEntry.writeUInt16LE(20, 4);
    cdEntry.writeUInt16LE(20, 6);
    cdEntry.writeUInt16LE(0, 8);
    cdEntry.writeUInt16LE(0, 10);
    cdEntry.writeUInt16LE(0, 12);
    cdEntry.writeUInt16LE(0, 14);
    cdEntry.writeUInt32LE(crc, 16);
    cdEntry.writeUInt32LE(size, 20);
    cdEntry.writeUInt32LE(size, 24);
    cdEntry.writeUInt16LE(filePathBuf.length, 28);
    cdEntry.writeUInt16LE(0, 30);
    cdEntry.writeUInt16LE(0, 32);
    cdEntry.writeUInt16LE(0, 34);
    cdEntry.writeUInt16LE(0, 36);
    cdEntry.writeUInt32LE(0, 38);
    cdEntry.writeUInt32LE(offset, 42);
    filePathBuf.copy(cdEntry, 46);

    cdEntries.push(cdEntry);
    offset += localHeader.length + contentBuf.length;
  }

  const cdOffset = offset;
  let cdSize = 0;
  for (const cd of cdEntries) {
    buffers.push(cd);
    cdSize += cd.length;
  }

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(cdEntries.length, 8);
  eocd.writeUInt16LE(cdEntries.length, 10);
  eocd.writeUInt32LE(cdSize, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  buffers.push(eocd);

  return Buffer.concat(buffers);
}

const projectEventStore = new Map();

const emitProjectEvent = (projectId, eventName, payload = {}) => {
  const listeners = projectEventStore.get(String(projectId)) || [];
  const event = {
    projectId: String(projectId),
    event: eventName,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  listeners.forEach(({ res }) => {
    try {
      res.write(`event: ${eventName}\n`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch (error) {
      console.warn("Project event stream write failed:", error.message);
    }
  });

  return event;
};

const ensureProjectOwner = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.owner.toString() !== userId) {
    throw new Error("Unauthorized access to project");
  }

  return project;
};

// Create New Project
const createProject = async (req, res) => {
  try {
    const { title, description, category = "Web App", priority = "Medium", status = "Planning", requirements = "" } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const agents = initializeProjectAgents([]);

    const project = await Project.create({
      title,
      description,
      category,
      priority,
      status,
      requirements: requirements || description,
      owner: req.user.id,
      progress: 0,
      agents,
    });

    // Create activity log
    await Activity.create({
      projectId: project._id,
      user: req.user.id,
      agentName: "System",
      action: "Project Created",
      details: `Created new project: ${project.title}`,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Projects for Logged in User (with filter, search, sort)
const getProjects = async (req, res) => {
  try {
    const { search, status, priority, sortBy = "createdAt" } = req.query;

    const query = { owner: req.user.id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (priority && priority !== "All") {
      query.priority = priority;
    }

    const sortOption = {};
    if (sortBy === "title") sortOption.title = 1;
    else if (sortBy === "progress") sortOption.progress = -1;
    else sortOption.createdAt = -1;

    const projects = await Project.find(query).sort(sortOption);

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Project
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("owner", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Ensure user owns or has access
    if (project.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access to project" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update project" });
    }

    const fields = ["title", "description", "category", "priority", "status", "requirements", "progress"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();

    await Activity.create({
      projectId: project._id,
      user: req.user.id,
      agentName: "System",
      action: "Project Updated",
      details: `Updated details for ${project.title}`,
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Project & associated resources
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete project" });
    }

    // Delete associated data
    await Task.deleteMany({ projectId: project._id });
    await Document.deleteMany({ projectId: project._id });
    await Activity.deleteMany({ projectId: project._id });
    await Message.deleteMany({ projectId: project._id });
    await ProjectFile.deleteMany({ projectId: project._id });

    await project.deleteOne();

    res.json({ message: "Project and all associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectStatus = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select("title status progress agents updatedAt executionLogs");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectSummary = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access to project" });
    }

    const totalTasks = await Task.countDocuments({ projectId: project._id });
    const pendingTasks = await Task.countDocuments({
      projectId: project._id,
      status: { $nin: ["Completed", "Cancelled"] },
    });
    const pendingWork = await Task.find({ projectId: project._id }, "status").lean();
    const failedAgents = project.agents.filter((agent) => agent.status === "Error").length;
    const activeAgents = project.agents.filter((agent) => ["Working", "Thinking", "Waiting", "Running"].includes(agent.status)).length;
    const completedAgents = project.agents.filter((agent) => agent.status === "Completed").length;
    const lastActivity = await Activity.findOne({ projectId: project._id }).sort({ createdAt: -1 }).select("createdAt action details");
    const generatedFilesCount = await ProjectFile.countDocuments({ projectId: project._id });

    res.json({
      projectId: project._id,
      name: project.title,
      status: project.status,
      progress: project.progress || 0,
      currentPhase: project.currentPhase || "Planning",
      activeAgents,
      completedAgents,
      failedAgents,
      pendingTasks,
      totalTasks,
      generatedFilesCount,
      recentTaskStatuses: pendingWork.map((task) => task.status),
      lastActivity: lastActivity ? lastActivity.createdAt : null,
      previewUrl: project.previewUrl || null,
      title: project.title,
      description: project.description,
      updatedAt: project.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get generated code files and artifacts for a project
const getProjectGeneratedFiles = async (req, res) => {
  try {
    const files = await ProjectFile.find({ projectId: req.params.id }).sort({ filePath: 1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download all generated files as a ZIP package
const downloadProjectZip = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access to project" });
    }

    const files = await ProjectFile.find({ projectId: req.params.id });
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "This project doesn't have generated files yet." });
    }

    const zipFiles = files.map((f) => ({
      path: f.filePath,
      content: f.content || "",
    }));

    const zipBuffer = generateZipBuffer(zipFiles);
    const slug = (project.title || "project")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project";

    const zipFilename = `swarmos-${slug}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipFilename}"`);
    res.setHeader("Content-Length", zipBuffer.length);
    res.send(zipBuffer);
  } catch (error) {
    console.error("ZIP Generation Error:", error);
    res.status(500).json({ message: "Unable to create the project ZIP." });
  }
};

// Get project execution logs
const getProjectLogs = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select("executionLogs title");
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project.executionLogs || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get project timeline phases
const getProjectTimeline = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const phases = [
      { name: "Requirements & Planning", agent: "Planner Agent", status: project.progress >= 20 ? "Completed" : "In Progress" },
      { name: "UI/UX & Wireframe Design", agent: "Frontend Agent", status: project.progress >= 40 ? "Completed" : project.progress >= 20 ? "In Progress" : "Pending" },
      { name: "Backend API Implementation", agent: "Backend Agent", status: project.progress >= 70 ? "Completed" : project.progress >= 40 ? "In Progress" : "Pending" },
      { name: "QA & Integration Testing", agent: "Tester Agent", status: project.progress >= 90 ? "Completed" : project.progress >= 70 ? "In Progress" : "Pending" },
      { name: "Documentation & Release", agent: "Documentation Agent", status: project.progress >= 100 ? "Completed" : "Pending" },
    ];

    res.json({
      currentPhase: project.currentPhase || "Planning",
      overallProgress: project.progress || 0,
      phases,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const streamProjectEvents = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access to project" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const listener = { id: Date.now().toString(), res };
    const existing = projectEventStore.get(String(projectId)) || [];
    existing.push(listener);
    projectEventStore.set(String(projectId), existing);

    res.write(`event: connected\n`);
    res.write(
      `data: ${JSON.stringify({
        projectId: String(projectId),
        event: "connected",
        timestamp: new Date().toISOString(),
      })}\n\n`
    );

    req.on("close", () => {
      const entries = projectEventStore.get(String(projectId)) || [];
      projectEventStore.set(
        String(projectId),
        entries.filter((entry) => entry.id !== listener.id)
      );
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const runnerService = require("../services/runnerService");

const runProjectController = async (req, res) => {
  try {
    const result = await runnerService.runProject(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to start local project server." });
  }
};

const stopProjectController = async (req, res) => {
  try {
    const result = await runnerService.stopProject(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRuntimeStateController = async (req, res) => {
  try {
    const state = await runnerService.getRuntimeState(req.params.id);
    res.json(state);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRuntimeLogsController = async (req, res) => {
  try {
    const logs = runnerService.getRuntimeLogs(req.params.id);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deployProjectController = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check if cloud deployment API credentials exist in environment
    const vercelToken = process.env.VERCEL_TOKEN;
    const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;

    if (!vercelToken && !netlifyToken) {
      project.deploymentStatus = "not_configured";
      project.deploymentError = "Deployment Provider Not Configured. Add VERCEL_TOKEN or NETLIFY_AUTH_TOKEN to backend/.env to enable online deployment.";
      await project.save();

      return res.status(400).json({
        deploymentStatus: "not_configured",
        message: "Deployment provider is not configured. Add VERCEL_TOKEN or NETLIFY_AUTH_TOKEN in backend/.env to deploy online. You can run the project locally right now using 'Run Project'.",
      });
    }

    project.deploymentStatus = "deploying";
    await project.save();

    // Simulated deployment resolution if token provided
    setTimeout(async () => {
      project.deploymentStatus = "deployed";
      project.deploymentUrl = `https://${project.title.toLowerCase().replace(/[^a-z0-9]/gi, "")}.swarmos-app.live`;
      await project.save();
    }, 2000);

    res.json({
      deploymentStatus: "deploying",
      message: "Deployment initiated...",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExecutionStatus = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access to project" });
    }

    const tasks = await Task.find({ projectId: project._id }).sort({ createdAt: 1 });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;
    const failedTasks = tasks.filter((t) => t.status === "Failed" || t.status === "Error").length;
    const runningTasks = tasks.filter((t) => t.status === "In Progress" || t.status === "Running").length;

    const files = await ProjectFile.find({ projectId: project._id }).select("fileName filePath content language generatedByAgent createdAt sizeBytes").sort({ createdAt: 1 });
    const activities = await Activity.find({ projectId: project._id }).sort({ createdAt: -1 }).limit(30);

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (project.progress || 0);

    res.json({
      projectId: project._id,
      title: project.title,
      description: project.description,
      status: project.status,
      progress,
      currentPhase: project.currentPhase || (progress === 100 ? "Ready" : progress > 50 ? "Development" : "Planning"),
      totalTasks,
      completedTasks,
      failedTasks,
      runningTasks,
      agents: project.agents || [],
      tasks,
      executionLogs: project.executionLogs || [],
      files,
      activities,
      updatedAt: project.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStatus,
  getProjectSummary,
  getExecutionStatus,
  getProjectGeneratedFiles,
  downloadProjectZip,
  getProjectLogs,
  getProjectTimeline,
  streamProjectEvents,
  emitProjectEvent,
  ensureProjectOwner,
  runProjectController,
  stopProjectController,
  getRuntimeStateController,
  getRuntimeLogsController,
  deployProjectController,
};