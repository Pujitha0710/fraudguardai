import { useState } from "react";

import Header from "../components/Header";
import PredictionForm from "../components/PredictionForm";
import ResultCard from "../components/ResultCard";
import InsightCard from "../components/InsightCard";
import Dashboard from "../components/Dashboard";
import ParticleBackground from "../components/ParticleBackground";

export default function Home() {
  const [latestResult, setLatestResult] = useState(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0E1A14]">

      {/* 🌿 PARTICLE BACKGROUND */}
      <ParticleBackground />

      {/* 🌿 MAIN CONTENT */}
      <div className="relative z-10 max-w-[1200px] mx-auto p-8">

        {/* HEADER */}
        <Header />

        {/* FLOW */}
        <div className="space-y-8">

          {/* FORM */}
          <PredictionForm onResult={setLatestResult} />

          {/* RESULT */}
          <ResultCard
            isHighRisk={latestResult?.isFraud}
            confidence={latestResult?.probability}
          />

          {/* AI INSIGHT */}
          <InsightCard latestResult={latestResult} />

          {/* DASHBOARD */}
          <Dashboard latestResult={latestResult} />

        </div>

      </div>
    </div>
  );
}