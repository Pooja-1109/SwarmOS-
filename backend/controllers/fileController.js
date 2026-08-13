const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Document = require("../models/Document");
const Activity = require("../models/Activity");
const { chunkText } = require("../services/ragService");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Extract text content from file buffer or file path
const extractText = async (filePath, mimeType, fileName) => {
  try {
    const ext = path.extname(fileName).toLowerCase();
    
    // Simple text-based extensions
    if ([".txt", ".md", ".json", ".js", ".ts", ".jsx", ".tsx", ".py", ".html", ".css", ".csv"].includes(ext)) {
      return fs.readFileSync(filePath, "utf-8");
    }

    if (ext === ".pdf") {
      try {
        const pdfParse = require("pdf-parse");
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        return pdfData.text || `PDF Document: ${fileName}`;
      } catch (e) {
        console.warn("PDF parse fallback:", e.message);
        return `Extracted content from PDF document ${fileName}`;
      }
    }

    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error("Text extraction warning:", err.message);
    return `Uploaded file artifact: ${fileName}`;
  }
};

// Upload Document Handler
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const textContent = await extractText(req.file.path, req.file.mimetype, req.file.originalname);
    const chunks = chunkText(textContent);

    const doc = await Document.create({
      projectId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype || path.extname(req.file.originalname),
      fileSize: req.file.size,
      filePath: req.file.path,
      textContent,
      chunks,
      uploadedBy: req.user.id,
    });

    await Activity.create({
      projectId,
      user: req.user.id,
      agentName: "Research Agent",
      action: "Document Uploaded & Indexed",
      details: `Indexed file "${doc.fileName}" into RAG Knowledge Base (${chunks.length} chunks).`,
    });

    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all files for a project
const getProjectFiles = async (req, res) => {
  try {
    const files = await Document.find({ projectId: req.params.projectId })
      .select("-textContent -chunks")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single file with content
const getFile = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "File not found" });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "File not found" });

    // Remove local file if exists
    if (fs.existsSync(doc.filePath)) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch (err) {
        console.warn("Unlink warning:", err.message);
      }
    }

    await doc.deleteOne();

    res.json({ message: "File deleted successfully from Knowledge Base" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ask Project Knowledge Base
const queryKnowledge = async (req, res) => {
  try {
    const { projectId, query } = req.body;
    if (!projectId || !query) {
      return res.status(400).json({ message: "projectId and query are required" });
    }

    const docs = await Document.find({ projectId });
    if (!docs || docs.length === 0) {
      return res.json({
        answer: "No project knowledge documents have been indexed yet. Upload PDFs or text specifications above to enable RAG context retrieval.",
        sources: [],
      });
    }

    const queryLower = query.toLowerCase();
    let matches = [];

    docs.forEach((doc) => {
      if (doc.chunks && doc.chunks.length > 0) {
        doc.chunks.forEach((chunk, idx) => {
          if (chunk.toLowerCase().includes(queryLower) || queryLower.split(" ").some((w) => w.length > 3 && chunk.toLowerCase().includes(w))) {
            matches.push({
              fileName: doc.fileName,
              chunkIndex: idx,
              snippet: chunk.slice(0, 300) + "...",
            });
          }
        });
      }
    });

    if (matches.length === 0) {
      matches = docs.slice(0, 3).map((d) => ({
        fileName: d.fileName,
        chunkIndex: 0,
        snippet: (d.textContent || "").slice(0, 250) + "...",
      }));
    }

    const answer = `Based on your project knowledge base (${docs.length} document(s) indexed), here is the context snippet matching "${query}":\n\n"${matches[0]?.snippet || "Document content indexed."}"`;

    res.json({
      answer,
      sources: matches,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadMiddleware: upload.single("file"),
  uploadFile,
  getProjectFiles,
  getFile,
  deleteFile,
  queryKnowledge,
};
