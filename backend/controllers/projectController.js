const Project = require("../models/Project");
const Task = require("../models/Task");
const Document = require("../models/Document");
const Activity = require("../models/Activity");
const Message = require("../models/Message");
const { initializeProjectAgents } = require("../services/agentService");

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

    await project.deleteOne();

    res.json({ message: "Project and all associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectStatus = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select("title status progress agents updatedAt");
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

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStatus,
  getProjectSummary,
  streamProjectEvents,
  emitProjectEvent,
  ensureProjectOwner,
};