
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Users, 
  Orbit as OrbitIcon, 
  Brain, 
  ArrowRight, 
  ArrowLeft,
  Check,
  X,
  Play,
  Target,
  MessageCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Your Galaxy',
    description: 'Your intelligent relationship management system',
    icon: Sparkles,
    content: 'Everyone in your life has gravity. Each relationship pulls you closer or drifts away depending on how often you connect. ReKindle turns your contacts into a living galaxy so you can see who matters—and who may be slipping to the edges.',
    illustration: 'welcome'
  },
  {
    id: 'orbit-intro',
    title: 'The Orbit View',
    description: 'See your relationships in a whole new way',
    icon: OrbitIcon,
    content: 'Your people become planets. Each ring represents closeness. Inner rings show frequent connection; outer rings reveal relationships that might need attention. Pinch, zoom, and explore your entire social universe.',
    illustration: 'orbit',
    features: [
      '12 orbital rings from innermost to outermost',
      'Contacts drift outward over time without interaction',
      'Move contacts inward by staying in touch',
      'Color-coded by relationship type'
    ]
  },
  {
    id: 'filters',
    title: 'Relationship Health Filters',
    description: 'Let\'s start building your network',
    icon: Users,
    content: 'See what needs your care. Use filters to reveal friends and family based on contact frequency, relationship strength, time since last check-in, or emotional risk.',
    illustration: 'contact',
    interactive: false
  },
  {
    id: 'command-center',
    title: 'Command Center',
    description: 'Let intelligence guide your relationships',
    icon: Brain,
    content: 'One place for everything. Tap the menu icon to access your themes, soundscapes, notes, reminders, and navigation. It\'s your control room—clean, simple, and always within reach.',
    illustration: 'ai',
    features: [
      'Smart conversation starters',
      'Sentiment trend analysis',
      'Proactive risk detection',
      'Optimal contact timing',
      'Behavior pattern learning'
    ]
  },
  {
    id: 'orbit-controls',
    title: 'Orbit Controls',
    description: 'Everything you need to stay connected',
    icon: Target,
    content: 'Zoom in, zoom out, adjust your universe. Use the Orbit controls at the bottom of the screen to fine-tune the spacing of your rings and the scale of your galaxy.',
    illustration: 'features',
    features: [
      {
        icon: MessageCircle,
        title: 'Smart Reminders',
        description: 'AI-powered follow-up suggestions'
      },
      {
        icon: Calendar,
        title: 'Notes & History',
        description: 'Track interactions and important details'
      },
      {
        icon: TrendingUp,
        title: 'Network Health',
        description: 'Monitor relationship strength over time'
      },
      {
        icon: OrbitIcon,
        title: 'Orbit Intelligence',
        description: 'Automatic relationship drift detection'
      }
    ]
  },
  {
    id: 'complete',
    title: 'You\'re Ready',
    description: 'Start nurturing your relationships',
    icon: Check,
    content: 'Your relationships deserve attention—not guilt. ReKindle helps you stay close to the people who matter most. Explore your galaxy whenever you need perspective.',
    illustration: 'complete'
  }
];

export default function OnboardingFlow({ isOpen, onClose, onComplete, theme = 'cosmic' }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const navigate = useNavigate();

  const isRetro = theme === 'retro';
  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    // Save progress
    if (isOpen) {
      localStorage.setItem('onboarding_step', currentStep.toString());
    }
  }, [currentStep, isOpen]);

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, step.id]));
    
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (showSkipConfirm) {
      localStorage.setItem('onboarding_completed', 'skipped');
      onComplete();
    } else {
      setShowSkipConfirm(true);
      setTimeout(() => setShowSkipConfirm(false), 3000);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_step', '0');
    onComplete();
  };

  const handleInteractiveAction = () => {
    if (step.action === 'add-contact') {
      // Mark step as completed and move to next
      setCompletedSteps(prev => new Set([...prev, step.id]));
      // Close onboarding temporarily and navigate to Orbit page
      onClose();
      navigate(createPageUrl('Orbit'));
      // User will need to manually continue onboarding or it will resume later
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Main Content - NOW SCROLLABLE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl mx-4 max-h-[85vh] overflow-y-auto bg-gradient-to-br from-indigo-950/95 to-purple-950/95 backdrop-blur-xl rounded-2xl shadow-2xl"
          style={{
            border: isRetro ? '2px solid rgba(0, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gradient-to-br from-indigo-950/95 to-purple-950/95 backdrop-blur-xl z-10">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <step.icon className={`w-8 h-8 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                <p className="text-white/60 text-sm">{step.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/60 text-sm">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${isRetro ? 'bg-gradient-to-r from-cyan-500 to-pink-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Content - Scrollable area */}
          <div className="p-6 min-h-[400px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                {/* Illustration */}
                <div className="mb-6 flex justify-center">
                  <OnboardingIllustration type={step.illustration} theme={theme} />
                </div>

                {/* Content */}
                <p className="text-white/80 text-lg mb-6 leading-relaxed text-center">
                  {step.content}
                </p>

                {/* Features List */}
                {step.features && Array.isArray(step.features) && typeof step.features[0] === 'string' && (
                  <div className="space-y-3 mb-6">
                    {step.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                        <span className="text-white/90">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Feature Cards */}
                {step.features && Array.isArray(step.features) && typeof step.features[0] === 'object' && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {step.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <feature.icon className={`w-6 h-6 mb-2 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                        <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                        <p className="text-white/60 text-sm">{feature.description}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Interactive Actions */}
                {step.interactive && (
                  <div className="flex justify-center mb-6">
                    <Button
                      onClick={handleInteractiveAction}
                      size="lg"
                      className={`${
                        isRetro
                          ? 'bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      } text-white shadow-lg`}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Try It Now
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer - Sticky at bottom */}
          <div className="p-6 border-t border-white/10 flex items-center justify-between sticky bottom-0 bg-gradient-to-br from-indigo-950/95 to-purple-950/95 backdrop-blur-xl">
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/5"
              >
                {showSkipConfirm ? 'Click again to skip' : 'Skip Tour'}
              </Button>
            </div>

            <Button
              onClick={handleNext}
              size="lg"
              className={`${
                isRetro
                  ? 'bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              } text-white shadow-lg`}
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Check className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function OnboardingIllustration({ type, theme }) {
  const isRetro = theme === 'retro';
  
  // Theme-aware color palette
  const getThemeColors = () => {
    switch(theme) {
      case 'retro':
        return { primary: '#00ffff', secondary: '#ff00ff', tertiary: '#9d00ff' };
      case 'sunrise':
        return { primary: '#ff6b6b', secondary: '#ffa366', tertiary: '#f59e0b' };
      case 'aurora':
        return { primary: '#34d399', secondary: '#8b5cf6', tertiary: '#ec4899' };
      case 'solar':
        return { primary: '#f59e0b', secondary: '#ef4444', tertiary: '#fbbf24' };
      case 'ocean':
        return { primary: '#4f46e5', secondary: '#67e8f9', tertiary: '#8b5cf6' };
      default: // cosmic
        return { primary: '#8b5cf6', secondary: '#ec4899', tertiary: '#fbbf24' };
    }
  };

  const colors = getThemeColors();
  
  const illustrations = {
    welcome: (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="relative w-64 h-64"
      >
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full"
              style={{
                background: i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.tertiary,
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 30}deg) translateY(-90px)`,
                boxShadow: `0 0 20px ${i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.tertiary}`
              }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.15
              }}
            />
          ))}
        </motion.div>

        {/* Inner counter-rotating ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: colors.secondary,
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 45}deg) translateY(-60px)`,
                boxShadow: `0 0 15px ${colors.secondary}`
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>

        {/* Central glowing icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.15, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ background: colors.primary, opacity: 0.4 }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Sparkles className="w-20 h-20 relative z-10" style={{ color: colors.primary }} />
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: colors.tertiary,
              top: `${30 + Math.sin(i) * 30}%`,
              left: `${30 + Math.cos(i) * 30}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
      </motion.div>
    ),
    orbit: (
      <div className="relative w-80 h-80">
        {/* Central sun */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <motion.div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
            animate={{
              boxShadow: [
                `0 0 20px ${colors.tertiary}`,
                `0 0 40px ${colors.tertiary}`,
                `0 0 20px ${colors.tertiary}`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Animated orbit rings with glow */}
        {[1, 2, 3, 4, 5].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ delay: ring * 0.15, type: 'spring' }}
          >
            <motion.div
              className="border-2 rounded-full"
              style={{
                width: `${ring * 55}px`,
                height: `${ring * 55}px`,
                borderColor: colors.primary,
                borderStyle: 'dashed'
              }}
              animate={{
                rotate: ring % 2 === 0 ? 360 : -360,
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                rotate: { duration: 40 + ring * 5, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 3, repeat: Infinity }
              }}
            />
          </motion.div>
        ))}

        {/* Animated contact spheres on different orbits */}
        {[
          { angle: 0, ring: 1, delay: 0.5 },
          { angle: 120, ring: 1, delay: 0.6 },
          { angle: 240, ring: 1, delay: 0.7 },
          { angle: 45, ring: 2, delay: 0.8 },
          { angle: 180, ring: 2, delay: 0.9 },
          { angle: 315, ring: 2, delay: 1.0 },
          { angle: 90, ring: 3, delay: 1.1 },
          { angle: 270, ring: 3, delay: 1.2 },
          { angle: 30, ring: 4, delay: 1.3 },
          { angle: 150, ring: 4, delay: 1.4 },
          { angle: 210, ring: 5, delay: 1.5 },
        ].map(({ angle, ring, delay }, idx) => (
          <motion.div
            key={idx}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `rotate(${angle}deg) translateY(-${ring * 27.5}px) rotate(-${angle}deg)`
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay, type: 'spring', stiffness: 200 }}
          >
            <motion.div
              className="w-5 h-5 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 0 15px ${idx % 2 === 0 ? colors.primary : colors.secondary}`
              }}
              animate={{
                scale: [1, 1.3, 1],
                boxShadow: [
                  `0 0 10px ${colors.primary}`,
                  `0 0 20px ${colors.secondary}`,
                  `0 0 10px ${colors.primary}`
                ]
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          </motion.div>
        ))}

        {/* Connecting lines animation */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute top-1/2 left-1/2 w-px h-20 origin-bottom"
            style={{
              background: `linear-gradient(to top, transparent, ${colors.secondary}50)`,
              transform: `rotate(${i * 120}deg)`
            }}
            animate={{
              scaleY: [0.5, 1, 0.5],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
      </div>
    ),
    contact: (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-64 h-64 flex items-center justify-center"
      >
        {/* Pulsing background circles */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full border-2"
            style={{
              width: `${ring * 80}px`,
              height: `${ring * 80}px`,
              borderColor: colors.primary,
              opacity: 0.2
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: ring * 0.3
            }}
          />
        ))}

        {/* Main contact sphere */}
        <motion.div
          className="relative z-10"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
            }}
            animate={{
              boxShadow: [
                `0 0 30px ${colors.primary}`,
                `0 0 50px ${colors.secondary}`,
                `0 0 30px ${colors.primary}`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
              }}
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
            <Users className="w-16 h-16 text-white relative z-10" />
          </motion.div>

          {/* Success checkmark */}
          <motion.div
            className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center border-4 border-white z-20"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Check className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>

          {/* Plus icon particles */}
          {[0, 90, 180, 270].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-6 h-6 flex items-center justify-center rounded-full bg-white/20"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translateY(-70px)`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            >
              <Users className="w-4 h-4 text-white" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    ),
    ai: (
      <motion.div
        className="relative w-72 h-72 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Neural network background */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 200">
          {[...Array(8)].map((_, i) => {
            const angle1 = (i * Math.PI * 2) / 8;
            const x1 = 100 + Math.cos(angle1) * 70;
            const y1 = 100 + Math.sin(angle1) * 70;
            return [...Array(8)].map((_, j) => {
              if (j <= i) return null;
              const angle2 = (j * Math.PI * 2) / 8;
              const x2 = 100 + Math.cos(angle2) * 70;
              const y2 = 100 + Math.sin(angle2) * 70;
              return (
                <motion.line
                  key={`${i}-${j}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={colors.primary}
                  strokeWidth="0.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 2, delay: (i + j) * 0.1 }}
                />
              );
            });
          })}
        </svg>

        {/* Orbiting data nodes */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 8;
          return (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full"
              style={{
                background: colors.secondary,
                boxShadow: `0 0 15px ${colors.secondary}`,
                top: '50%',
                left: '50%',
                marginLeft: '-8px',
                marginTop: '-8px'
              }}
              animate={{
                x: Math.cos(angle) * 100,
                y: Math.sin(angle) * 100,
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                x: { duration: 5, repeat: Infinity, ease: 'linear' },
                y: { duration: 5, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, delay: i * 0.2 },
                opacity: { duration: 2, repeat: Infinity, delay: i * 0.2 }
              }}
            />
          );
        })}

        {/* Central brain with holographic effect */}
        <motion.div
          className="relative z-10"
          animate={{ 
            y: [0, -15, 0],
            rotateY: [0, 360]
          }}
          transition={{ 
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            rotateY: { duration: 8, repeat: Infinity, ease: 'linear' }
          }}
        >
          <motion.div
            className="relative w-32 h-32 rounded-2xl backdrop-blur-sm flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
              border: `2px solid ${colors.primary}40`
            }}
            animate={{
              boxShadow: [
                `0 0 30px ${colors.primary}40`,
                `0 0 50px ${colors.secondary}60`,
                `0 0 30px ${colors.primary}40`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Scanning lines */}
            <motion.div
              className="absolute inset-0 overflow-hidden rounded-2xl"
            >
              <motion.div
                className="absolute w-full h-1"
                style={{
                  background: `linear-gradient(90deg, transparent, ${colors.tertiary}, transparent)`,
                  boxShadow: `0 0 10px ${colors.tertiary}`
                }}
                animate={{
                  y: ['0%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </motion.div>

            <Brain className="w-16 h-16 relative z-10" style={{ color: colors.primary }} />
          </motion.div>
        </motion.div>

        {/* AI thinking particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: colors.tertiary,
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}

        {/* Insight badges */}
        {['💡', '🎯', '📊', '✨'].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{
              top: `${15 + i * 22}%`,
              left: i % 2 === 0 ? '5%' : '90%'
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              y: [0, -5, 0]
            }}
            transition={{
              scale: { delay: 1 + i * 0.2, type: 'spring' },
              rotate: { delay: 1 + i * 0.2, type: 'spring' },
              y: { duration: 2, repeat: Infinity, delay: i * 0.3 }
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </motion.div>
    ),
    features: (
      <div className="relative w-72 h-64">
        {/* Animated grid layout */}
        <div className="grid grid-cols-2 gap-6">
          {[
            { icon: MessageCircle, color: colors.primary, label: 'Reminders' },
            { icon: Calendar, color: colors.secondary, label: 'History' },
            { icon: TrendingUp, color: colors.tertiary, label: 'Insights' },
            { icon: OrbitIcon, color: colors.primary, label: 'Intelligence' }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ 
                delay: idx * 0.15, 
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.2 }
              }}
              className="relative"
            >
              {/* Card background with gradient */}
              <motion.div
                className="w-28 h-28 rounded-2xl backdrop-blur-sm border-2 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}05)`,
                  borderColor: `${feature.color}40`
                }}
                animate={{
                  boxShadow: [
                    `0 0 20px ${feature.color}30`,
                    `0 0 35px ${feature.color}50`,
                    `0 0 20px ${feature.color}30`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, ${feature.color}20 50%, transparent 70%)'
                  }}
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    delay: idx * 0.5
                  }}
                />

                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: idx * 0.3
                  }}
                >
                  <feature.icon className="w-12 h-12" style={{ color: feature.color }} />
                </motion.div>

                <span className="text-xs font-semibold text-white/80">{feature.label}</span>

                {/* Corner sparkle */}
                <motion.div
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ background: feature.color }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: idx * 0.5
                  }}
                />
              </motion.div>

              {/* Connection lines between cards */}
              {idx < 3 && (
                <motion.div
                  className="absolute w-px h-6 bg-gradient-to-b from-transparent via-white/30 to-transparent"
                  style={{
                    top: '50%',
                    [idx % 2 === 0 ? 'right' : 'left']: '-12px',
                    transform: idx < 2 ? 'translateY(-50%)' : 'translateY(-50%) rotate(90deg)'
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.8 + idx * 0.2 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Central connecting node */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full z-10"
          style={{
            background: colors.tertiary,
            boxShadow: `0 0 20px ${colors.tertiary}`
          }}
          initial={{ scale: 0 }}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity },
            opacity: { duration: 2, repeat: Infinity }
          }}
        />
      </div>
    ),
    complete: (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="relative w-64 h-64 flex items-center justify-center"
      >
        {/* Celebration confetti */}
        {[...Array(20)].map((_, i) => {
          const angle = (Math.PI * 2 * i) / 20;
          const distance = 80 + Math.random() * 40;
          return (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.tertiary
              }}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0
              }}
              animate={{
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                scale: [0, 1.5, 1],
                opacity: [0, 1, 0],
                rotate: [0, 360]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.03,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          );
        })}

        {/* Success checkmark with rings */}
        <motion.div
          className="relative z-10"
        >
          {/* Expanding rings */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-green-400"
              initial={{ width: 0, height: 0, opacity: 0 }}
              animate={{
                width: `${ring * 60}px`,
                height: `${ring * 60}px`,
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: ring * 0.3
              }}
            />
          ))}

          {/* Main checkmark circle */}
          <motion.div
            className="relative w-40 h-40 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl"
            animate={{
              boxShadow: [
                '0 0 30px rgba(34, 197, 94, 0.5)',
                '0 0 60px rgba(34, 197, 94, 0.8)',
                '0 0 30px rgba(34, 197, 94, 0.5)'
              ],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                }}
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.3,
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
            >
              <Check className="w-24 h-24 text-white relative z-10" strokeWidth={3} />
            </motion.div>
          </motion.div>

          {/* Trophy/star particles */}
          {['🎉', '✨', '🌟', '🎊'].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl"
              style={{
                top: i % 2 === 0 ? '-20px' : 'auto',
                bottom: i % 2 === 0 ? 'auto' : '-20px',
                left: i < 2 ? '-30px' : 'auto',
                right: i < 2 ? 'auto' : '-30px'
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
                y: [0, -10, 0]
              }}
              transition={{
                delay: 0.5 + i * 0.1,
                duration: 2,
                repeat: Infinity
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    )
  };

  return illustrations[type] || null;
}
