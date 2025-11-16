
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Target,
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Sparkles,
  Loader2,
  Clock,
  MessageCircle,
  Award,
  Heart
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import CosmicBackground from '../components/CosmicBackground';
import Navigation from '../components/Navigation';
import BottomNavigation from '../components/BottomNavigation';
import HealthScoreIndicator from '../components/HealthScoreIndicator';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays, subDays, format } from 'date-fns';

export default function Insights() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });
  const theme = user?.theme || 'cosmic';

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
    initialData: []
  });

  const themeColors = {
    cosmic: { primary: '#8b5cf6', secondary: '#fbbf24', accent: '#ec4899' },
    sunrise: { primary: '#ff6b6b', secondary: '#ffa366', accent: '#ffd93d' },
    retro: { primary: '#ff00ff', secondary: '#00ffff', accent: '#ff00aa' },
    aurora: { primary: '#34d399', secondary: '#8b5cf6', accent: '#ec4899' },
    solar: { primary: '#f59e0b', secondary: '#ef4444', accent: '#f59e0b' },
    ocean: { primary: '#4f46e5', secondary: '#67e8f9', accent: '#06b6d4' }
  };

  const colors = themeColors[theme] || themeColors.cosmic;
  const isRetro = theme === 'retro';

  // Calculate analytics metrics
  useEffect(() => {
    if (!contacts || contacts.length === 0) return;

    const now = new Date();
    const daysAgo = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    const startDate = subDays(now, daysAgo);

    // Contact interaction frequency
    const interactionsByDay = {};
    for (let i = 0; i < daysAgo; i++) {
      const date = format(subDays(now, i), 'MMM dd');
      interactionsByDay[date] = 0;
    }

    contacts.forEach(contact => {
      if (contact.last_contacted) {
        const contactDate = new Date(contact.last_contacted);
        if (contactDate >= startDate) {
          const dateKey = format(contactDate, 'MMM dd');
          if (interactionsByDay[dateKey] !== undefined) {
            interactionsByDay[dateKey]++;
          }
        }
      }
    });

    const interactionData = Object.entries(interactionsByDay)
      .map(([date, count]) => ({ date, interactions: count }))
      .reverse();

    // Orbit level distribution
    const orbitDistribution = {};
    for (let i = 1; i <= 12; i++) {
      orbitDistribution[i] = 0;
    }

    contacts.forEach(contact => {
      const level = contact.orbit_level || 6;
      orbitDistribution[level]++;
    });

    const orbitData = Object.entries(orbitDistribution).map(([level, count]) => ({
      level: `Ring ${level}`,
      count,
      percentage: ((count / contacts.length) * 100).toFixed(1)
    }));

    // Relationship type distribution
    const relationshipCounts = {};
    contacts.forEach(contact => {
      const rel = contact.relationship || 'other';
      relationshipCounts[rel] = (relationshipCounts[rel] || 0) + 1;
    });

    const relationshipData = Object.entries(relationshipCounts).map(([type, count]) => ({
      name: type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      value: count,
      percentage: ((count / contacts.length) * 100).toFixed(1)
    }));

    // Inactivity analysis
    const inactivityRanges = {
      '0-7 days': 0,
      '8-14 days': 0,
      '15-30 days': 0,
      '31-60 days': 0,
      '60+ days': 0,
      'Never contacted': 0
    };

    contacts.forEach(contact => {
      if (!contact.last_contacted) {
        inactivityRanges['Never contacted']++;
      } else {
        const daysSince = differenceInDays(now, new Date(contact.last_contacted));
        if (daysSince <= 7) inactivityRanges['0-7 days']++;
        else if (daysSince <= 14) inactivityRanges['8-14 days']++;
        else if (daysSince <= 30) inactivityRanges['15-30 days']++;
        else if (daysSince <= 60) inactivityRanges['31-60 days']++;
        else inactivityRanges['60+ days']++;
      }
    });

    const inactivityData = Object.entries(inactivityRanges).map(([range, count]) => ({
      range,
      count,
      percentage: ((count / contacts.length) * 100).toFixed(1)
    }));

    // AI effectiveness metrics
    const contactsWithAI = contacts.filter(c => c.ai_insights);
    const highRiskContacts = contacts.filter(c => c.ai_insights?.inactivity_risk?.risk_level === 'high');
    const urgentFollowUps = contacts.filter(c => c.ai_insights?.follow_up_analysis?.urgency === 'high');

    // Key metrics
    const totalContacts = contacts.length;
    const activeContacts = contacts.filter(c => {
      if (!c.last_contacted) return false;
      const daysSince = differenceInDays(now, new Date(c.last_contacted));
      return daysSince <= 30;
    }).length;

    const dormantContacts = contacts.filter(c => {
      if (!c.last_contacted) return true;
      const daysSince = differenceInDays(now, new Date(c.last_contacted));
      return daysSince > 30;
    }).length;

    const avgOrbitLevel = contacts.reduce((sum, c) => sum + (c.orbit_level || 6), 0) / contacts.length;

    // Calculate average network health
    const contactsWithHealth = contacts.filter(c => c.health_score !== undefined && c.health_score !== null);
    const avgNetworkHealth = contactsWithHealth.length > 0
      ? Math.round(contactsWithHealth.reduce((sum, c) => sum + c.health_score, 0) / contactsWithHealth.length)
      : 0;

    // Health distribution
    const healthDistribution = {
      'Excellent (90-100)': 0,
      'Good (70-89)': 0,
      'Fair (50-69)': 0,
      'Poor (30-49)': 0,
      'Critical (0-29)': 0
    };

    contactsWithHealth.forEach(contact => {
      const score = contact.health_score;
      if (score >= 90) healthDistribution['Excellent (90-100)']++;
      else if (score >= 70) healthDistribution['Good (70-89)']++;
      else if (score >= 50) healthDistribution['Fair (50-69)']++;
      else if (score >= 30) healthDistribution['Poor (30-49)']++;
      else healthDistribution['Critical (0-29)']++;
    });

    const healthData = Object.entries(healthDistribution).map(([range, count]) => ({
      range,
      count,
      percentage: contactsWithHealth.length > 0 ? ((count / contactsWithHealth.length) * 100).toFixed(1) : 0
    }));

    // Top contacts by health
    const topHealthContacts = [...contactsWithHealth]
      .sort((a, b) => b.health_score - a.health_score)
      .slice(0, 5);

    // At-risk contacts
    const atRiskContacts = contactsWithHealth.filter(c => c.health_score < 50);

    setAnalyticsData({
      interactionData,
      orbitData,
      relationshipData,
      inactivityData,
      healthData,
      topHealthContacts,
      atRiskContacts,
      metrics: {
        totalContacts,
        activeContacts,
        dormantContacts,
        avgOrbitLevel: avgOrbitLevel.toFixed(1),
        contactsWithAI: contactsWithAI.length,
        highRiskContacts: highRiskContacts.length,
        urgentFollowUps: urgentFollowUps.length,
        avgNetworkHealth,
        contactsWithHealth: contactsWithHealth.length,
        atRiskCount: atRiskContacts.length
      }
    });
  }, [contacts, selectedTimeRange]);

  // Generate AI insights
  const generateAIInsights = async () => {
    if (!analyticsData) return;

    setLoadingAI(true);
    try {
      const prompt = `Analyze this user's contact management data and provide actionable insights:

METRICS:
- Total Contacts: ${analyticsData.metrics.totalContacts}
- Active Contacts (last 30 days): ${analyticsData.metrics.activeContacts}
- Dormant Contacts (30+ days): ${analyticsData.metrics.dormantContacts}
- Average Orbit Level: ${analyticsData.metrics.avgOrbitLevel}
- Contacts with AI Analysis: ${analyticsData.metrics.contactsWithAI}
- High Risk Contacts: ${analyticsData.metrics.highRiskContacts}
- Urgent Follow-ups: ${analyticsData.metrics.urgentFollowUps}
- Average Network Health Score: ${analyticsData.metrics.avgNetworkHealth}
- Contacts with Health Scores: ${analyticsData.metrics.contactsWithHealth}
- At Risk Contacts: ${analyticsData.metrics.atRiskCount}

ORBIT DISTRIBUTION:
${analyticsData.orbitData.map(d => `${d.level}: ${d.count} contacts (${d.percentage}%)`).join('\n')}

RELATIONSHIP BREAKDOWN:
${analyticsData.relationshipData.map(d => `${d.name}: ${d.value} contacts (${d.percentage}%)`).join('\n')}

INACTIVITY ANALYSIS:
${analyticsData.inactivityData.map(d => `${d.range}: ${d.count} contacts (${d.percentage}%)`).join('\n')}

HEALTH DISTRIBUTION:
${analyticsData.healthData.map(d => `${d.range}: ${d.count} contacts (${d.percentage}%)`).join('\n')}

Provide:
1. Overall health score (0-100)
2. Top 3 strengths in their contact management
3. Top 3 areas for improvement
4. 5 specific actionable recommendations
5. Predicted trend for next 30 days
6. Risk assessment summary`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            health_score: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Overall relationship management health score'
            },
            health_grade: {
              type: 'string',
              enum: ['A', 'B', 'C', 'D', 'F'],
              description: 'Letter grade for overall health'
            },
            strengths: {
              type: 'array',
              items: { type: 'string' },
              description: 'Top 3 strengths'
            },
            improvements: {
              type: 'array',
              items: { type: 'string' },
              description: 'Top 3 areas for improvement'
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] }
                }
              },
              description: '5 actionable recommendations'
            },
            trend_prediction: {
              type: 'object',
              properties: {
                direction: { type: 'string', enum: ['improving', 'stable', 'declining'] },
                confidence: { type: 'integer', minimum: 0, maximum: 100 },
                summary: { type: 'string' }
              }
            },
            risk_summary: {
              type: 'string',
              description: 'Summary of relationship health risks'
            }
          }
        }
      });

      setAiInsights(result);
    } catch (err) {
      console.error('AI insights generation failed:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  const CHART_COLORS = [colors.primary, colors.secondary, colors.accent, '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const getHealthColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#fbbf24';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-400/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-400/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
    }
  };

  if (!analyticsData) {
    return (
      <div className="relative w-full min-h-screen overflow-y-auto pb-32">
        <CosmicBackground theme={theme} />
        <Navigation currentPage="Insights" theme={theme} />
        <div className="relative z-10 flex items-center justify-center h-screen">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
        <BottomNavigation currentPage="Insights" />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pb-32">
      <CosmicBackground theme={theme} />
      <Navigation currentPage="Insights" theme={theme} />

      <div className="relative z-10 max-w-7xl mx-auto p-6 pt-24">
        {/* Header - Centered Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}>
            📊 Analytics Dashboard
          </h1>
          <p className="text-white/60">AI-powered insights into your relationship management</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                selectedTimeRange === range
                  ? isRetro
                    ? 'bg-gradient-to-r from-cyan-600 to-pink-600 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={<Users className="w-6 h-6" />}
            title="Total Contacts"
            value={analyticsData.metrics.totalContacts}
            change="+0%"
            trend="stable"
            color={colors.primary}
            theme={theme}
          />
          <MetricCard
            icon={<Activity className="w-6 h-6" />}
            title="Active Contacts"
            value={analyticsData.metrics.activeContacts}
            subtitle={`${((analyticsData.metrics.activeContacts / analyticsData.metrics.totalContacts) * 100).toFixed(0)}% of total`}
            trend="up"
            color="#10b981"
            theme={theme}
          />
          <MetricCard
            icon={<AlertTriangle className="w-6 h-6" />}
            title="Dormant Contacts"
            value={analyticsData.metrics.dormantContacts}
            subtitle={`${((analyticsData.metrics.dormantContacts / analyticsData.metrics.totalContacts) * 100).toFixed(0)}% of total`}
            trend="down"
            color="#ef4444"
            theme={theme}
          />
          <MetricCard
            icon={<Target className="w-6 h-6" />}
            title="Avg Orbit Level"
            value={analyticsData.metrics.avgOrbitLevel}
            subtitle="Closeness metric"
            trend="stable"
            color={colors.secondary}
            theme={theme}
          />

          {/* New Network Health Metric */}
          {analyticsData.metrics.contactsWithHealth > 0 && (
            <MetricCard
              icon={<Heart className="w-6 h-6" />}
              title="Network Health"
              value={analyticsData.metrics.avgNetworkHealth}
              subtitle={`${analyticsData.metrics.contactsWithHealth} contacts analyzed`}
              trend={analyticsData.metrics.avgNetworkHealth >= 70 ? 'up' : analyticsData.metrics.avgNetworkHealth >= 50 ? 'stable' : 'down'}
              color={
                analyticsData.metrics.avgNetworkHealth >= 70 ? '#10b981' :
                analyticsData.metrics.avgNetworkHealth >= 50 ? '#fbbf24' : '#ef4444'
              }
              theme={theme}
            />
          )}


          {/* At Risk Contacts */}
          {analyticsData.metrics.atRiskCount > 0 && (
            <MetricCard
              icon={<AlertTriangle className="w-6 h-6" />}
              title="At Risk"
              value={analyticsData.metrics.atRiskCount}
              subtitle="Contacts need attention"
              trend="down"
              color="#ef4444"
              theme={theme}
            />
          )}
        </div>

        {/* Network Health Overview */}
        {analyticsData.metrics.avgNetworkHealth > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl border backdrop-blur-xl"
            style={{
              backgroundColor: isRetro ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isRetro ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Network Health Overview</h2>
                <p className="text-white/60 text-sm">AI-powered analysis of your relationship network</p>
              </div>
              <HealthScoreIndicator
                score={analyticsData.metrics.avgNetworkHealth}
                size="large"
                showLabel={true}
                theme={theme}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Performers */}
              {analyticsData.topHealthContacts && analyticsData.topHealthContacts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Thriving Relationships
                  </h3>
                  <div className="space-y-2">
                    {analyticsData.topHealthContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          {contact.avatar_url ? (
                            <img src={contact.avatar_url} alt={contact.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
                              {contact.name[0]}
                            </div>
                          )}
                          <span className="text-white font-medium">{contact.name}</span>
                        </div>
                        <HealthScoreIndicator score={contact.health_score} size="small" showLabel={false} theme={theme} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* At Risk */}
              {analyticsData.atRiskContacts && analyticsData.atRiskContacts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Needs Attention ({analyticsData.atRiskContacts.length})
                  </h3>
                  <div className="space-y-2">
                    {analyticsData.atRiskContacts.slice(0, 5).map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-400/30">
                        <div className="flex items-center gap-3">
                          {contact.avatar_url ? (
                            <img src={contact.avatar_url} alt={contact.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">
                              {contact.name[0]}
                            </div>
                          )}
                          <span className="text-white font-medium">{contact.name}</span>
                        </div>
                        <HealthScoreIndicator score={contact.health_score} size="small" showLabel={false} theme={theme} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI Health Score */}
        {aiInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl border backdrop-blur-xl"
            style={{
              backgroundColor: isRetro ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isRetro ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full" style={{ backgroundColor: `${getHealthColor(aiInsights.health_score)}20` }}>
                  <Award className="w-6 h-6" style={{ color: getHealthColor(aiInsights.health_score) }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Relationship Health Score</h2>
                  <p className="text-white/60 text-sm">AI-powered assessment of your network</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{ color: getHealthColor(aiInsights.health_score) }}>
                  {aiInsights.health_score}
                </div>
                <div className="text-2xl font-bold text-white/60">Grade {aiInsights.health_grade}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {aiInsights.strengths.map((strength, idx) => (
                    <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {aiInsights.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                      <span className="text-yellow-400">→</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Insights Button */}
        {!aiInsights && (
          <button
            onClick={generateAIInsights}
            disabled={loadingAI}
            className={`w-full mb-8 p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
              isRetro
                ? 'bg-black/60 border-cyan-400/50 hover:border-pink-500/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              {loadingAI ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.primary }} />
                  <span className="text-white font-semibold">Analyzing your network...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" style={{ color: colors.primary }} />
                  <span className="text-white font-semibold">Generate AI Insights</span>
                </>
              )}
            </div>
          </button>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Interaction Frequency */}
          <ChartCard title="Contact Interaction Frequency" icon={<Calendar />} theme={theme}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.interactionData}>
                <defs>
                  <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#fff" opacity={0.6} />
                <YAxis stroke="#fff" opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="interactions" stroke={colors.primary} fillOpacity={1} fill="url(#colorInteractions)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Orbit Distribution */}
          <ChartCard title="Orbit Level Distribution" icon={<Target />} theme={theme}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.orbitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="level" stroke="#fff" opacity={0.6} />
                <YAxis stroke="#fff" opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill={colors.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Relationship Types */}
          <ChartCard title="Relationship Type Distribution" icon={<Users />} theme={theme}>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={analyticsData.relationshipData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.relationshipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px'
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </ChartCard>

          {/* Inactivity Analysis */}
          <ChartCard title="Inactivity Trends" icon={<TrendingDown />} theme={theme}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.inactivityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#fff" opacity={0.6} />
                <YAxis dataKey="range" type="category" stroke="#fff" opacity={0.6} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill={colors.accent} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Health Distribution Chart */}
          {analyticsData.healthData && analyticsData.metrics.contactsWithHealth > 0 && (
            <ChartCard title="Health Score Distribution" icon={<Heart />} theme={theme}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.healthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="range" stroke="#fff" opacity={0.6} angle={-15} textAnchor="end" height={80} />
                  <YAxis stroke="#fff" opacity={0.6} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count">
                    {analyticsData.healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        index === 0 ? '#10b981' : // Excellent
                        index === 1 ? '#3b82f6' : // Good
                        index === 2 ? '#fbbf24' : // Fair
                        index === 3 ? '#f97316' : // Poor
                        '#ef4444' // Critical
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>

        {/* AI Recommendations */}
        {aiInsights?.recommendations && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" style={{ color: colors.primary }} />
              AI Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiInsights.recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-xl border backdrop-blur-xl"
                  style={{
                    backgroundColor: isRetro ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: isRetro ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold">{rec.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm">{rec.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Trend Prediction */}
        {aiInsights?.trend_prediction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border backdrop-blur-xl"
            style={{
              backgroundColor: isRetro ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isRetro ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              {aiInsights.trend_prediction.direction === 'improving' ? (
                <TrendingUp className="w-6 h-6 text-green-400" />
              ) : aiInsights.trend_prediction.direction === 'declining' ? (
                <TrendingDown className="w-6 h-6 text-red-400" />
              ) : (
                <Activity className="w-6 h-6 text-yellow-400" />
              )}
              30-Day Trend Prediction
            </h2>
            <div className="flex items-center gap-4 mb-3">
              <span className={`px-4 py-2 rounded-lg font-semibold ${
                aiInsights.trend_prediction.direction === 'improving'
                  ? 'bg-green-500/20 text-green-300'
                  : aiInsights.trend_prediction.direction === 'declining'
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {aiInsights.trend_prediction.direction.toUpperCase()}
              </span>
              <span className="text-white/60 text-sm">
                {aiInsights.trend_prediction.confidence}% confidence
              </span>
            </div>
            <p className="text-white/80 leading-relaxed">{aiInsights.trend_prediction.summary}</p>

            {aiInsights.risk_summary && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm mb-2">Risk Assessment:</p>
                <p className="text-white/80 text-sm">{aiInsights.risk_summary}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <BottomNavigation currentPage="Insights" />
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, change, trend, color, theme }) {
  const isRetro = theme === 'retro';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-2xl border backdrop-blur-xl"
      style={{
        backgroundColor: isRetro ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.05)',
        borderColor: isRetro ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-white/60 text-sm mb-1">{title}</h3>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {subtitle && <p className="text-white/40 text-xs">{subtitle}</p>}
    </motion.div>
  );
}

function ChartCard({ title, icon, children, theme }) {
  const isRetro = theme === 'retro';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border backdrop-blur-xl"
      style={{
        backgroundColor: isRetro ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.05)',
        borderColor: isRetro ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </motion.div>
  );
}
