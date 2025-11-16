import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';

export default function PointsNotification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handlePointsEarned = (e) => {
      const { points, reason, action } = e.detail;
      const id = Date.now() + Math.random();
      
      setNotifications(prev => [...prev, { id, points, reason, action }]);
      
      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
    };

    window.addEventListener('pointsEarned', handlePointsEarned);
    return () => window.removeEventListener('pointsEarned', handlePointsEarned);
  }, []);

  return (
    <div className="fixed top-24 right-6 z-[100] space-y-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-gradient-to-r from-purple-600/95 to-pink-600/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl pointer-events-auto min-w-[280px]"
            style={{
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)'
            }}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </motion.div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-white">+{notif.points}</span>
                  <span className="text-yellow-300 text-sm font-semibold">XP</span>
                </div>
                <p className="text-white/90 text-sm font-medium">{notif.reason}</p>
                {notif.action && (
                  <p className="text-white/60 text-xs mt-1">{notif.action}</p>
                )}
              </div>

              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                <Zap className="w-5 h-5 text-yellow-300" />
              </motion.div>
            </div>

            {/* Progress bar */}
            <motion.div
              className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}