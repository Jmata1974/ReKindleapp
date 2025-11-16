import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Users, TrendingUp, Heart, Zap, ArrowRight, Star, Plus, Bell, BookOpen, Eye, X } from 'lucide-react';
import CosmicBackground from '../components/CosmicBackground';
import Navigation from '../components/Navigation';
import BottomNavigation from '../components/BottomNavigation';
import OnboardingFlow from '../components/OnboardingFlow';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function QuickStartModal({ isOpen, onClose, guideSteps }) {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-3xl w-[90%] max-h-[80vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-indigo-950/95 to-purple-950/95 backdrop-blur-xl border border-white/10 p-6 shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <BookOpen className="w-8 h-8 text-purple-400" />
              Quick Start Guide
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guideSteps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left"
                style={{
                  boxShadow: `0 0 30px ${step.color}15`
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ 
                      backgroundColor: `${step.color}20`,
                      boxShadow: `0 0 20px ${step.color}30`
                    }}
                  >
                    <step.icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-white/70">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [buttonClicked, setButtonClicked] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
    initialData: []
  });

  const theme = user?.theme || 'cosmic';

  // Check if onboarding should be shown
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    const isNewUser = contacts.length === 0;
    
    if (!onboardingCompleted && isNewUser) {
      // Show onboarding for new users after a short delay
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [contacts]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Navigate to Orbit page
    navigate(createPageUrl('Orbit'));
  };

  const textGlows = {
    cosmic: '0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(236, 72, 153, 0.3)',
    sunrise: '0 0 40px rgba(255, 107, 107, 0.5), 0 0 80px rgba(255, 163, 102, 0.3)',
    retro: '0 0 40px rgba(255, 0, 255, 0.6), 0 0 80px rgba(0, 255, 255, 0.4)',
    aurora: '0 0 40px rgba(52, 211, 153, 0.5), 0 0 80px rgba(139, 92, 246, 0.3)',
    solar: '0 0 40px rgba(245, 158, 11, 0.5), 0 0 80px rgba(239, 68, 68, 0.3)',
    ocean: '0 0 40px rgba(79, 70, 229, 0.5), 0 0 80px rgba(103, 232, 249, 0.3)'
  };

  const buttonGlows = {
    cosmic: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)',
    sunrise: '0 0 30px rgba(255, 107, 107, 0.5), 0 0 60px rgba(255, 107, 107, 0.3)',
    retro: '0 0 30px rgba(255, 0, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.4)',
    aurora: '0 0 30px rgba(52, 211, 153, 0.5), 0 0 60px rgba(52, 211, 153, 0.3)',
    solar: '0 0 30px rgba(245, 158, 11, 0.5), 0 0 60px rgba(245, 158, 11, 0.3)',
    ocean: '0 0 30px rgba(79, 70, 229, 0.5), 0 0 60px rgba(79, 70, 229, 0.3)'
  };

  const handleButtonClick = () => {
    setButtonClicked(true);
    setTimeout(() => navigate(createPageUrl('Orbit')), 800);
  };

  const handleRewatchTour = () => {
    // Restart onboarding flow
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_step');
    setShowOnboarding(true);
  };

  const stats = [
    { icon: Users, label: 'Contacts', value: contacts.length, color: '#8b5cf6' },
    { icon: Heart, label: 'Inner Circle', value: contacts.filter(c => c.orbit_level <= 3).length, color: '#ec4899' },
    { icon: TrendingUp, label: 'Active', value: contacts.filter(c => c.last_contacted).length, color: '#10b981' },
    { icon: Zap, label: 'Health', value: contacts.length > 0 ? Math.round(contacts.reduce((sum, c) => sum + (c.health_score || 70), 0) / contacts.length) : 0, color: '#fbbf24' }
  ];

  const guideSteps = [
    {
      icon: Plus,
      title: 'Add Connections',
      description: 'Tap the + button to add someone to your orbit',
      color: '#8b5cf6'
    },
    {
      icon: Sparkles,
      title: 'Orbit Levels',
      description: 'Inner rings = recent connections; outer rings fade with time',
      color: '#ec4899'
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'AI-powered suggestions to reconnect at the perfect time',
      color: '#10b981'
    },
    {
      icon: BookOpen,
      title: 'Insights & Notes',
      description: 'Track conversations and get relationship health scores',
      color: '#fbbf24'
    }
  ];

  return (
    <div className="relative w-full min-h-screen overflow-y-auto overflow-x-hidden">
      <CosmicBackground theme={theme} />
      <Navigation currentPage="Home" theme={theme} />
      
      {/* Onboarding Flow */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
        theme={theme}
      />

      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="text-center z-10 max-w-5xl mx-auto">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <motion.h1
              className="font-extrabold text-6xl md:text-8xl tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400"
              style={{ textShadow: textGlows[theme] }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              ReKindle
            </motion.h1>
            
            <motion.p
              className="text-2xl md:text-3xl text-white/90 font-light mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              Reconnect. Reflect. Rekindle.
            </motion.p>

            <motion.p
              className="text-lg text-white/60 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Your AI-powered relationship management system. Never lose touch with the people who matter most.
            </motion.p>
          </motion.div>

          {/* Stats Cards */}
          {contacts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + idx * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  style={{
                    boxShadow: `0 0 30px ${stat.color}20`
                  }}
                >
                  <stat.icon className="w-8 h-8 mb-3 mx-auto" style={{ color: stat.color }} />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            {/* Primary CTA */}
            <motion.button
              onClick={handleButtonClick}
              disabled={buttonClicked}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group px-12 py-6 text-xl md:text-2xl font-bold text-white rounded-full overflow-hidden"
              style={{
                background: theme === 'retro'
                  ? 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              }}
            >
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)',
                    'linear-gradient(135deg, rgba(236, 72, 153, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                    'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                  transform: 'translateX(-100%)',
                }}
                animate={{
                  transform: ['translateX(-100%)', 'translateX(100%)'],
                }}
                transition={{
                  duration: 2,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />

              {/* Button content */}
              <span className="relative z-10 flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                {buttonClicked ? 'Loading...' : 'Enter Your Orbit'}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>

              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    buttonGlows[theme],
                    `0 0 40px ${theme === 'retro' ? 'rgba(255, 0, 255, 0.7)' : 'rgba(139, 92, 246, 0.7)'}, 0 0 80px ${theme === 'retro' ? 'rgba(0, 255, 255, 0.5)' : 'rgba(236, 72, 153, 0.5)'}`,
                    buttonGlows[theme],
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            {/* Secondary Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Quick Start Button */}
              <motion.button
                onClick={() => setIsQuickStartOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 text-lg font-semibold text-white rounded-full border-2 border-white/30 backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <BookOpen className="w-5 h-5" />
                Quick Start
              </motion.button>

              {/* Start Tour Button */}
              <motion.button
                onClick={handleRewatchTour}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 text-lg font-semibold text-white rounded-full border-2 border-white/30 backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <Eye className="w-5 h-5" />
                {localStorage.getItem('onboarding_completed') ? 'Restart Tour' : 'Start Tour'}
              </motion.button>
            </div>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: Sparkles, title: 'AI-Powered', desc: 'Smart reminders and insights' },
              { icon: Heart, title: 'Visual Orbits', desc: 'See your relationships at a glance' },
              { icon: Star, title: 'Stay Connected', desc: 'Never lose touch again' }
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <feature.icon className="w-10 h-10 mb-4 mx-auto text-purple-400" />
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-white/60"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Quick Start Modal */}
      <QuickStartModal
        isOpen={isQuickStartOpen}
        onClose={() => setIsQuickStartOpen(false)}
        guideSteps={guideSteps}
      />

      <BottomNavigation currentPage="Home" />
    </div>
  );
}