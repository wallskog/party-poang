"use client";

import { useEffect, useState } from "react";

const EMOJIS = ["🎉", "🎈", "🥳", "🍾", "✨", "🪩", "🎂", "💃", "🕺", "🎊", "🍻", "⭐"];

interface Particle {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export function PartyBg() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 14,
      size: 16 + Math.random() * 14,
    }));
    setParticles(items);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-float-up"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: 0.25,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
