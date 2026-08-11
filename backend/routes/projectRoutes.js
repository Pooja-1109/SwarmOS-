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
  streamProjectEvents,
} = require("../controllers/projectController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getProjects).post(createProject);
router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);
router.get("/:id/status", getProjectStatus);
router.get("/:id/summary", getProjectSummary);
router.get("/:id/events", streamProjectEvents);

module.exports = router;