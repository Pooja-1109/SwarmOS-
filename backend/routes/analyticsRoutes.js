const express = require("express");
const router = express.Router();
const { getProjectAnalytics } = require("../controllers/analyticsController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.get("/:projectId", getProjectAnalytics);

module.exports = router;
