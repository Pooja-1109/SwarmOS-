const Project = require("../models/Project");
const Activity = require("../models/Activity");
const { runAgentSwarm, initializeProjectAgents } = require("../services/agentService");

// Start AI Generation / Multi-Agent Swarm
const startAgents = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const updatedProject = await runAgentSwarm(req.params.id, req.user.id);

    res.json({
      message: "🚀 Multi-Agent Swarm Orchestration Started",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Agents for a Project
const getProjectAgents = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const agents = initializeProjectAgents(project.agents);
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Run an individual specific agent
const runSingleAgent = async (req, res) => {
  try {
    const { agentName } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.agents = initializeProjectAgents(project.agents);
    const agentIdx = project.agents.findIndex((a) => a.name === agentName);

    if (agentIdx !== -1) {
      project.agents[agentIdx].status = "Working";
      project.agents[agentIdx].currentTask = "Executing custom task cycle...";
      project.agents[agentIdx].progress = 50;
      await project.save();

      // Log activity
      await Activity.create({
        projectId: project._id,
        user: req.user.id,
        agentName: agentName,
        action: "Agent Executed",
        details: `Triggered execution for ${agentName}`,
      });

      // Simulate completion after delay
      setTimeout(async () => {
        try {
          const p = await Project.findById(req.params.id);
          if (p && p.agents[agentIdx]) {
            p.agents[agentIdx].status = "Completed";
            p.agents[agentIdx].progress = 100;
            p.agents[agentIdx].currentTask = "Task execution finished successfully";
            p.agents[agentIdx].lastActivity = new Date();
            await p.save();
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000);
    }

    res.json({ message: `Triggered ${agentName}`, agents: project.agents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startAgents,
  getProjectAgents,
  runSingleAgent,
};