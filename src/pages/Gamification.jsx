import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, TrendingUp, Users, Award, Crown, Lock, Unlock, CheckCircle, Zap, Flame, Star, Gift } from 'lucide-react';
import CosmicBackground from '../components/CosmicBackground';
import Navigation from '../components/Navigation';
import BottomNavigation from '../components/BottomNavigation';
import AchievementBadge, { achievementData } from '../components/AchievementBadge';
import ProgressVisualization from '../components/ProgressVisualization';
import GamificationEngine from '../components/GamificationEngine';
import PointsNotification from '../components/PointsNotification';
import LevelUpNotification from '../components/LevelUpNotification';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Gamification() {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

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

  const { data: achievements } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user?.email }),
    initialData: [],
    enabled: !!user?.email
  });

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.filter({ user_email: user?.email });
      return stats[0] || null;
    },
    initialData: null,
    enabled: !!user?.email
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const allStats = await base44.entities.UserStats.list();
      return allStats
        .filter(s => s.opt_in_leaderboard)
        .sort((a, b) => (b.network_health_score || 0) - (a.network_health_score || 0))
        .slice(0, 10);
    },
    initialData: []
  });

  const updateStatsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserStats.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    }
  });

  const theme = user?.theme || 'cosmic';
  const isRetro = theme === 'retro';

  const themeColors = {
    cosmic: { primary: '#8b5cf6', secondary: '#fbbf24' },
    sunrise: { primary: '#ff6b6b', secondary: '#ffa366' },
    retro: { primary: '#ff00ff', secondary: '#00ffff' },
    aurora: { primary: '#34d399', secondary: '#8b5cf6' },
    solar: { primary: '#f59e0b', secondary: '#ef4444' },
    ocean: { primary: '#4f46e5', secondary: '#67e8f9' }
  };

  const colors = themeColors[theme] || themeColors.cosmic;

  const unlockedAchievementsArray = achievements?.map(a => a.achievement_type) || [];
  const unlockedAchievementsSet = new Set(unlockedAchievementsArray);
  const totalAchievements = Object.keys(achievementData).length;

  const leaderboardRank = leaderboard.findIndex(stat => stat.user_email === user?.email) + 1;

  const stats = {
    unlockedAchievements: unlockedAchievementsSet.size,
    totalAchievements: totalAchievements,
    currentStreak: userStats?.current_streak || 0,
    networkHealth: userStats?.network_health_score || 0,
    leaderboardRank: leaderboardRank > 0 ? leaderboardRank : 0,
    totalPoints: userStats?.total_points || 0,
    level: userStats?.level || 1,
    xpCurrent: userStats?.xp_current || 0,
    xpToNext: userStats?.xp_to_next_level || 100
  };

  const xpProgress = (stats.xpCurrent / stats.xpToNext) * 100;

  const handleLeaderboardOptIn = () => {
    if (userStats) {
      updateStatsMutation.mutate({
        id: userStats.id,
        data: { opt_in_leaderboard: !userStats.opt_in_leaderboard }
      });
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pb-32">
      <CosmicBackground theme={theme} />
      <Navigation currentPage="Gamification" theme={theme} />
      
      {/* Gamification Engine */}
      <GamificationEngine enabled={true} />
      
      {/* Notifications */}
      <PointsNotification />
      <LevelUpNotification />

      <div className="relative z-10 max-w-7xl mx-auto p-6 pt-24">
        {/* Enhanced Header with Level */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative inline-block">
              <motion.h1
                className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                  backgroundSize: '200% 200%',
                  textShadow: '0 0 30px rgba(255, 215, 0, 0.3)'
                }}
              >
                🏆 Achievements
              </motion.h1>
              
              {/* Floating particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${20 + i * 20}%`,
                    top: `${-20 + Math.sin(i) * 10}px`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.7, 0.3],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  {['🎮', '⭐', '🎯', '✨', '🔥'][i]}
                </motion.div>
              ))}
            </div>

            {/* Level Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, delay: 0.3 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-xl border-2 border-yellow-400/50 mb-4"
              style={{
                boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)'
              }}
            >
              <Star className="w-6 h-6 text-yellow-300" fill="currentColor" />
              <div>
                <div className="text-sm text-white/80 font-medium">Level</div>
                <div className="text-2xl font-bold text-white">{stats.level}</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-sm text-white/80 font-medium">XP</div>
                <div className="text-lg font-bold text-yellow-300">
                  {stats.xpCurrent}/{stats.xpToNext}
                </div>
              </div>
            </motion.div>

            {/* XP Progress Bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full relative"
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      background: [
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
                      ],
                      x: ['-100%', '200%']
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              </div>
            </div>

            <p className="text-white/60 text-lg">Track your networking journey and unlock rewards</p>
          </motion.div>
        </div>

        {/* Enhanced Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <StatCard
            icon={Trophy}
            label="Badges"
            value={`${stats.unlockedAchievements}/${stats.totalAchievements}`}
            theme={theme}
            color="#fbbf24"
            progress={(stats.unlockedAchievements / stats.totalAchievements) * 100}
          />
          <StatCard
            icon={Zap}
            label="Total Points"
            value={stats.totalPoints}
            theme={theme}
            color="#a78bfa"
          />
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={`${stats.currentStreak} days`}
            theme={theme}
            color="#ef4444"
            showFlame={stats.currentStreak >= 7}
          />
          <StatCard
            icon={Crown}
            label="Leaderboard"
            value={stats.leaderboardRank > 0 ? `#${stats.leaderboardRank}` : 'N/A'}
            theme={theme}
            color="#8b5cf6"
          />
          <StatCard
            icon={TrendingUp}
            label="Network Health"
            value={stats.networkHealth}
            theme={theme}
            color="#10b981"
            showHealthBar={true}
          />
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {['overview', 'achievements', 'progress', 'leaderboard'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden ${
                activeTab === tab
                  ? isRetro
                    ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-2xl'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: isRetro
                      ? '0 0 30px rgba(0, 255, 255, 0.5)'
                      : '0 0 30px rgba(139, 92, 246, 0.5)'
                  }}
                />
              )}
              <span className="relative z-10 capitalize flex items-center gap-2">
                {tab === 'overview' && <Gift className="w-5 h-5" />}
                {tab === 'achievements' && <Trophy className="w-5 h-5" />}
                {tab === 'progress' && <TrendingUp className="w-5 h-5" />}
                {tab === 'leaderboard' && <Crown className="w-5 h-5" />}
                {tab}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Points Breakdown */}
              <div className={`p-8 rounded-2xl border backdrop-blur-xl ${
                isRetro ? 'bg-black/60 border-cyan-400/30' : 'bg-white/5 border-white/10'
              }`}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Zap className="w-7 h-7" style={{ color: colors.secondary }} />
                  Points Breakdown
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Follow-ups Completed', value: userStats?.follow_ups_completed || 0, points: 20, icon: CheckCircle },
                    { label: 'Reminders Accepted', value: userStats?.reminders_accepted || 0, points: 15, icon: Award },
                    { label: 'Goals Achieved', value: userStats?.goals_achieved || 0, points: 50, icon: Target },
                    { label: 'Health Improvements', value: userStats?.health_improvements || 0, points: 25, icon: TrendingUp },
                    { label: 'Reconnections Made', value: userStats?.reconnections || 0, points: 30, icon: Users },
                    { label: 'Perfect Weeks', value: userStats?.perfect_weeks || 0, points: 100, icon: Flame }
                  ].map((metric, idx) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isRetro ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
                          <metric.icon className={`w-5 h-5 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{metric.label}</p>
                          <p className="text-white/60 text-xs">{metric.points} pts each</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{metric.value}</div>
                        <div className="text-yellow-400 text-xs font-semibold">
                          +{metric.value * metric.points} pts
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 font-medium">Weekly Points</span>
                    <span className="text-2xl font-bold text-yellow-400">{userStats?.weekly_points || 0}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white/80 font-medium">Monthly Points</span>
                    <span className="text-2xl font-bold text-orange-400">{userStats?.monthly_points || 0}</span>
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className={`p-8 rounded-2xl border backdrop-blur-xl ${
                isRetro ? 'bg-black/60 border-cyan-400/30' : 'bg-white/5 border-white/10'
              }`}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Trophy className="w-7 h-7" style={{ color: colors.secondary }} />
                  Recently Unlocked
                </h2>

                {achievements.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {achievements.slice(-8).reverse().map((ach, idx) => (
                      <motion.div
                        key={ach.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-center"
                      >
                        <AchievementBadge
                          achievementType={ach.achievement_type}
                          unlocked={true}
                          size="large"
                          showTooltip={true}
                        />
                        <p className="text-white/60 text-xs mt-2">
                          {new Date(ach.unlocked_at).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Start earning achievements by engaging with your network!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Object.entries(achievementData).map(([key, achievement], idx) => {
                  const isUnlocked = unlockedAchievementsSet.has(key);
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.4 }}
                      whileHover={{ scale: isUnlocked ? 1.1 : 1, y: isUnlocked ? -5 : 0 }}
                      className={`relative p-6 rounded-2xl backdrop-blur-xl border transition-all flex flex-col items-center justify-center ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-yellow-500/20 to-purple-500/20 border-yellow-400/50 shadow-2xl'
                          : 'bg-black/40 border-white/10'
                      }`}
                      style={isUnlocked ? {
                        boxShadow: `0 0 30px ${achievement.color}40, 0 10px 40px rgba(0, 0, 0, 0.3)`
                      } : {}}
                    >
                      <AchievementBadge
                        achievementType={key}
                        unlocked={isUnlocked}
                        size="large"
                        showTooltip={true}
                      />
                      {isUnlocked && (
                        <motion.div
                          className="absolute -top-2 -right-2"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: idx * 0.05 + 0.2, type: 'spring' }}
                        >
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        </motion.div>
                      )}
                      <div className="text-center mt-3">
                        <p className="text-white/80 text-sm font-semibold">
                          {achievement.name}
                        </p>
                        <p className="text-white/40 text-xs">
                          {achievement.rarity}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ProgressVisualization
                stats={{
                  ...userStats,
                  total_achievements_unlocked: unlockedAchievementsSet.size,
                  total_achievements_available: totalAchievements,
                }}
                contacts={contacts}
                theme={theme}
              />
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Opt-in Section */}
              <div className={`p-6 rounded-2xl border backdrop-blur-xl mb-6 ${
                isRetro 
                  ? 'bg-black/60 border-cyan-400/30' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isRetro ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
                      {userStats?.opt_in_leaderboard ? <Unlock className="w-6 h-6" style={{ color: colors.primary }} /> : <Lock className="w-6 h-6 text-white/40" />}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Leaderboard Participation</h3>
                      <p className="text-white/60 text-sm">
                        {userStats?.opt_in_leaderboard 
                          ? 'You are visible on the leaderboard' 
                          : 'Opt in to compare your progress with others'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLeaderboardOptIn}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      userStats?.opt_in_leaderboard
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : isRetro
                          ? 'bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700 text-white'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    }`}
                  >
                    {userStats?.opt_in_leaderboard ? 'Opt Out' : 'Opt In'}
                  </button>
                </div>
              </div>

              {/* Leaderboard */}
              <div className={`p-8 rounded-2xl border backdrop-blur-xl ${
                isRetro 
                  ? 'bg-black/60 border-cyan-400/30' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <Crown className="w-6 h-6" style={{ color: colors.secondary }} />
                  Top Network Managers
                </h3>

                {leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No one has opted in yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((stat, index) => (
                      <motion.div
                        key={stat.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                          stat.user_email === user?.email
                            ? isRetro
                              ? 'bg-cyan-500/20 border-2 border-cyan-400/50'
                              : 'bg-purple-500/20 border-2 border-purple-400/50'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className={`text-2xl font-bold w-12 text-center ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-300' :
                          index === 2 ? 'text-amber-600' :
                          'text-white/60'
                        }`}>
                          {index === 0 ? '🥇' :
                           index === 1 ? '🥈' :
                           index === 2 ? '🥉' :
                           `#${index + 1}`}
                        </div>

                        <div className="flex-1">
                          <p className="text-white font-semibold">
                            {stat.user_email === user?.email ? 'You' : `User ${stat.user_email.split('@')[0]}`}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <span>{stat.total_contacts} contacts</span>
                            <span>•</span>
                            <span>{stat.current_streak} day streak</span>
                            <span>•</span>
                            <span>Level {stat.level || 1}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                            {stat.network_health_score || 0}
                          </div>
                          <p className="text-white/40 text-xs">Health</p>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold text-yellow-400">
                            {stat.total_points || 0}
                          </div>
                          <p className="text-white/40 text-xs">Points</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Object.entries(achievementData).map(([key, achievement], idx) => {
                  const isUnlocked = unlockedAchievementsSet.has(key);
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.4 }}
                      whileHover={{ scale: isUnlocked ? 1.1 : 1, y: isUnlocked ? -5 : 0 }}
                      className={`relative p-6 rounded-2xl backdrop-blur-xl border transition-all flex flex-col items-center justify-center ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-yellow-500/20 to-purple-500/20 border-yellow-400/50 shadow-2xl'
                          : 'bg-black/40 border-white/10'
                      }`}
                      style={isUnlocked ? {
                        boxShadow: `0 0 30px ${achievement.color}40, 0 10px 40px rgba(0, 0, 0, 0.3)`
                      } : {}}
                    >
                      <AchievementBadge
                        achievementType={key}
                        unlocked={isUnlocked}
                        size="large"
                        showTooltip={true}
                      />
                      {isUnlocked && (
                        <motion.div
                          className="absolute -top-2 -right-2"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: idx * 0.05 + 0.2, type: 'spring' }}
                        >
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        </motion.div>
                      )}
                      <div className="text-center mt-3">
                        <p className="text-white/80 text-sm font-semibold">
                          {achievement.name}
                        </p>
                        <p className="text-white/40 text-xs">
                          {achievement.rarity}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ProgressVisualization
                stats={{
                  ...userStats,
                  total_achievements_unlocked: unlockedAchievementsSet.size,
                  total_achievements_available: totalAchievements,
                }}
                contacts={contacts}
                theme={theme}
              />
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Opt-in Section */}
              <div className={`p-6 rounded-2xl border backdrop-blur-xl mb-6 ${
                isRetro 
                  ? 'bg-black/60 border-cyan-400/30' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isRetro ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
                      {userStats?.opt_in_leaderboard ? <Unlock className="w-6 h-6" style={{ color: colors.primary }} /> : <Lock className="w-6 h-6 text-white/40" />}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Leaderboard Participation</h3>
                      <p className="text-white/60 text-sm">
                        {userStats?.opt_in_leaderboard 
                          ? 'You are visible on the leaderboard' 
                          : 'Opt in to compare your progress with others'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLeaderboardOptIn}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      userStats?.opt_in_leaderboard
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : isRetro
                          ? 'bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700 text-white'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    }`}
                  >
                    {userStats?.opt_in_leaderboard ? 'Opt Out' : 'Opt In'}
                  </button>
                </div>
              </div>

              {/* Leaderboard */}
              <div className={`p-8 rounded-2xl border backdrop-blur-xl ${
                isRetro 
                  ? 'bg-black/60 border-cyan-400/30' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <Crown className="w-6 h-6" style={{ color: colors.secondary }} />
                  Top Network Managers
                </h3>

                {leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No one has opted in yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((stat, index) => (
                      <motion.div
                        key={stat.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                          stat.user_email === user?.email
                            ? isRetro
                              ? 'bg-cyan-500/20 border-2 border-cyan-400/50'
                              : 'bg-purple-500/20 border-2 border-purple-400/50'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className={`text-2xl font-bold w-12 text-center ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-300' :
                          index === 2 ? 'text-amber-600' :
                          'text-white/60'
                        }`}>
                          {index === 0 ? '🥇' :
                           index === 1 ? '🥈' :
                           index === 2 ? '🥉' :
                           `#${index + 1}`}
                        </div>

                        <div className="flex-1">
                          <p className="text-white font-semibold">
                            {stat.user_email === user?.email ? 'You' : `User ${stat.user_email.split('@')[0]}`}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <span>{stat.total_contacts} contacts</span>
                            <span>•</span>
                            <span>{stat.current_streak} day streak</span>
                            <span>•</span>
                            <span>Level {stat.level || 1}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                            {stat.network_health_score || 0}
                          </div>
                          <p className="text-white/40 text-xs">Health</p>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold text-yellow-400">
                            {stat.total_points || 0}
                          </div>
                          <p className="text-white/40 text-xs">Points</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNavigation currentPage="Gamification" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, theme, color, progress, showFlame, showHealthBar }) {
  const isRetro = theme === 'retro';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`p-6 rounded-2xl backdrop-blur-xl border transition-all relative overflow-hidden ${
        isRetro ? 'bg-black/60 border-cyan-400/30' : 'bg-white/5 border-white/10'
      }`}
      style={{
        boxShadow: `0 0 30px ${color}20`
      }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at top right, ${color}, transparent)`
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <Icon className="w-8 h-8" style={{ color }} />
          {showFlame && (
            <motion.span
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🔥
            </motion.span>
          )}
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-white/60">{label}</div>

        {progress !== undefined && (
          <div className="mt-3 w-full bg-black/40 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
        )}

        {showHealthBar && (
          <div className="mt-3 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className={`w-4 h-4 rounded-full ${
                  i < Math.floor(value / 20) ? 'bg-green-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}