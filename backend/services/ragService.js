// backend/services/ragService.js
// RAG Service: Chunking, Storage, Semantic Retrieval & Context Generation

const Document = require("../models/Document");
const aiService = require("./aiService");

/**
 * Split text into semantic chunks
 */
const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim() === "") return [];

  const words = text.split(/\s+/);
  const chunks = [];
  let i = 0;
  let index = 0;

  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push({
      text: chunkWords.join(" "),
      chunkIndex: index++,
    });
    i += chunkSize - overlap;
  }

  return chunks;
};

/**
 * Retrieve relevant chunks for a user query from a project's knowledge base
 */
const retrieveRelevantChunks = async (projectId, query, limit = 4) => {
  try {
    const docs = await Document.find({ projectId });
    if (!docs || docs.length === 0) return [];

    const queryWords = query.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 2);
    const scoredChunks = [];

    docs.forEach(doc => {
      doc.chunks.forEach(chunk => {
        const chunkTextLower = chunk.text.toLowerCase();
        let score = 0;
        queryWords.forEach(word => {
          if (chunkTextLower.includes(word)) {
            score += 1;
          }
        });

        if (score > 0) {
          scoredChunks.push({
            score,
            fileName: doc.fileName,
            text: chunk.text,
          });
        }
      });
    });

    // Sort by relevance score descending
    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, limit);
  } catch (error) {
    console.error("RAG Retrieval error:", error.message);
    return [];
  }
};

/**
 * Answer user question using RAG (Retrieved context + Gemini LLM)
 */
const answerWithRAG = async (projectId, projectTitle, projectDesc, userQuery) => {
  const chunks = await retrieveRelevantChunks(projectId, userQuery);

  let contextText = "";
  const sources = [];

  if (chunks.length > 0) {
    contextText = chunks.map((c, idx) => `[Source ${idx + 1}: ${c.fileName}]\n${c.text}`).join("\n\n");
    chunks.forEach(c => {
      if (!sources.some(s => s.fileName === c.fileName)) {
        sources.push({ fileName: c.fileName, snippet: c.text.slice(0, 150) + "..." });
      }
    });
  }

  const systemInstruction = `You are SwarmOS RAG AI Assistant for project "${projectTitle}".
Project Description: "${projectDesc}".
${contextText ? `Use the following retrieved project knowledge base excerpts to answer the question:\n\n${contextText}` : "No specific project document matches were found, so answer based on general project context."}
Provide an accurate, concise, international hackathon-level technical answer. Cite source document names when applicable.`;

  const prompt = `User Query: "${userQuery}"`;
  const answer = await aiService.generateContent({ prompt, systemInstruction });

  return {
    answer,
    sources,
  };
};

module.exports = {
  chunkText,
  retrieveRelevantChunks,
  answerWithRAG,
};
