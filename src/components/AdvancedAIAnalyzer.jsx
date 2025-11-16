import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MessageCircle,
  Target,
  Calendar,
  Zap,
  Loader2,
  RefreshCw,
  BarChart3,
  Lightbulb,
  Activity,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { differenceInDays, format, addDays } from 'date-fns';

export default function AdvancedAIAnalyzer({ contact, onUpdateContact, theme = 'cosmic' }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const isRetro = theme === 'retro';

  useEffect(() => {
    // Load existing analysis from contact
    if (contact.sentiment_history || contact.relationship_risks || contact.optimal_contact_times) {
      setAnalysis({
        sentiment_history: contact.sentiment_history || [],
        relationship_risks: contact.relationship_risks || [],
        relationship_opportunities: contact.relationship_opportunities || [],
        optimal_contact_times: contact.optimal_contact_times || null,
        behavior_patterns: contact.behavior_patterns || null,
        sentiment_trend: contact.sentiment_trend || 'unknown',
        ai_conversation_starters: contact.ai_conversation_starters || []
      });
    }
  }, [contact]);

  const runAdvancedAnalysis = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      const daysSinceContact = contact.last_contacted 
        ? differenceInDays(new Date(), new Date(contact.last_contacted))
        : null;

      const prompt = `Perform an advanced AI analysis of this contact relationship:

CONTACT PROFILE:
- Name: ${contact.name}
- Relationship Type: ${contact.relationship || 'unknown'}
- Last Contacted: ${contact.last_contacted || 'never'}
- Days Since Last Contact: ${daysSinceContact || 'unknown'}
- Current Orbit Level: ${contact.orbit_level}
- Relationship Goal: ${contact.contact_goal || 'maintain'}
- Tags: ${contact.tags?.join(', ') || 'none'}
- Notes: ${contact.notes || 'no notes available'}
- Previous Sentiment Score: ${contact.sentiment_score || 'unknown'}
- Health Score: ${contact.health_score || 'not calculated'}
- Communication History: ${contact.notes_history?.length || 0} interactions recorded

REQUIRED ANALYSIS:

1. CONVERSATION STARTERS (5 starters)
   - Generate highly personalized conversation starters
   - Reference specific details from notes, interests, or past interactions
   - Mix of: casual check-ins, thoughtful questions, shared interests, and professional topics
   - Make them natural, engaging, and contextually relevant

2. RELATIONSHIP RISK IDENTIFICATION
   - Identify ALL potential risks (drift, conflict indicators, neglect, communication gaps)
   - For each risk: type, severity (low/medium/high/critical), specific description, actionable mitigation
   - Consider: time gaps, sentiment patterns, interaction frequency, life changes

3. RELATIONSHIP OPPORTUNITIES
   - Identify growth opportunities (collaboration, deeper connection, mutual benefit, networking)
   - For each opportunity: type, description, 3 specific action items, potential impact
   - Consider: shared interests, professional synergies, personal milestones, common goals

4. SENTIMENT ANALYSIS
   - Analyze current sentiment from notes (score -100 to +100)
   - Identify sentiment trend (improving/declining/stable/unknown)
   - Create sentiment trajectory prediction for next 3 months
   - List 3 factors influencing sentiment
   - Provide sentiment improvement recommendations

5. OPTIMAL CONTACT TIMING
   - Predict best days of week for outreach (based on patterns, if any)
   - Suggest best time of day (morning/afternoon/evening)
   - Provide detailed reasoning
   - Assign confidence level (low/medium/high)
   - Consider: work schedule, time zones, communication patterns

6. BEHAVIOR PATTERN LEARNING
   - Analyze communication style and preferences
   - Determine preferred contact method (phone/text/email/in-person)
   - Estimate typical response time
   - Assess engagement level (low/medium/high)
   - Provide communication strategy tips

Provide comprehensive, actionable insights that will genuinely improve this relationship.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            conversation_starters: {
              type: 'array',
              items: { type: 'string' },
              description: '5 personalized conversation starters'
            },
            relationship_risks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  risk_type: { type: 'string' },
                  severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                  description: { type: 'string' },
                  mitigation: { type: 'string' }
                }
              },
              description: 'Identified relationship risks with mitigation strategies'
            },
            relationship_opportunities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  opportunity_type: { type: 'string' },
                  description: { type: 'string' },
                  action_items: { 
                    type: 'array', 
                    items: { type: 'string' } 
                  },
                  potential_impact: { type: 'string' }
                }
              },
              description: 'Growth opportunities with action plans'
            },
            sentiment_analysis: {
              type: 'object',
              properties: {
                current_score: { type: 'integer', minimum: -100, maximum: 100 },
                trend: { type: 'string', enum: ['improving', 'declining', 'stable', 'unknown'] },
                trajectory_3month: { type: 'string' },
                influencing_factors: { type: 'array', items: { type: 'string' } },
                improvement_recommendations: { type: 'array', items: { type: 'string' } }
              }
            },
            optimal_contact_times: {
              type: 'object',
              properties: {
                days_of_week: { type: 'array', items: { type: 'string' } },
                time_of_day: { type: 'string' },
                reasoning: { type: 'string' },
                confidence: { type: 'string', enum: ['low', 'medium', 'high'] }
              }
            },
            behavior_patterns: {
              type: 'object',
              properties: {
                response_time_avg: { type: 'number' },
                preferred_communication: { type: 'string', enum: ['phone', 'text', 'email', 'in-person'] },
                engagement_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                communication_style: { type: 'string' },
                strategy_tips: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      });

      // Add timestamps to risks and opportunities
      const timestampedRisks = result.relationship_risks?.map(risk => ({
        ...risk,
        detected_at: new Date().toISOString()
      })) || [];

      const timestampedOpportunities = result.relationship_opportunities?.map(opp => ({
        ...opp,
        detected_at: new Date().toISOString()
      })) || [];

      // Create sentiment history entry
      const sentimentHistoryEntry = {
        date: new Date().toISOString().split('T')[0],
        score: result.sentiment_analysis?.current_score || 0,
        note_excerpt: contact.notes?.substring(0, 100) || ''
      };

      const updatedSentimentHistory = [
        ...(contact.sentiment_history || []),
        sentimentHistoryEntry
      ].slice(-10); // Keep last 10 entries

      const analysisData = {
        ai_conversation_starters: result.conversation_starters || [],
        relationship_risks: timestampedRisks,
        relationship_opportunities: timestampedOpportunities,
        sentiment_score: result.sentiment_analysis?.current_score || 0,
        sentiment_trend: result.sentiment_analysis?.trend || 'unknown',
        sentiment_history: updatedSentimentHistory,
        optimal_contact_times: result.optimal_contact_times || null,
        behavior_patterns: result.behavior_patterns || null
      };

      setAnalysis(analysisData);

      // Update contact with analysis
      if (contact.id) {
        await onUpdateContact(analysisData);
      }

    } catch (err) {
      console.error('Advanced AI analysis failed:', err);
      setError('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600/20 text-red-300 border-red-500/50';
      case 'high': return 'bg-orange-600/20 text-orange-300 border-orange-500/50';
      case 'medium': return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/50';
      case 'low': return 'bg-blue-600/20 text-blue-300 border-blue-500/50';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/50';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-400" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: analyzing ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 1, repeat: analyzing ? Infinity : 0 }}
          >
            <Brain className={`w-5 h-5 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
          </motion.div>
          <h3 className="text-lg font-semibold text-white">Advanced AI Analysis</h3>
        </div>

        <Button
          onClick={runAdvancedAnalysis}
          disabled={analyzing}
          size="sm"
          className={`${
            isRetro
              ? 'bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-700 hover:to-cyan-700'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          } text-white`}
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {analysis ? 'Refresh' : 'Analyze'}
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <AnimatePresence>
        {analysis && !analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            {/* Sentiment Analysis Card */}
            {analysis.sentiment_history && analysis.sentiment_history.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-lg border border-purple-400/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <h4 className="font-medium text-white">Sentiment Analysis</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(analysis.sentiment_trend)}
                    <Badge className={
                      analysis.sentiment_trend === 'improving' ? 'bg-green-500/20 text-green-300' :
                      analysis.sentiment_trend === 'declining' ? 'bg-red-500/20 text-red-300' :
                      'bg-blue-500/20 text-blue-300'
                    }>
                      {analysis.sentiment_trend}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <span className="text-white/70 text-sm">Current Sentiment</span>
                    <Badge className={
                      contact.sentiment_score > 50 ? 'bg-green-500/20 text-green-300' :
                      contact.sentiment_score < -20 ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }>
                      {contact.sentiment_score || 0}/100
                    </Badge>
                  </div>

                  {/* Sentiment History Mini Chart */}
                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-white/60 text-xs mb-2">Recent Trend</p>
                    <div className="flex items-end gap-1 h-16">
                      {analysis.sentiment_history.slice(-7).map((entry, idx) => {
                        const height = ((entry.score + 100) / 200) * 100;
                        return (
                          <div
                            key={idx}
                            className="flex-1 bg-purple-500/50 rounded-t transition-all hover:bg-purple-500/70"
                            style={{ height: `${height}%` }}
                            title={`${entry.date}: ${entry.score}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Starters - Enhanced Display */}
            {analysis.ai_conversation_starters && analysis.ai_conversation_starters.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-lg border border-purple-400/30">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className={`w-4 h-4 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                  <h4 className="font-medium text-white">Smart Conversation Starters</h4>
                  <Badge className={`${isRetro ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'} ml-auto`}>
                    {analysis.ai_conversation_starters.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {analysis.ai_conversation_starters.slice(0, 5).map((starter, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      whileHover={{ scale: 1.02, x: 3 }}
                      className="p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all group cursor-pointer relative"
                      onClick={() => {
                        navigator.clipboard.writeText(typeof starter === 'string' ? starter : starter.text);
                      }}
                    >
                      <p className="text-white/90 text-sm leading-relaxed pr-10">
                        💬 {typeof starter === 'string' ? starter : starter.text}
                      </p>
                      <motion.div
                        className="absolute top-3 right-3"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <Copy className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                      </motion.div>
                      <p className="text-white/40 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to copy
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Relationship Risks */}
            {analysis.relationship_risks && analysis.relationship_risks.length > 0 && (
              <div className="p-4 bg-red-500/5 backdrop-blur-sm rounded-lg border border-red-400/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <h4 className="font-medium text-white">Relationship Risks</h4>
                  <Badge className="bg-red-500/20 text-red-300 ml-auto">
                    {analysis.relationship_risks.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {analysis.relationship_risks.map((risk, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg border border-red-400/20">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-white font-medium text-sm">{risk.risk_type}</span>
                        <Badge className={getSeverityColor(risk.severity)}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-white/70 text-sm mb-2">{risk.description}</p>
                      <div className="p-2 bg-white/5 rounded border-l-2 border-yellow-400">
                        <p className="text-yellow-300 text-xs">
                          <Lightbulb className="w-3 h-3 inline mr-1" />
                          {risk.mitigation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relationship Opportunities */}
            {analysis.relationship_opportunities && analysis.relationship_opportunities.length > 0 && (
              <div className="p-4 bg-green-500/5 backdrop-blur-sm rounded-lg border border-green-400/20">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-green-400" />
                  <h4 className="font-medium text-white">Growth Opportunities</h4>
                  <Badge className="bg-green-500/20 text-green-300 ml-auto">
                    {analysis.relationship_opportunities.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {analysis.relationship_opportunities.map((opp, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg border border-green-400/20">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-white font-medium text-sm">{opp.opportunity_type}</span>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <p className="text-white/70 text-sm mb-2">{opp.description}</p>
                      <div className="space-y-1 mt-2">
                        <p className="text-white/60 text-xs font-medium">Action Items:</p>
                        {opp.action_items?.map((item, i) => (
                          <p key={i} className="text-white/70 text-xs pl-4">
                            • {item}
                          </p>
                        ))}
                      </div>
                      {opp.potential_impact && (
                        <p className="text-green-300 text-xs mt-2 pt-2 border-t border-white/10">
                          <Zap className="w-3 h-3 inline mr-1" />
                          Impact: {opp.potential_impact}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optimal Contact Times */}
            {analysis.optimal_contact_times && (
              <div className="p-4 bg-blue-500/5 backdrop-blur-sm rounded-lg border border-blue-400/20">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h4 className="font-medium text-white">Best Time to Reach Out</h4>
                  <Badge className={
                    analysis.optimal_contact_times.confidence === 'high' ? 'bg-green-500/20 text-green-300' :
                    analysis.optimal_contact_times.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-500/20 text-gray-300'
                  }>
                    {analysis.optimal_contact_times.confidence} confidence
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-white/60 text-xs mb-1">Best Days</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.optimal_contact_times.days_of_week?.map((day, idx) => (
                        <Badge key={idx} className="bg-blue-500/20 text-blue-300 text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-white/60 text-xs mb-1">Best Time</p>
                    <p className="text-white text-sm font-medium">
                      {analysis.optimal_contact_times.time_of_day}
                    </p>
                  </div>
                </div>
                <p className="text-white/70 text-sm">
                  {analysis.optimal_contact_times.reasoning}
                </p>
              </div>
            )}

            {/* Behavior Patterns */}
            {analysis.behavior_patterns && (
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className={`w-4 h-4 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                  <h4 className="font-medium text-white">Communication Insights</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-white/60 text-xs mb-1">Preferred Method</p>
                    <p className="text-white text-sm font-medium capitalize">
                      {analysis.behavior_patterns.preferred_communication}
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-white/60 text-xs mb-1">Engagement Level</p>
                    <Badge className={
                      analysis.behavior_patterns.engagement_level === 'high' ? 'bg-green-500/20 text-green-300' :
                      analysis.behavior_patterns.engagement_level === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }>
                      {analysis.behavior_patterns.engagement_level}
                    </Badge>
                  </div>
                </div>
                {analysis.behavior_patterns.communication_style && (
                  <div className="p-3 bg-white/5 rounded mb-3">
                    <p className="text-white/60 text-xs mb-1">Communication Style</p>
                    <p className="text-white text-sm">{analysis.behavior_patterns.communication_style}</p>
                  </div>
                )}
                {analysis.behavior_patterns.strategy_tips && analysis.behavior_patterns.strategy_tips.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-white/60 text-xs font-medium">Strategy Tips:</p>
                    {analysis.behavior_patterns.strategy_tips.map((tip, idx) => (
                      <p key={idx} className="text-white/70 text-xs pl-4">
                        💡 {tip}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!analysis && !analyzing && (
        <div className="text-center py-8">
          <Brain className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-sm mb-4">
            Unlock powerful AI-driven insights for {contact.name}
          </p>
          <ul className="text-white/40 text-xs space-y-2 mb-6">
            <li className="flex items-center justify-center gap-2">
              <MessageCircle className="w-3 h-3" />
              Smart conversation starters
            </li>
            <li className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              Proactive risk identification
            </li>
            <li className="flex items-center justify-center gap-2">
              <Target className="w-3 h-3" />
              Growth opportunity detection
            </li>
            <li className="flex items-center justify-center gap-2">
              <BarChart3 className="w-3 h-3" />
              Sentiment trend analysis
            </li>
            <li className="flex items-center justify-center gap-2">
              <Clock className="w-3 h-3" />
              Optimal contact timing
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}