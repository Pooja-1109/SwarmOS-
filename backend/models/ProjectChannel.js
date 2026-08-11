const mongoose = require("mongoose");

const projectChannelSchema = new mongoose.Schema(
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
    channelType: {
      type: String,
      enum: ["web", "whatsapp", "voice"],
      required: true,
    },
    status: {
      type: String,
      enum: ["inactive", "active", "syncing", "error"],
      default: "inactive",
    },
    endpoint: {
      type: String,
      default: "",
    },
    config: {
      type: Object,
      default: {},
    },
    projectStateSnapshot: {
      type: Object,
      default: {},
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastCommand: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProjectChannel", projectChannelSchema);
