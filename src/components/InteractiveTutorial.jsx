import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ArrowRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TUTORIAL_STEPS = {
  orbit: [
    {
      target: '.orbit-canvas',
      title: 'Your Network Orbit',
      description: 'This is your relationship universe. Each sphere represents a contact, arranged by closeness.',
      position: 'center'
    },
    {
      target: '.add-contact-button',
      title: 'Add Contacts',
      description: 'Click here to add new people to your network.',
      position: 'bottom'
    }
  ],
  contact: [
    {
      target: '.ai-insights-section',
      title: 'AI Insights',
      description: 'Get intelligent suggestions to improve your relationship with this contact.',
      position: 'left'
    }
  ]
};

export default function InteractiveTutorial({ page, isEnabled, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const steps = TUTORIAL_STEPS[page] || [];
  const step = steps[currentStep];

  useEffect(() => {
    if (isEnabled && steps.length > 0) {
      setIsActive(true);
      updatePosition();
    }
  }, [isEnabled, page]);

  useEffect(() => {
    if (isActive && step?.target) {
      updatePosition();
    }
  }, [currentStep, step]);

  const updatePosition = () => {
    if (!step?.target) return;

    const element = document.querySelector(step.target);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const newPosition = calculatePosition(rect, step.position);
    setPosition(newPosition);
  };

  const calculatePosition = (rect, position) => {
    const spacing = 20;
    
    switch (position) {
      case 'top':
        return { x: rect.left + rect.width / 2, y: rect.top - spacing };
      case 'bottom':
        return { x: rect.left + rect.width / 2, y: rect.bottom + spacing };
      case 'left':
        return { x: rect.left - spacing, y: rect.top + rect.height / 2 };
      case 'right':
        return { x: rect.right + spacing, y: rect.top + rect.height / 2 };
      case 'center':
      default:
        return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem(`tutorial_${page}_completed`, 'true');
    onComplete?.();
  };

  if (!isActive || !step) return null;

  return (
    <AnimatePresence>
      {/* Spotlight Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] pointer-events-none"
        style={{
          background: 'radial-gradient(circle 200px at var(--spotlight-x) var(--spotlight-y), transparent 0%, rgba(0,0,0,0.8) 100%)',
          '--spotlight-x': `${position.x}px`,
          '--spotlight-y': `${position.y}px`
        }}
      />

      {/* Tutorial Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[95] max-w-sm"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="bg-gradient-to-br from-indigo-950/95 to-purple-950/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-6 pointer-events-auto">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span className="text-white/60 text-sm">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={handleComplete}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
          <p className="text-white/80 mb-4">{step.description}</p>

          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentStep ? 'bg-purple-400 w-8' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                'Got it!'
              )}
            </Button>
          </div>
        </div>

        {/* Arrow pointer */}
        {step.position !== 'center' && (
          <div
            className="absolute w-4 h-4 bg-gradient-to-br from-indigo-950 to-purple-950 border-l border-t border-white/10 transform rotate-45"
            style={{
              [step.position === 'top' ? 'bottom' : step.position === 'bottom' ? 'top' : step.position === 'left' ? 'right' : 'left']: '-8px',
              left: step.position === 'top' || step.position === 'bottom' ? '50%' : step.position === 'left' ? 'auto' : '0',
              top: step.position === 'left' || step.position === 'right' ? '50%' : step.position === 'top' ? 'auto' : '0',
              transform: step.position === 'top' || step.position === 'bottom' ? 'translateX(-50%) rotate(45deg)' : 'translateY(-50%) rotate(45deg)'
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}