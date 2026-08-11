const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    bio: {
      type: String,
      default: "AI Engineer & Developer",
    },
    avatar: {
      type: String,
      default: "",
    },
    whatsappNumber: {
      type: String,
      default: "",
    },
    whatsappOptIn: {
      type: Boolean,
      default: false,
    },
    whatsappOptInAt: {
      type: Date,
      default: null,
    },
    whatsappStatus: {
      type: String,
      enum: ["not_connected", "connected", "pending", "disconnected"],
      default: "not_connected",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ whatsappNumber: 1 }, { sparse: true });

module.exports = mongoose.model("User", userSchema);