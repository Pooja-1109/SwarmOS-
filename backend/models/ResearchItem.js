const mongoose = require("mongoose");

const researchItemSchema = new mongoose.Schema(
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
    authors: {
      type: [String],
      default: [],
    },
    year: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    doi: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    relevance: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    projectRelationship: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ResearchItem", researchItemSchema);
