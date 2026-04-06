import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ParticleBackground: React.FC = () => {
  const [particles, setParticles] = useState<{ id: number; top: number; left: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 4 + 1, // 1 to 5px
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-950">
      {/* Background soft glow gradient */}
      <div className="absolute -top-[30%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-900/20 blur-[120px] mix-blend-screen" />
      <div className="absolute top-[40%] -right-[20%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/20 blur-[100px] mix-blend-screen" />
      
      {/* Particle Drift */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/40"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
