// backend/server.js
// FraudGuard AI Backend

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const predictRouter = require('./routes/predict');
require('dotenv').config();

const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ DB Connection
connectDB();

// ✅ Routes
app.use('/predict', predictRouter);

// ✅ Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'FraudGuard AI Backend',
    timestamp: new Date().toISOString()
  });
});

// 🔥 GEMINI EXPLANATION ENDPOINT
let requestCount = 0;

app.post('/generate-explanation', async (req, res) => {
  try {
    // 🔒 Optional request limit (safety)
    if (requestCount > 100) {
      return res.json({ explanation: "Limit reached" });
    }
    requestCount++;

    const {
      amount,
      prediction,
      probability,
      locationType,
      deviceType,
      recentTransactionCount
    } = req.body;

    const API_KEY = process.env.GEMINI_API_KEY;

    // 🧠 Prompt
    const prompt = `
You are a fraud detection assistant.

Explain in a clear, professional way why this transaction is ${
      prediction === 1 ? "HIGH RISK" : "LOW RISK"
    }.

Transaction Details:
- Amount: ${amount}
- Probability: ${probability}
- Location Type: ${locationType}
- Device Type: ${deviceType}
- Recent Transactions: ${recentTransactionCount}

Keep it concise, simple, and user-friendly.
`;

    // 🔮 Gemini API call (FINAL CORRECT)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        timeout: 15000
      }
    );

    const explanation =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No explanation generated.";

    res.json({ explanation });

  } catch (error) {
    console.error("🔥 Gemini Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to generate AI explanation",
      details: error.message
    });
  }
});

// ❌ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ❌ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err.message);
  res.status(500).json({
    error: "Unexpected server error",
    details: err.message
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔮 Predict: POST /predict`);
  console.log(`🧠 AI: POST /generate-explanation`);
});