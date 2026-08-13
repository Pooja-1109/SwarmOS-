const mongoose = require("mongoose");

const projectFileSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["code", "document", "wireframe", "test", "config"],
      default: "code",
    },
    language: {
      type: String,
      default: "javascript",
    },
    content: {
      type: String,
      required: true,
    },
    generatedByAgent: {
      type: String,
      default: "Developer Agent",
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

projectFileSchema.index({ projectId: 1, filePath: 1 });

module.exports = mongoose.model("ProjectFile", projectFileSchema);
