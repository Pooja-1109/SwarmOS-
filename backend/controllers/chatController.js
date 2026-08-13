const Message = require("../models/Message");
const Project = require("../models/Project");
const { answerWithRAG } = require("../services/ragService");

const { orchestrateProjectRequest } = require("../services/orchestratorService");

// Send Chat Message with Conversational AI & Orchestrator Action Engine
const sendChatMessage = async (req, res) => {
  try {
    const { projectId, text } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!projectId || !text) {
      return res.status(400).json({ message: "projectId and text are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Save User message
    await Message.create({
      projectId,
      sender: "user",
      text,
    });

    // Run orchestrator to update project requirements, regenerate files, and materialize runtime
    const orchResult = await orchestrateProjectRequest({
      projectId,
      userId: userId || project.owner,
      prompt: text,
    });

    const replyText = orchResult.orchestratorMessage || `I understand. I've updated ${project.title} with your request.`;

    // Save Assistant message with agentStatuses and actionButtons
    const assistantMsg = await Message.create({
      projectId,
      sender: "assistant",
      text: replyText,
      agentStatuses: orchResult.agentStatuses || [],
      actionButtons: orchResult.actionButtons || [],
    });

    res.json(assistantMsg);
  } catch (error) {
    console.error("Chat Controller Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get Chat History for a Project
const getChatHistory = async (req, res) => {
  try {
    const messages = await Message.find({ projectId: req.params.projectId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendChatMessage,
  getChatHistory,
};
