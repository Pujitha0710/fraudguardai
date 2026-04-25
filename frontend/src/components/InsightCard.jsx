import { useEffect, useState } from "react";
import axios from "axios";

export default function InsightCard({ latestResult }) {
  const [insight, setInsight] = useState(null);

  const cleanText = (text) => {
    return text
      ?.replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/__/g, "")
      .replace(/`/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  useEffect(() => {
    if (!latestResult) return;

    // 🔥 poll latest transaction from DB
    const interval = setInterval(() => {
      axios.get("http://localhost:5000/predict/history")
        .then(res => {
          const latest = res.data[0]; // newest transaction

          if (latest?.explanation) {
            setInsight(cleanText(latest.explanation));
            clearInterval(interval);
          }
        });
    }, 1500);

    return () => clearInterval(interval);

  }, [latestResult]);

  return (
    <div className="
      bg-[#152A21]/90 backdrop-blur-md
      border border-[#1F3A2F]
      rounded-2xl
      p-6
      shadow-[0_10px_30px_rgba(0,0,0,0.35)]
    ">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-[16px]">
          AI Insight
        </h3>

        <span className="
          text-[11px] px-2 py-1 rounded-full
          bg-[#6B8E23]/20 text-[#A7D36E]
          border border-[#6B8E23]/30
        ">
          AI
        </span>
      </div>

      {/* CONTENT */}
      <div className="text-[#B7CFC0] text-sm leading-relaxed min-h-[40px]">

        {insight ? (
          <p>{insight}</p>
        ) : (
          <p className="animate-pulse text-[#8FAF9D]">
            Analyzing with AI...
          </p>
        )}

      </div>

    </div>
  );
}