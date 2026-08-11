const Task = require("../models/Task");
const Project = require("../models/Project");
const Activity = require("../models/Activity");

// Recalculate project progress based on completed tasks ratio
const updateProjectProgress = async (projectId) => {
  try {
    const total = await Task.countDocuments({ projectId });
    if (total === 0) return;
    const completed = await Task.countDocuments({ projectId, status: "Completed" });
    const progress = Math.round((completed / total) * 100);

    const project = await Project.findById(projectId);
    if (project) {
      project.progress = progress;
      if (progress === 100) project.status = "Completed";
      else if (progress > 0 && project.status === "Planning") project.status = "Active";
      await project.save();
    }
  } catch (err) {
    console.error("Error updating project progress:", err.message);
  }
};

// Get Tasks for a Project
const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, agent, search } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: "projectId query parameter is required" });
    }

    const query = { projectId };

    if (status && status !== "All") query.status = status;
    if (priority && priority !== "All") query.priority = priority;
    if (agent && agent !== "All") query.assignedAgent = agent;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Task
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedAgent = "Planner Agent", priority = "Medium", status = "Backlog", deadline } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: "Title and projectId are required" });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedAgent,
      priority,
      status,
      deadline,
      progress: status === "Completed" ? 100 : status === "In Progress" ? 50 : 0,
    });

    await Activity.create({
      projectId,
      user: req.user.id,
      agentName: assignedAgent,
      action: "Task Created",
      details: `Task created: "${task.title}" [${priority}]`,
    });

    await updateProjectProgress(projectId);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Task
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const fields = ["title", "description", "assignedAgent", "assignedUser", "priority", "status", "progress", "deadline"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) task[f] = req.body[f];
    });

    if (req.body.status === "Completed") task.progress = 100;

    await task.save();

    await Activity.create({
      projectId: task.projectId,
      user: req.user.id,
      agentName: task.assignedAgent,
      action: "Task Updated",
      details: `Updated task "${task.title}" -> Status: ${task.status}`,
    });

    await updateProjectProgress(task.projectId);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patch Task Status (Kanban quick drag/drop)
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;
    if (status === "Completed") task.progress = 100;
    else if (status === "In Progress") task.progress = 50;

    await task.save();

    await Activity.create({
      projectId: task.projectId,
      user: req.user.id,
      agentName: task.assignedAgent,
      action: "Status Changed",
      details: `Task "${task.title}" moved to ${status}`,
    });

    await updateProjectProgress(task.projectId);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const projectId = task.projectId;
    await task.deleteOne();

    await updateProjectProgress(projectId);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
