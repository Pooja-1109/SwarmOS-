const Project = require("../models/Project");
const Task = require("../models/Task");
const Document = require("../models/Document");

const getProjectAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const tasks = await Task.find({ projectId });
    const docs = await Document.find({ projectId });

    const statusCounts = { Backlog: 0, Todo: 0, "In Progress": 0, Review: 0, Completed: 0, Blocked: 0 };
    const priorityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const agentWorkload = {};

    tasks.forEach((t) => {
      if (statusCounts[t.status] !== undefined) statusCounts[t.status]++;
      if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++;
      
      const agent = t.assignedAgent || "Unassigned";
      agentWorkload[agent] = (agentWorkload[agent] || 0) + 1;
    });

    const totalTasks = tasks.length;
    const completedTasks = statusCounts.Completed;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : project.progress || 0;

    res.json({
      projectTitle: project.title,
      progress: completionPercentage,
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      totalDocuments: docs.length,
      statusCounts,
      priorityCounts,
      agentWorkload,
      activeAgents: project.agents ? project.agents.filter(a => a.status === "Working" || a.status === "Completed").length : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjectAnalytics,
};
