const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedAgent: {
      type: String,
      default: "Planner Agent",
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: [
        "Backlog",
        "Todo",
        "Queued",
        "In Progress",
        "Running",
        "Review",
        "Completed",
        "Failed",
        "Blocked",
        "Cancelled",
        "Waiting For Approval",
      ],
      default: "Backlog",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    deadline: {
      type: Date,
    },
    dependencies: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ projectId: 1, status: 1, createdAt: -1 });
taskSchema.index({ projectId: 1, updatedAt: -1 });
taskSchema.index({ assignedAgent: 1, status: 1 });

module.exports = mongoose.model("Task", taskSchema);
