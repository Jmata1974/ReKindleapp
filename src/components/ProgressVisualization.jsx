import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Heart, Zap, Target, Activity } from 'lucide-react';

export default function ProgressVisualization({ stats, contacts, theme = 'cosmic' }) {
  const isRetro = theme === 'retro';

  // Calculate progress metrics
  const networkGrowth = Math.min(100, (stats?.total_contacts || 0) * 2); // Cap at 50 contacts = 100%
  const innerCircleProgress = Math.min(100, ((stats?.inner_circle_count || 0) / 10) * 100); // 10 inner circle = 100%
  const engagementProgress = stats?.engagement_score || 0;
  const healthProgress = stats?.network_health_score || 0;
  const streakProgress = Math.min(100, ((stats?.current_streak || 0) / 30) * 100); // 30 days = 100%
  const aiUsageProgress = Math.min(100, ((stats?.ai_insights_generated || 0) / 50) * 100); // 50 insights = 100%

  const progressMetrics = [
    {
      label: 'Network Growth',
      value: networkGrowth,
      icon: Users,
      color: '#8b5cf6',
      description: `${stats?.total_contacts || 0} contacts`,
      target: '50 contacts'
    },
    {
      label: 'Inner Circle',
      value: innerCircleProgress,
      icon: Heart,
      color: '#ec4899',
      description: `${stats?.inner_circle_count || 0} close connections`,
      target: '10 connections'
    },
    {
      label: 'Engagement Score',
      value: engagementProgress,
      icon: Activity,
      color: '#10b981',
      description: 'Overall engagement',
      target: '100 points'
    },
    {
      label: 'Network Health',
      value: healthProgress,
      icon: TrendingUp,
      color: '#3b82f6',
      description: 'Relationship quality',
      target: '100 health'
    },
    {
      label: 'Current Streak',
      value: streakProgress,
      icon: Zap,
      color: '#f59e0b',
      description: `${stats?.current_streak || 0} days`,
      target: '30 days'
    },
    {
      label: 'AI Insights',
      value: aiUsageProgress,
      icon: Target,
      color: '#a78bfa',
      description: `${stats?.ai_insights_generated || 0} generated`,
      target: '50 insights'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {progressMetrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-2xl border backdrop-blur-xl ${
              isRetro 
                ? 'bg-black/60 border-cyan-400/30' 
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${metric.color}20` }}>
                  <Icon className="w-6 h-6" style={{ color: metric.color }} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{metric.label}</h3>
                  <p className="text-white/60 text-xs">{metric.description}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-black/40 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${metric.color}40, ${metric.color})`
                }}
              />
              
              {/* Animated shimmer */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${metric.color}60 50%, transparent 100%)`,
                  width: '30%'
                }}
                animate={{
                  x: ['-100%', '400%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: index * 0.2
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm font-semibold">{Math.round(metric.value)}%</span>
              <span className="text-white/40 text-xs">{metric.target}</span>
            </div>

            {/* Milestone indicator */}
            {metric.value === 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
              >
                <span className="text-xl">🏆</span>
                <span className="text-yellow-300 text-xs font-semibold">Milestone Reached!</span>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}