const mongoose = require("mongoose");

const projectMemorySchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memoryType: {
      type: String,
      enum: [
        "conversation",
        "requirement",
        "architecture",
        "decision",
        "research",
        "document",
        "security",
        "status",
        "summary",
      ],
      default: "conversation",
    },
    intent: {
      type: String,
      default: "GENERAL",
    },
    title: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProjectMemory", projectMemorySchema);
