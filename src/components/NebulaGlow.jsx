import React from 'react';
import { motion } from 'framer-motion';

export default function NebulaGlow({ theme = 'cosmic' }) {
  const themeColors = {
    cosmic: 'rgba(170, 100, 255, 0.25)',
    sunrise: 'rgba(255, 107, 107, 0.25)',
    retro: 'rgba(255, 0, 255, 0.3)',
    aurora: 'rgba(52, 211, 153, 0.25)',
    solar: 'rgba(251, 191, 36, 0.25)',
    ocean: 'rgba(79, 70, 229, 0.25)'
  };

  const baseColor = themeColors[theme] || themeColors.cosmic;

  // Special retro/synthwave gradient
  const isRetro = theme === 'retro';

  return (
    <motion.div
      className="absolute"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '1400px',
        height: '1400px',
        borderRadius: '50%',
        background: isRetro 
          ? `radial-gradient(circle, rgba(255, 0, 255, 0.3) 0%, rgba(157, 0, 255, 0.2) 20%, rgba(0, 255, 255, 0.15) 40%, rgba(0, 0, 0, 0) 70%)`
          : `radial-gradient(circle, ${baseColor} 0%, rgba(0, 180, 255, 0.15) 30%, rgba(0, 128, 255, 0.1) 50%, rgba(0, 200, 255, 0) 70%)`,
        zIndex: 1,
        pointerEvents: 'none',
        filter: isRetro ? 'blur(100px)' : 'blur(80px)',
        boxShadow: isRetro ? '0 0 100px rgba(255, 0, 255, 0.5), 0 0 200px rgba(0, 255, 255, 0.3)' : 'none'
      }}
      animate={{
        opacity: isRetro ? [0.4, 0.6, 0.4] : [0.25, 0.35, 0.25],
        filter: isRetro 
          ? [
              'hue-rotate(0deg) blur(100px)',
              'hue-rotate(60deg) blur(120px)',
              'hue-rotate(120deg) blur(100px)',
              'hue-rotate(180deg) blur(120px)',
              'hue-rotate(240deg) blur(100px)',
              'hue-rotate(300deg) blur(120px)',
              'hue-rotate(360deg) blur(100px)',
            ]
          : [
              'hue-rotate(0deg) blur(80px)',
              'hue-rotate(120deg) blur(100px)',
              'hue-rotate(240deg) blur(80px)',
              'hue-rotate(360deg) blur(80px)',
            ],
      }}
      transition={{
        duration: isRetro ? 12 : 25,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
    />
  );
}