const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    sender: {
      type: String, // 'user' | 'assistant' | agent name
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    sources: [
      {
        fileName: String,
        snippet: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
