const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/User");

// Routes Imports
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const agentRoutes = require("./routes/agentRoutes");
const fileRoutes = require("./routes/fileRoutes");
const chatRoutes = require("./routes/chatRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const activityRoutes = require("./routes/activityRoutes");
const orchestratorRoutes = require("./routes/orchestratorRoutes");
const engineeringRoutes = require("./routes/engineeringRoutes");
const securityRoutes = require("./routes/securityRoutes");
const researchRoutes = require("./routes/researchRoutes");
const channelRoutes = require("./routes/channelRoutes");
const externalChannelRoutes = require("./routes/externalChannelRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const seedDefaultAdmin = async () => {
  try {
    const email = "admin@swarmos.com";
    const password = "admin123";

    const existingAdmin = await User.findOne({ email: email.toLowerCase() });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        name: "SwarmOS Admin",
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "admin",
        bio: "System Administrator",
      });

      console.log("✅ Default admin created: admin@swarmos.com / admin123");
    } else {
      console.log("ℹ️ Default admin already exists");
    }
  } catch (error) {
    console.error("❌ Admin seeding failed:", error.message);
  }
};

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static directory for file downloads/views
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Express Runtime Server Route for serving generated projects on http://localhost:5000/runtime/:projectId/
app.use("/runtime/:projectId", (req, res) => {
  const projectId = req.params.projectId;
  const runtimeDir = path.join(__dirname, "runtime-projects", projectId);

  if (!fs.existsSync(runtimeDir)) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Runtime Not Active — SwarmOS</title>
        <style>
          body { background: #09090b; color: #f4f4f5; font-family: -apple-system, sans-serif; text-align: center; padding: 60px 20px; }
          .card { background: #18181b; border: 1px solid #27272a; max-width: 480px; margin: 0 auto; padding: 32px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          h2 { color: #f87171; margin-top: 0; }
          p { color: #a1a1aa; font-size: 14px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Project Runtime Stopped or Not Active</h2>
          <p>Click <strong>▶ Run Project</strong> inside the SwarmOS Workspace to launch this application server.</p>
        </div>
      </body>
      </html>
    `);
  }

  // Calculate relative subPath from req.path
  let rawSubPath = req.path || "/index.html";
  let subPath = rawSubPath === "/" ? "/index.html" : rawSubPath;
  let targetFile = path.join(runtimeDir, subPath);

  const normalizedTarget = path.normalize(targetFile);
  if (!normalizedTarget.startsWith(runtimeDir)) {
    return res.status(403).send("Forbidden: Invalid path traversal");
  }

  if (!fs.existsSync(normalizedTarget) || fs.statSync(normalizedTarget).isDirectory()) {
    targetFile = path.join(runtimeDir, "index.html");
  } else {
    targetFile = normalizedTarget;
  }

  res.sendFile(targetFile);
});

// Home Route
app.get("/", (req, res) => {
  res.send("🚀 SwarmOS AI Platform Backend Running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/orchestrator", orchestratorRoutes);
app.use("/api/engineering", engineeringRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/external-channels", externalChannelRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  await seedDefaultAdmin();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 SwarmOS Backend running on port ${PORT}`);
  });
};

startServer();