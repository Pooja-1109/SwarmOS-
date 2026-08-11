const mongoose = require("mongoose");

const securityFindingSchema = new mongoose.Schema(
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
    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low", "Passed"],
      default: "Medium",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    recommendation: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Open", "Mitigated", "Passed"],
      default: "Open",
    },
    source: {
      type: String,
      default: "Swarm Security Agent",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SecurityFinding", securityFindingSchema);
