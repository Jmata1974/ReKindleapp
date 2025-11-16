import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function HintOverlay() {
  const [visible, setVisible] = useState(false);
  const [tourRun, setTourRun] = useState(false);

  useEffect(() => {
    // Broader mobile detection
    const isMobile = 
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || 
      window.innerWidth < 1024;
    
    // Check if user has been onboarded
    const hasBeenOnboarded = localStorage.getItem('rekindleOnboarded');
    
    if (isMobile && !hasBeenOnboarded) {
      // Show immediately on mount for first-time users
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        localStorage.setItem('rekindleOnboarded', 'true');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle tour restart from Home page
  useEffect(() => {
    const handleTourRestart = () => {
      localStorage.removeItem('rekindleOnboarded');
      setTourRun(true);
      setVisible(true);
      
      // Hide after 4 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        localStorage.setItem('rekindleOnboarded', 'true');
        setTourRun(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    };
    
    window.addEventListener('startRekindleTour', handleTourRestart);
    return () => window.removeEventListener('startRekindleTour', handleTourRestart);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: 0.4, 
            ease: 'easeOut'
          }}
          className="fixed left-1/2 z-[2000] pointer-events-none"
          style={{
            bottom: '120px',
            transform: 'translateX(-50%)'
          }}
        >
          <div 
            className="backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium whitespace-nowrap">
              {tourRun ? 'Welcome back! Tap ＋ to add a connection' : 'Tap ＋ to add a connection'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}