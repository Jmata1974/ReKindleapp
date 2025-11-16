import React from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';

export default function HealthScoreIndicator({ score, size = 'medium', showLabel = true, showTrend = false, trend, theme = 'cosmic' }) {
  if (score === undefined || score === null) return null;

  const getHealthColor = (score) => {
    if (score >= 90) return { color: '#10b981', label: 'Excellent', icon: CheckCircle };
    if (score >= 70) return { color: '#3b82f6', label: 'Good', icon: TrendingUp };
    if (score >= 50) return { color: '#fbbf24', label: 'Fair', icon: Minus };
    if (score >= 30) return { color: '#f97316', label: 'Poor', icon: TrendingDown };
    return { color: '#ef4444', label: 'Critical', icon: AlertTriangle };
  };

  const sizes = {
    small: { container: 'w-12 h-12', text: 'text-xs', icon: 'w-3 h-3' },
    medium: { container: 'w-16 h-16', text: 'text-sm', icon: 'w-4 h-4' },
    large: { container: 'w-24 h-24', text: 'text-lg', icon: 'w-6 h-6' }
  };

  const health = getHealthColor(score);
  const Icon = health.icon;
  const isRetro = theme === 'retro';

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${sizes[size].container} relative`}
      >
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke={isRetro ? 'rgba(0, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)'}
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke={health.color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              strokeDasharray: circumference,
              filter: `drop-shadow(0 0 8px ${health.color})`
            }}
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${sizes[size].text} font-bold text-white`}>{score}</span>
        </div>

        {/* Pulsing glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 20px ${health.color}40`
          }}
          animate={{
            boxShadow: [
              `0 0 20px ${health.color}40`,
              `0 0 30px ${health.color}60`,
              `0 0 20px ${health.color}40`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {showLabel && (
        <div className="flex items-center gap-1">
          <Icon className={`${sizes[size].icon}`} style={{ color: health.color }} />
          <span className="text-white/80 text-xs font-semibold">{health.label}</span>
        </div>
      )}

      {showTrend && trend && (
        <div className="flex items-center gap-1">
          {trend === 'improving' && <TrendingUp className="w-3 h-3 text-green-400" />}
          {trend === 'declining' && <TrendingDown className="w-3 h-3 text-red-400" />}
          {trend === 'stable' && <Minus className="w-3 h-3 text-gray-400" />}
          <span className="text-xs text-white/60 capitalize">{trend}</span>
        </div>
      )}
    </div>
  );
}