const mongoose = require("mongoose");

const requirementTraceSchema = new mongoose.Schema(
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
    code: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    implementation: {
      type: String,
      default: "",
    },
    tests: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["✅", "🔄", "⏳", "⚠"],
      default: "⏳",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RequirementTrace", requirementTraceSchema);
