const mongoose = require("mongoose");

const documentArtifactSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["report", "abstract", "literature-review", "readme", "api-docs", "summary"],
      default: "report",
    },
    content: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      enum: ["markdown", "pdf", "docx", "text"],
      default: "markdown",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DocumentArtifact", documentArtifactSchema);
