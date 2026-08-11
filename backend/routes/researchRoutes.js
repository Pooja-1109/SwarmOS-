const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  handleResearchRequest,
  listResearch,
  createDiagram,
  listDiagrams,
  createDocument,
  listDocuments,
} = require("../controllers/researchController");

router.use(protect);

router.post("/project/:projectId/research", handleResearchRequest);
router.get("/project/:projectId/research", listResearch);
router.post("/project/:projectId/visualization", createDiagram);
router.get("/project/:projectId/visualization", listDiagrams);
router.post("/project/:projectId/document", createDocument);
router.get("/project/:projectId/document", listDocuments);

module.exports = router;
