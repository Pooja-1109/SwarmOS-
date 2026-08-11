const mongoose = require("mongoose");

const testRunSchema = new mongoose.Schema(
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
    name: {
      type: String,
      default: "Swarm Test Run",
    },
    status: {
      type: String,
      enum: ["Queued", "Running", "Passed", "Failed", "Review"],
      default: "Queued",
    },
    passed: {
      type: Number,
      default: 0,
    },
    failed: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      default: "",
    },
    artifacts: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TestRun", testRunSchema);
