const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  amount: Number,
  transactionType: String,
  deviceType: String,
  locationType: String,
  transactionHour: Number,
  recentTransactionCount: Number,
  accountAgeDays: Number,
  prediction: String,
  confidence: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  explanation: {
  type: String,
  default: ""
}
});

module.exports = mongoose.model("Transaction", transactionSchema);