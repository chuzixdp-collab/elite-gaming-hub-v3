'use client';
import { useState } from 'react';

const PARTICLES = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1 + Math.random() * 3,
  speed: 8 + Math.random() * 20,
  delay: Math.random() * 10,
}));

export function AnimatedBackground() {
  const [particles] = useState(PARTICLES);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#F5C518]/10 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-[#DC2626]/10 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-[#F5C518]/5 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#F5C518]/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `floatParticle ${p.speed}s linear ${p.delay}s infinite`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes floatParticle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
