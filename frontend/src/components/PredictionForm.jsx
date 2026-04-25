import { useState } from "react";
import axios from "axios";

export default function PredictionForm({ onResult }) {
  const [formData, setFormData] = useState({
    amount: "",
    transactionHour: "",
    recentTransactionCount: "",
    accountAgeDays: "",
    transactionType: "online",
    deviceType: "mobile",
    locationType: "domestic",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ ONLY ML CALL (no Gemini here)
      const res = await axios.post(
        "http://localhost:5000/predict",
        formData
      );

      const data = {
        ...formData,
        prediction: res.data.prediction,
        probability: res.data.probability,
        isFraud: res.data.prediction === 1,
        explanation: null, // important for async UI
      };

      onResult(data);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="
      bg-[#13241C]/90 backdrop-blur-md
      border border-[#1F3A2F]
      rounded-2xl
      p-8
      shadow-[0_10px_30px_rgba(0,0,0,0.4)]
    ">

      <h2 className="text-lg font-semibold text-[#E8F5E9] mb-6">
        Transaction Details
      </h2>

      <form onSubmit={handleSubmit}>

        {/* INPUT GRID */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          <Input
            label="Amount"
            value={formData.amount}
            onChange={(v) => setFormData({ ...formData, amount: v })}
          />

          <Input
            label="Transaction Hour"
            value={formData.transactionHour}
            onChange={(v) => setFormData({ ...formData, transactionHour: v })}
          />

          <Input
            label="Recent Transaction Count"
            value={formData.recentTransactionCount}
            onChange={(v) =>
              setFormData({ ...formData, recentTransactionCount: v })
            }
          />

          <Input
            label="Account Age (days)"
            value={formData.accountAgeDays}
            onChange={(v) =>
              setFormData({ ...formData, accountAgeDays: v })
            }
          />

        </div>

        {/* DROPDOWNS */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <Select
            label="Transaction Type"
            value={formData.transactionType}
            options={["online", "atm"]}
            onChange={(v) =>
              setFormData({ ...formData, transactionType: v })
            }
          />

          <Select
            label="Device Type"
            value={formData.deviceType}
            options={["mobile", "desktop"]}
            onChange={(v) =>
              setFormData({ ...formData, deviceType: v })
            }
          />

          <Select
            label="Location Type"
            value={formData.locationType}
            options={["domestic", "international"]}
            onChange={(v) =>
              setFormData({ ...formData, locationType: v })
            }
          />

        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-4 rounded-xl font-medium text-white
            bg-[#6B8E23]
            hover:bg-[#7FAE3A]
            active:scale-[0.99]
            transition-all duration-200
            shadow-[0_8px_25px_rgba(107,142,35,0.35)]
          "
        >
          {loading ? "Analyzing..." : "Analyze Transaction"}
        </button>

      </form>
    </div>
  );
}

/* ============================= */
/* 🔹 INPUT COMPONENT */
/* ============================= */

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-[#9FB7A7] mb-2 block">
        {label}
      </label>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-4 py-3 rounded-xl
          bg-[#0E1A14]
          border border-[#1F3A2F]
          text-[#E8F5E9]
          focus:outline-none
          focus:ring-2 focus:ring-[#6B8E23]/40
          hover:border-[#2E5A45]
        "
        required
      />
    </div>
  );
}

/* ============================= */
/* 🔹 SELECT COMPONENT */
/* ============================= */

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-sm text-[#9FB7A7] mb-2 block">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-4 py-3 rounded-xl
          bg-[#0E1A14]
          border border-[#1F3A2F]
          text-[#E8F5E9]
          focus:outline-none
          focus:ring-2 focus:ring-[#6B8E23]/40
        "
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
