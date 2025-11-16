import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';
import { achievementData } from './AchievementBadge';

const POINTS_CONFIG = {
  contact_added: 10,
  contact_edited: 5,
  contact_moved_inward: 15,
  follow_up_completed: 20,
  reminder_accepted: 15,
  ai_insight_generated: 5,
  health_improved: 25,
  dormant_reconnected: 30,
  streak_day: 10,
  streak_week: 50,
  streak_month: 200,
  goal_achieved: 50,
  perfect_week: 100
};

export default function GamificationEngine({ enabled = true }) {
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

  const createStatsMutation = useMutation({
    mutationFn: (data) => base44.entities.UserStats.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    }
  });

  const updateStatsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserStats.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    }
  });

  const unlockAchievementMutation = useMutation({
    mutationFn: (data) => base44.entities.Achievement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    }
  });

  const calculateLevel = (xp) => {
    // Level formula: Each level requires more XP (exponential growth)
    let level = 1;
    let totalXpNeeded = 0;
    const baseXp = 100;
    
    while (totalXpNeeded <= xp && level < 100) {
      totalXpNeeded += baseXp * Math.pow(1.15, level - 1);
      if (totalXpNeeded <= xp) level++;
    }
    
    const xpForCurrentLevel = baseXp * Math.pow(1.15, level - 2);
    const xpForNextLevel = baseXp * Math.pow(1.15, level - 1);
    const xpInCurrentLevel = xp - (totalXpNeeded - xpForCurrentLevel);
    
    return {
      level,
      xp_current: Math.floor(xpInCurrentLevel),
      xp_to_next_level: Math.floor(xpForNextLevel)
    };
  };

  const checkAndUnlockAchievements = async (stats, unlockedAchievements) => {
    const unlockedSet = new Set(unlockedAchievements.map(a => a.achievement_type));
    const newAchievements = [];

    const checks = {
      first_contact: stats.total_contacts >= 1,
      inner_circle: stats.inner_circle_count >= 1,
      network_builder_10: stats.total_contacts >= 10,
      network_builder_25: stats.total_contacts >= 25,
      network_builder_50: stats.total_contacts >= 50,
      streak_7: stats.current_streak >= 7,
      streak_30: stats.current_streak >= 30,
      streak_100: stats.current_streak >= 100,
      orbit_master: stats.total_contacts >= 5 && stats.inner_circle_count >= 2,
      ai_explorer: stats.ai_insights_generated >= 10,
      ai_enthusiast: stats.ai_insights_generated >= 50,
      relationship_maintainer: stats.total_interactions >= 100,
      reconnector: stats.reconnections >= 10,
      social_butterfly: stats.inner_circle_count >= 20
    };

    for (const [type, condition] of Object.entries(checks)) {
      if (condition && !unlockedSet.has(type)) {
        const achievement = achievementData[type];
        const pointsAwarded = achievement.rarity === 'legendary' ? 500 :
                             achievement.rarity === 'epic' ? 200 :
                             achievement.rarity === 'rare' ? 100 :
                             achievement.rarity === 'uncommon' ? 50 : 25;

        newAchievements.push({
          user_email: user.email,
          achievement_type: type,
          unlocked_at: new Date().toISOString(),
          points_awarded: pointsAwarded
        });

        // Show notification
        window.dispatchEvent(new CustomEvent('achievementUnlocked', {
          detail: { type, achievement, pointsAwarded }
        }));
      }
    }

    // Bulk unlock achievements
    if (newAchievements.length > 0) {
      for (const ach of newAchievements) {
        await unlockAchievementMutation.mutateAsync(ach);
      }
    }

    return newAchievements;
  };

  const updateUserStats = async () => {
    if (!enabled || !user?.email || !contacts) return;

    const today = new Date().toISOString().split('T')[0];
    const innerCircleContacts = contacts.filter(c => c.orbit_level <= 3).length;
    const totalInteractions = contacts.filter(c => c.last_contacted).length;
    const aiInsightsGenerated = contacts.filter(c => c.ai_insights || c.ai_reminder_data).length;
    const avgHealthScore = contacts.length > 0 
      ? Math.round(contacts.reduce((sum, c) => sum + (c.health_score || 70), 0) / contacts.length)
      : 0;

    // Calculate streak
    let currentStreak = userStats?.current_streak || 0;
    const lastActivityDate = userStats?.last_activity_date;
    
    if (lastActivityDate) {
      const daysSinceLastActivity = differenceInDays(new Date(today), new Date(lastActivityDate));
      
      if (daysSinceLastActivity === 1) {
        currentStreak += 1; // Continue streak
      } else if (daysSinceLastActivity === 0) {
        // Same day, keep streak
      } else {
        currentStreak = 1; // Reset streak
      }
    } else {
      currentStreak = 1; // First activity
    }

    const longestStreak = Math.max(userStats?.longest_streak || 0, currentStreak);

    // Calculate engagement score (0-100)
    const engagementFactors = {
      recency: totalInteractions / Math.max(contacts.length, 1) * 40,
      streakBonus: Math.min(currentStreak / 30, 1) * 30,
      aiUsage: Math.min(aiInsightsGenerated / contacts.length, 1) * 20,
      healthBonus: avgHealthScore * 0.1
    };
    const engagementScore = Math.min(100, Math.round(
      engagementFactors.recency + 
      engagementFactors.streakBonus + 
      engagementFactors.aiUsage + 
      engagementFactors.healthBonus
    ));

    const statsData = {
      user_email: user.email,
      total_contacts: contacts.length,
      inner_circle_count: innerCircleContacts,
      total_interactions: totalInteractions,
      ai_insights_generated: aiInsightsGenerated,
      network_health_score: avgHealthScore,
      engagement_score: engagementScore,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
      follow_ups_completed: userStats?.follow_ups_completed || 0,
      reminders_accepted: userStats?.reminders_accepted || 0,
      goals_achieved: userStats?.goals_achieved || 0,
      health_improvements: userStats?.health_improvements || 0,
      reconnections: userStats?.reconnections || 0,
      perfect_weeks: userStats?.perfect_weeks || 0,
      total_points: userStats?.total_points || 0,
      level: userStats?.level || 1,
      xp_current: userStats?.xp_current || 0,
      xp_to_next_level: userStats?.xp_to_next_level || 100,
      weekly_points: userStats?.weekly_points || 0,
      monthly_points: userStats?.monthly_points || 0
    };

    if (!userStats) {
      await createStatsMutation.mutateAsync(statsData);
    } else {
      await updateStatsMutation.mutateAsync({ id: userStats.id, data: statsData });
    }

    // Check achievements
    await checkAndUnlockAchievements(statsData, achievements);
  };

  useEffect(() => {
    if (!enabled || !user?.email) return;

    // Initial update
    const timer = setTimeout(() => {
      updateUserStats();
    }, 2000);

    // Listen for contact updates
    const handleContactUpdate = () => {
      setTimeout(updateUserStats, 1000);
    };

    window.addEventListener('contactUpdated', handleContactUpdate);
    window.addEventListener('forceOrbitCheck', handleContactUpdate);
    window.addEventListener('smartRemindersProcessed', handleContactUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('contactUpdated', handleContactUpdate);
      window.removeEventListener('forceOrbitCheck', handleContactUpdate);
      window.removeEventListener('smartRemindersProcessed', handleContactUpdate);
    };
  }, [enabled, user, contacts, userStats, achievements]);

  return null;
}

export { POINTS_CONFIG };