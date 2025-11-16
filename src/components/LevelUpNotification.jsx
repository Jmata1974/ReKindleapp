import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Star, Sparkles } from 'lucide-react';

export default function LevelUpNotification() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleLevelUp = (e) => {
      const { newLevel, xpEarned } = e.detail;
      setNotification({ newLevel, xpEarned });
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    };

    window.addEventListener('levelUp', handleLevelUp);
    return () => window.removeEventListener('levelUp', handleLevelUp);
  }, []);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          <div className="relative">
            {/* Explosion particles */}
            {[...Array(12)].map((_, i) => {
              const angle = (Math.PI * 2 * i) / 12;
              const distance = 120;
              return (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, #fbbf24, #f59e0b)`,
                    left: '50%',
                    top: '50%',
                    marginLeft: '-6px',
                    marginTop: '-6px'
                  }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: [1, 0],
                    scale: [1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    ease: 'easeOut'
                  }}
                />
              );
            })}

            {/* Main card */}
            <motion.div
              className="bg-gradient-to-br from-yellow-500/95 to-orange-600/95 backdrop-blur-xl border-4 border-yellow-300 rounded-3xl p-8 shadow-2xl pointer-events-auto"
              style={{
                boxShadow: '0 0 80px rgba(251, 191, 36, 0.8), 0 0 120px rgba(245, 158, 11, 0.5)'
              }}
              animate={{
                boxShadow: [
                  '0 0 80px rgba(251, 191, 36, 0.8)',
                  '0 0 120px rgba(251, 191, 36, 1)',
                  '0 0 80px rgba(251, 191, 36, 0.8)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="text-center"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="relative inline-block mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <TrendingUp className="w-20 h-20 text-white" />
                  
                  {/* Orbiting stars */}
                  {[0, 120, 240].map((angle, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        top: '50%',
                        left: '50%',
                        marginLeft: '-8px',
                        marginTop: '-8px'
                      }}
                      animate={{
                        rotate: -360,
                        x: Math.cos((angle * Math.PI) / 180) * 50,
                        y: Math.sin((angle * Math.PI) / 180) * 50
                      }}
                      transition={{
                        rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                        x: { duration: 3, repeat: Infinity, ease: 'linear' },
                        y: { duration: 3, repeat: Infinity, ease: 'linear' }
                      }}
                    >
                      <Star className="w-4 h-4 text-yellow-200" fill="currentColor" />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.h2
                  className="text-5xl font-bold text-white mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  LEVEL UP!
                </motion.h2>
                
                <motion.div
                  className="text-7xl font-black text-white mb-4"
                  animate={{
                    scale: [1, 1.2, 1],
                    textShadow: [
                      '0 0 20px rgba(255, 255, 255, 0.8)',
                      '0 0 40px rgba(255, 255, 255, 1)',
                      '0 0 20px rgba(255, 255, 255, 0.8)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {notification.newLevel}
                </motion.div>

                <p className="text-white/90 text-xl font-semibold flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  You're getting better at staying connected!
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}