const Project = require("../models/Project");
const Task = require("../models/Task");
const Activity = require("../models/Activity");

const getDashboard = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id }).sort({ updatedAt: -1 });

    const totalProjects = projects.length;
    const completedProjects = projects.filter((p) => p.status === "Completed").length;
    const runningProjects = projects.filter((p) => p.status === "Running" || p.status === "Active").length;
    const pendingProjects = projects.filter((p) => p.status === "Planning" || p.status === "Pending" || p.status === "On Hold").length;

    // Get project IDs
    const projectIds = projects.map((p) => p._id);

    const totalTasks = await Task.countDocuments({ projectId: { $in: projectIds } });
    const completedTasks = await Task.countDocuments({ projectId: { $in: projectIds }, status: "Completed" });
    const pendingTasks = totalTasks - completedTasks;

    // Count active agents across projects
    let activeAgentsCount = 0;
    projects.forEach((p) => {
      if (p.agents && Array.isArray(p.agents)) {
        p.agents.forEach((a) => {
          if (a.status === "Working" || a.status === "Thinking") {
            activeAgentsCount++;
          }
        });
      }
    });

    const recentActivities = await Activity.find({ projectId: { $in: projectIds } })
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      totalProjects,
      completedProjects,
      runningProjects,
      pendingProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      activeAgentsCount: activeAgentsCount || 9,
      recentProjects: projects.slice(0, 5),
      recentActivities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard,
};