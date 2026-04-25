const Transaction = require("../models/Transaction");
const { runPythonPrediction } = require("../services/pythonService");
const axios = require("axios");

exports.predict = async (req, res) => {
  try {
    const {
      amount,
      transactionType,
      deviceType,
      locationType,
      transactionHour,
      recentTransactionCount,
      accountAgeDays
    } = req.body;

    // ✅ Validation
    if (
      amount === undefined ||
      !transactionType ||
      !deviceType ||
      !locationType ||
      transactionHour === undefined ||
      recentTransactionCount === undefined ||
      accountAgeDays === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔮 STEP 1: ML Prediction
    const result = await runPythonPrediction(req.body);

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    const predictionBinary = result.prediction === "Fraud" ? 1 : 0;
    const probability = result.confidence;

    // 💾 STEP 2: Save transaction FIRST
    const txn = new Transaction({
      amount,
      transactionType,
      deviceType,
      locationType,
      transactionHour,
      recentTransactionCount,
      accountAgeDays,
      prediction: result.prediction,
      confidence: result.confidence,
      explanation: "" // initially empty
    });

    await txn.save();

    // ⚡ STEP 3: SEND RESPONSE IMMEDIATELY
    res.json({
      prediction: predictionBinary,
      probability: probability,
      label: result.prediction,
      explanation: ""
    });

    // 🧠 STEP 4: GEMINI ASYNC (FIXED VERSION)
    const API_KEY = process.env.GEMINI_API_KEY;

    const prompt = `
You are a fraud detection assistant.

Explain in a clear, professional way why this transaction is ${
      predictionBinary === 1 ? "HIGH RISK" : "LOW RISK"
    }.

Transaction Details:
- Amount: ${amount}
- Probability: ${probability}
- Location Type: ${locationType}
- Device Type: ${deviceType}
- Recent Transactions: ${recentTransactionCount}

Keep it concise and user-friendly.
`;

    (async () => {
      try {
        console.log("⚡ Gemini started...");

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
          {
            contents: [{ parts: [{ text: prompt }] }]
          },
          { timeout: 15000 }
        );

        const explanation =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text
          || "AI explanation unavailable.";

        console.log("🧠 Explanation:", explanation);

        // 🔥 FIX: Safe DB update
        const doc = await Transaction.findById(txn._id);

        if (doc) {
          doc.explanation = explanation;
          await doc.save();
          console.log("💾 Explanation saved");
        } else {
          console.log("❌ Transaction not found");
        }

      } catch (err) {
        console.error("🔥 Gemini async error:", err.response?.data || err.message);
      }
    })();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 HISTORY
exports.getHistory = async (req, res) => {
  try {
    const data = await Transaction.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};