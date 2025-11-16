import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { achievementData } from './AchievementBadge';

export default function AchievementNotification({ achievement, onClose }) {
  const achievementInfo = achievementData[achievement?.achievement_type];

  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement || !achievementInfo) return null;

  const Icon = achievementInfo.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-24 right-6 z-[100] w-80 pointer-events-auto"
      >
        <div className="bg-gradient-to-br from-yellow-900/95 to-orange-900/95 backdrop-blur-xl border-2 border-yellow-400/50 rounded-2xl p-6 shadow-2xl"
          style={{ boxShadow: '0 0 40px rgba(251, 191, 36, 0.5)' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1.1, 1]
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center"
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-yellow-200 font-bold text-lg">Achievement Unlocked!</h3>
                <p className="text-yellow-300/80 text-xs">New badge earned</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-yellow-300/60" />
            </button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-yellow-400/30">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border-2 border-yellow-400"
              style={{ boxShadow: `0 0 20px ${achievementInfo.color}80` }}>
              <Icon className="w-8 h-8" style={{ color: achievementInfo.color }} />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">{achievementInfo.name}</h4>
              <p className="text-white/70 text-sm">{achievementInfo.description}</p>
              <div className="mt-2">
                <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                  {achievementInfo.rarity.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <motion.div
            className="mt-4 text-center text-yellow-300/60 text-xs"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨ Keep up the great work! ✨
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}