const Message = require("../models/Message");
const Project = require("../models/Project");
const { answerWithRAG } = require("../services/ragService");

// Send Chat Message with RAG Knowledge Base context
const sendChatMessage = async (req, res) => {
  try {
    const { projectId, text } = req.body;

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

    // Generate RAG response
    const { answer, sources } = await answerWithRAG(
      projectId,
      project.title,
      project.description,
      text
    );

    // Save Assistant message with citations
    const assistantMsg = await Message.create({
      projectId,
      sender: "assistant",
      text: answer,
      sources,
    });

    res.json(assistantMsg);
  } catch (error) {
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
