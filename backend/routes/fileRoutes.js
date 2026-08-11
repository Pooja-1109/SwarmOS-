const express = require("express");
const router = express.Router();
const {
  uploadMiddleware,
  uploadFile,
  getProjectFiles,
  getFile,
  deleteFile,
} = require("../controllers/fileController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.post("/upload", uploadMiddleware, uploadFile);
router.get("/project/:projectId", getProjectFiles);
router.get("/:id", getFile);
router.delete("/:id", deleteFile);

module.exports = router;
