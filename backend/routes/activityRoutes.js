const express = require("express");
const router = express.Router();
const { getProjectActivities } = require("../controllers/activityController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.get("/project/:projectId", getProjectActivities);

module.exports = router;
