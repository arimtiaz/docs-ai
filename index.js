const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

// Model
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_API_KEY,
  });

// Embedding
const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", // 768 dimensions
    apiKey: process.env.GOOGLE_API_KEY,
  });