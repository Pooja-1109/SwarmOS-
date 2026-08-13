const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStatus,
  getProjectSummary,
  getExecutionStatus,
  getProjectGeneratedFiles,
  downloadProjectZip,
  getProjectLogs,
  getProjectTimeline,
  streamProjectEvents,
  runProjectController,
  stopProjectController,
  getRuntimeStateController,
  getRuntimeLogsController,
  deployProjectController,
} = require("../controllers/projectController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getProjects).post(createProject);
router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);
router.get("/:id/status", getProjectStatus);
router.get("/:id/summary", getProjectSummary);
router.get("/:id/execution-status", getExecutionStatus);
router.get("/:id/files", getProjectGeneratedFiles);
router.get("/:id/download", downloadProjectZip);
router.get("/:id/logs", getProjectLogs);
router.get("/:id/timeline", getProjectTimeline);
router.get("/:id/events", streamProjectEvents);

// Runtime & Deployment endpoints
router.post("/:id/run", runProjectController);
router.post("/:id/stop", stopProjectController);
router.get("/:id/runtime", getRuntimeStateController);
router.get("/:id/runtime-logs", getRuntimeLogsController);
router.post("/:id/deploy", deployProjectController);

module.exports = router;