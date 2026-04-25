export default function ResultCard({ isHighRisk, confidence }) {
  if (confidence == null) return null;

  const percent = Math.round(confidence * 100);

  return (
    <div
      className="
        bg-gradient-to-br from-[#13241C] to-[#0E1A14]
        border border-[#1F3A2F]
        rounded-2xl
        p-8
        shadow-[0_25px_80px_rgba(0,0,0,0.55)]
        transition-all duration-300
      "
    >

      {/* TITLE */}
      <h2
        className={`text-2xl font-semibold mb-4 ${
          isHighRisk ? "text-red-400" : "text-green-400"
        }`}
      >
        {isHighRisk ? "High Risk Transaction" : "Low Risk Transaction"}
      </h2>

      {/* CONFIDENCE HEADER */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[#9FB7A7] text-sm">
          Confidence Level
        </span>
        <span className="text-white font-semibold text-[15px]">
          {percent}%
        </span>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-3 bg-[#1F3A2F] rounded-full overflow-hidden">

        <div
          className={`
            h-3 rounded-full
            transition-all duration-700 ease-out
            ${
              isHighRisk
                ? "bg-red-500 shadow-[0_0_14px_rgba(255,0,0,0.7)]"
                : "bg-[#8BC34A] shadow-[0_0_14px_rgba(139,195,74,0.7)]"
            }
          `}
          style={{ width: `${percent}%` }}
        />

      </div>

    </div>
  );
}