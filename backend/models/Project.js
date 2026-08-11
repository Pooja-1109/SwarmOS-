const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Web App", "AI Model", "Mobile App", "DevOps", "Data Pipeline", "E-Commerce", "Custom"],
      default: "Web App",
    },
    status: {
      type: String,
      enum: ["Planning", "Active", "On Hold", "Completed", "Archived", "Pending", "Running"],
      default: "Planning",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentPhase: {
      type: String,
      default: "Planning",
    },
    previewUrl: {
      type: String,
      default: "",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    requirements: {
      type: String,
      default: "",
    },
    swarmScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    qualityGate: {
      architecture: { type: Number, default: 0 },
      codeQuality: { type: Number, default: 0 },
      testing: { type: Number, default: 0 },
      security: { type: Number, default: 0 },
      documentation: { type: Number, default: 0 },
      performance: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
      status: { type: String, default: "Review Required" },
    },
    selfHealing: {
      maxAttempts: { type: Number, default: 3 },
      attempts: { type: Number, default: 0 },
      status: { type: String, enum: ["idle", "running", "stopped", "ready"], default: "idle" },
      lastError: { type: String, default: "" },
    },
    agents: [
      {
        name: { type: String, required: true },
        role: { type: String, default: "AI Assistant" },
        status: { type: String, default: "Idle" }, // Idle, Thinking, Working, Waiting, Completed, Error
        currentTask: { type: String, default: "Awaiting assignment" },
        progress: { type: Number, default: 0 },
        lastActivity: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ owner: 1, status: 1, createdAt: -1 });
projectSchema.index({ owner: 1, updatedAt: -1 });

module.exports = mongoose.model("Project", projectSchema);