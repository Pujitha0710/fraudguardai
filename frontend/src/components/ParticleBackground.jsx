import { useEffect, useState } from "react";

export default function ParticleBackground() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: 70 }).map(() => {
      const isNear = Math.random() > 0.5;

      return {
        id: Math.random(),
        left: Math.random() * 100,

        size: isNear
          ? Math.random() * 4 + 3   // near = bigger
          : Math.random() * 2 + 1,  // far = smaller

        duration: isNear
          ? Math.random() * 10 + 8  // near = faster
          : Math.random() * 20 + 15, // far = slower

        opacity: isNear ? 0.5 : 0.25,
      };
    });

    setParticles(generated);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            bottom: 0,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",

            background: "#8BC34A",

            opacity: p.opacity,

            // ✨ glow effect
            boxShadow: "0 0 8px rgba(139,195,74,0.6)",

            animation: `float ${p.duration}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}