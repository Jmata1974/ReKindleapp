import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Star, Zap, Heart, TrendingUp, Users, Target, Sparkles, Flame, Crown } from 'lucide-react';

const achievementData = {
  first_contact: {
    name: 'First Contact',
    description: 'Added your first contact to Orbit',
    icon: Star,
    color: '#fbbf24',
    rarity: 'common'
  },
  inner_circle: {
    name: 'Inner Circle',
    description: 'Moved a contact to Ring 1',
    icon: Heart,
    color: '#ec4899',
    rarity: 'rare'
  },
  network_builder_10: {
    name: 'Network Builder I',
    description: 'Added 10 contacts',
    icon: Users,
    color: '#8b5cf6',
    rarity: 'common'
  },
  network_builder_25: {
    name: 'Network Builder II',
    description: 'Added 25 contacts',
    icon: Users,
    color: '#6366f1',
    rarity: 'uncommon'
  },
  network_builder_50: {
    name: 'Network Builder III',
    description: 'Added 50 contacts',
    icon: Users,
    color: '#3b82f6',
    rarity: 'rare'
  },
  streak_7: {
    name: 'Week Warrior',
    description: 'Maintained 7-day contact streak',
    icon: Flame,
    color: '#f59e0b',
    rarity: 'uncommon'
  },
  streak_30: {
    name: 'Monthly Master',
    description: 'Maintained 30-day contact streak',
    icon: Flame,
    color: '#ef4444',
    rarity: 'rare'
  },
  streak_100: {
    name: 'Century Champion',
    description: 'Maintained 100-day contact streak',
    icon: Crown,
    color: '#dc2626',
    rarity: 'legendary'
  },
  orbit_master: {
    name: 'Orbit Master',
    description: 'Organized contacts across all orbit levels',
    icon: Target,
    color: '#10b981',
    rarity: 'epic'
  },
  ai_explorer: {
    name: 'AI Explorer',
    description: 'Generated 10 AI insights',
    icon: Sparkles,
    color: '#a78bfa',
    rarity: 'uncommon'
  },
  ai_enthusiast: {
    name: 'AI Enthusiast',
    description: 'Generated 50 AI insights',
    icon: Zap,
    color: '#8b5cf6',
    rarity: 'rare'
  },
  relationship_maintainer: {
    name: 'Relationship Maintainer',
    description: 'Contacted 100 people',
    icon: Heart,
    color: '#f472b6',
    rarity: 'epic'
  },
  reconnector: {
    name: 'Reconnector',
    description: 'Contacted 10 dormant contacts',
    icon: TrendingUp,
    color: '#14b8a6',
    rarity: 'uncommon'
  },
  social_butterfly: {
    name: 'Social Butterfly',
    description: 'Maintain 20+ contacts in rings 1-5',
    icon: Trophy,
    color: '#fbbf24',
    rarity: 'epic'
  }
};

export default function AchievementBadge({ achievementType, unlocked, size = 'medium', showTooltip = true }) {
  const achievement = achievementData[achievementType] || achievementData.first_contact;
  const Icon = achievement.icon;

  const sizes = {
    small: { container: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-xs' },
    medium: { container: 'w-20 h-20', icon: 'w-10 h-10', text: 'text-sm' },
    large: { container: 'w-32 h-32', icon: 'w-16 h-16', text: 'text-base' }
  };

  const rarityBorders = {
    common: 'border-gray-400',
    uncommon: 'border-green-400',
    rare: 'border-blue-400',
    epic: 'border-purple-500',
    legendary: 'border-yellow-400'
  };

  const rarityGlows = {
    common: 'rgba(156, 163, 175, 0.5)',
    uncommon: 'rgba(74, 222, 128, 0.5)',
    rare: 'rgba(96, 165, 250, 0.5)',
    epic: 'rgba(168, 85, 247, 0.5)',
    legendary: 'rgba(250, 204, 21, 0.5)'
  };

  return (
    <div className="relative group">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`${sizes[size].container} rounded-full border-4 ${rarityBorders[achievement.rarity]} flex items-center justify-center relative overflow-hidden ${
          unlocked ? 'bg-gradient-to-br from-white/10 to-white/5' : 'bg-black/40'
        }`}
        style={{
          boxShadow: unlocked ? `0 0 20px ${rarityGlows[achievement.rarity]}` : 'none'
        }}
      >
        {unlocked && (
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                `radial-gradient(circle, ${achievement.color}30 0%, transparent 70%)`,
                `radial-gradient(circle, ${achievement.color}50 0%, transparent 70%)`,
                `radial-gradient(circle, ${achievement.color}30 0%, transparent 70%)`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <Icon
          className={`${sizes[size].icon} ${unlocked ? 'text-white' : 'text-white/20'}`}
          style={{ color: unlocked ? achievement.color : undefined }}
        />

        {!unlocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white/40 text-2xl">🔒</span>
          </div>
        )}
      </motion.div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="bg-gradient-to-b from-indigo-950/95 to-purple-950/95 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-2xl min-w-max">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4" style={{ color: achievement.color }} />
              <h4 className="text-white font-semibold text-sm">{achievement.name}</h4>
            </div>
            <p className="text-white/70 text-xs">{achievement.description}</p>
            <div className="mt-1 flex items-center gap-1">
              <span className={`text-xs px-2 py-0.5 rounded ${rarityBorders[achievement.rarity]} border`}
                style={{ color: achievement.color }}>
                {achievement.rarity.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { achievementData };