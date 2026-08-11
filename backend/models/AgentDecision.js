const mongoose = require("mongoose");

const agentDecisionSchema = new mongoose.Schema(
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
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
      },
    ],
    agentOpinions: [
      {
        agentName: String,
        opinion: String,
        reason: String,
      },
    ],
    finalDecision: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AgentDecision", agentDecisionSchema);
