import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, TrendingUp, TrendingDown, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import HealthScoreIndicator from './HealthScoreIndicator';

export default function HealthScoreCard({ contact, theme = 'cosmic' }) {
  const [expanded, setExpanded] = useState(false);
  const isRetro = theme === 'retro';

  if (!contact.health_factors) return null;

  const healthData = contact.health_factors;
  const factors = healthData.factors || {};

  const factorDetails = [
    {
      name: 'Recency',
      score: factors.recency_score,
      icon: Heart,
      description: 'How recently you connected'
    },
    {
      name: 'Goal Alignment',
      score: factors.goal_alignment_score,
      icon: TrendingUp,
      description: 'Progress toward your goal'
    },
    {
      name: 'Orbit Stability',
      score: factors.orbit_stability_score,
      icon: CheckCircle,
      description: 'Relationship stability'
    },
    {
      name: 'Engagement',
      score: factors.engagement_score,
      icon: Sparkles,
      description: 'Quality of interactions'
    },
    {
      name: 'Risk Level',
      score: factors.risk_score,
      icon: AlertCircle,
      description: 'Risk of deterioration'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border backdrop-blur-xl ${
        isRetro ? 'bg-black/80 border-cyan-400/30' : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-6 h-6 text-pink-400" />
            <h3 className="text-xl font-bold text-white">Relationship Health</h3>
          </div>
          <p className="text-white/60 text-sm">
            Overall Score: <span className="font-semibold text-white">{healthData.health_grade}</span>
          </p>
          <p className={`text-sm font-semibold ${getPriorityColor(healthData.priority_level)}`}>
            Priority: {healthData.priority_level?.toUpperCase()}
          </p>
        </div>

        <HealthScoreIndicator
          score={contact.health_score}
          size="large"
          showLabel={false}
          showTrend={true}
          trend={healthData.trend}
          theme={theme}
        />
      </div>

      {/* Key Issues */}
      {healthData.key_issues && healthData.key_issues.length > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-400/30">
          <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            Key Issues
          </h4>
          <ul className="space-y-1">
            {healthData.key_issues.map((issue, idx) => (
              <li key={idx} className="text-red-300 text-sm flex items-start gap-2">
                <span className="text-red-400">•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {healthData.recommendations && healthData.recommendations.length > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-400/30">
          <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {healthData.recommendations.map((rec, idx) => (
              <li key={idx} className="text-green-300 text-sm flex items-start gap-2">
                <span className="text-green-400">✓</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Factor Breakdown */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-semibold"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? 'Hide' : 'Show'} Factor Breakdown
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4"
          >
            <div className="space-y-3">
              {factorDetails.map((factor) => {
                const Icon = factor.icon;
                return (
                  <div key={factor.name} className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-purple-400" />
                        <span className="text-white text-sm font-semibold">{factor.name}</span>
                      </div>
                      <span className="text-white font-bold">{factor.score || 0}</span>
                    </div>
                    <p className="text-white/60 text-xs mb-2">{factor.description}</p>
                    <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.score || 0}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: factor.score >= 70 ? '#10b981' : factor.score >= 50 ? '#fbbf24' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sentiment */}
            {contact.sentiment_score !== undefined && (
              <div className="mt-4 p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-semibold">Sentiment</span>
                  <span className={`text-sm font-bold ${
                    contact.sentiment_score > 30 ? 'text-green-400' :
                    contact.sentiment_score < -30 ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {contact.sentiment_score > 0 ? '+' : ''}{contact.sentiment_score}
                  </span>
                </div>
                <p className="text-white/60 text-xs">Sentiment from notes and interactions</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}