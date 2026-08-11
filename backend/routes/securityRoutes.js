const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  handleSecurityScan,
  handleTestRun,
  getSecurityReport,
  getTestReport,
} = require("../controllers/securityController");

router.use(protect);

router.get("/project/:projectId/security", getSecurityReport);
router.post("/project/:projectId/security", handleSecurityScan);
router.get("/project/:projectId/tests", getTestReport);
router.post("/project/:projectId/tests", handleTestRun);

module.exports = router;
