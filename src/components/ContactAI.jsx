import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Clock, 
  MessageCircle, 
  Tags, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  TrendingDown, 
  Target, 
  Check, 
  Copy, 
  FileText, 
  Plus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { differenceInDays } from 'date-fns';

export default function ContactAI({ contact, onUpdateContact, theme = 'cosmic' }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [copiedStarter, setCopiedStarter] = useState(null);

  const isRetro = theme === 'retro';

  const daysSinceContact = contact.last_contacted 
    ? differenceInDays(new Date(), new Date(contact.last_contacted))
    : null;

  const isDormant = daysSinceContact && daysSinceContact > 30;
  const notesLength = contact.notes?.length || 0;
  const notesAreLong = notesLength > 200;

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `Analyze this contact profile comprehensively and provide intelligent insights:

Contact Name: ${contact.name}
Relationship: ${contact.relationship || 'unknown'}
Last Contacted: ${contact.last_contacted || 'never'}
Days Since Last Contact: ${daysSinceContact || 'unknown'}
Current Orbit Level: ${contact.orbit_level}
Notes: ${contact.notes || 'no notes'}
Existing Tags: ${contact.tags?.join(', ') || 'none'}
Phone: ${contact.phone || 'not provided'}
Email: ${contact.email || 'not provided'}
Communication History: ${contact.notes_history?.length || 0} recorded interactions

ANALYSIS REQUIRED:

1. SMART TAG SUGGESTIONS (3-5 tags)
   - Analyze relationship, notes, and context
   - Suggest relevant tags like: Client, VIP, Mentor, Family, Colleague, Lead, etc.

2. FOLLOW-UP TIMING OPTIMIZATION
   - Consider relationship type and last contact date
   - Suggest optimal days until next contact
   - Provide reasoning based on relationship dynamics
   - Assign urgency level (low/medium/high)

3. PERSONALIZED CONVERSATION STARTERS (3 starters)
   - Generate thoughtful, contextual conversation openers
   - Reference their interests, notes, or past interactions
   - Make them natural and genuine

4. INACTIVITY RISK ASSESSMENT
   - Analyze interaction patterns and time gaps
   - Calculate likelihood of becoming dormant (0-100%)
   - Identify risk level: low (<30%), medium (30-70%), high (>70%)
   - Explain key risk factors

5. DORMANT CONTACT OUTREACH STRATEGY (if applicable)
   - Provide 3 specific re-engagement strategies
   - Suggest best communication channel
   - Recommend optimal timing
   - Include tone/approach guidance

6. PROFILE SUMMARY
   - Create a concise 2-3 sentence summary
   - Capture essence of relationship and context`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            suggested_tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of 3-5 relevant tags'
            },
            follow_up_analysis: {
              type: 'object',
              properties: {
                optimal_days: { type: 'integer', description: 'Suggested days until next contact' },
                reasoning: { type: 'string', description: 'Why this timing makes sense' },
                urgency: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Follow-up urgency level' }
              }
            },
            conversation_starters: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of 3 personalized conversation starters'
            },
            profile_summary: {
              type: 'string',
              description: 'Brief 2-3 sentence summary of the contact'
            },
            inactivity_risk: {
              type: 'object',
              properties: {
                risk_percentage: { type: 'integer', minimum: 0, maximum: 100, description: 'Likelihood of becoming dormant (0-100%)' },
                risk_level: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Risk category' },
                risk_factors: { type: 'array', items: { type: 'string' }, description: 'Key factors contributing to risk' },
                recommendation: { type: 'string', description: 'Brief action recommendation' }
              }
            },
            outreach_strategy: {
              type: 'object',
              properties: {
                is_needed: { type: 'boolean', description: 'Whether outreach strategy is needed' },
                strategies: { type: 'array', items: { type: 'string' }, description: '3 specific re-engagement approaches' },
                best_channel: { type: 'string', enum: ['phone', 'text', 'email', 'in-person'], description: 'Recommended communication channel' },
                timing: { type: 'string', description: 'When to reach out (e.g., "weekday morning", "weekend afternoon")' },
                tone: { type: 'string', description: 'Recommended tone/approach (e.g., "casual and friendly", "professional check-in")' }
              }
            }
          }
        }
      });

      setInsights(result);
      setExpanded(true);

      if (contact.id) {
        await onUpdateContact({
          ai_insights: result,
          ai_last_generated: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('AI generation failed:', err);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const summarizeNotes = async () => {
    if (!contact.notes || contact.notes.length < 50) return;

    setSummarizing(true);
    try {
      const prompt = `Summarize these contact notes into a concise, clear profile (2-3 sentences max):

Original Notes:
${contact.notes}

Create a summary that captures:
- Key relationship details
- Important context
- Notable interactions or facts

Keep it professional, clear, and actionable.`;

      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });

      const updatedInsights = {
        ...(insights || {}),
        notes_summary: summary
      };

      setInsights(updatedInsights);

      if (contact.id) {
        await onUpdateContact({
          ai_insights: updatedInsights,
          ai_last_generated: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Summarization failed:', err);
    } finally {
      setSummarizing(false);
    }
  };

  const applyTag = async (tag) => {
    const currentTags = contact.tags || [];
    if (!currentTags.includes(tag)) {
      await onUpdateContact({
        tags: [...currentTags, tag]
      });
    }
  };

  const applyFollowUpReminder = async () => {
    if (!insights?.follow_up_analysis?.optimal_days) return;

    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + insights.follow_up_analysis.optimal_days);

    await onUpdateContact({
      reminder_date: reminderDate.toISOString().split('T')[0]
    });
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedStarter(index);
    setTimeout(() => setCopiedStarter(null), 2000);
  };

  React.useEffect(() => {
    if (contact.ai_insights && !insights) {
      setInsights(contact.ai_insights);
    }
  }, [contact.ai_insights, insights]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-400/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-400/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'phone': return '📞';
      case 'text': return '💬';
      case 'email': return '📧';
      case 'in-person': return '🤝';
      default: return '💌';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: loading ? 360 : 0 }}
            transition={{ duration: 2, repeat: loading ? Infinity : 0, ease: 'linear' }}
          >
            <Sparkles className={`w-5 h-5 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
          </motion.div>
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        </div>

        <Button
          onClick={generateInsights}
          disabled={loading}
          size="sm"
          className={`${
            isRetro
              ? 'bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          } text-white`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {insights ? 'Refresh' : 'Generate'} Insights
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {!loading && (
        <div className="flex flex-wrap gap-2">
          {notesAreLong && (
            <Button
              onClick={summarizeNotes}
              disabled={summarizing}
              size="sm"
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              {summarizing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3 mr-2" />
                  Summarize Notes ({notesLength} chars)
                </>
              )}
            </Button>
          )}
          {isDormant && (
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/50">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Dormant ({daysSinceContact} days)
            </Badge>
          )}
        </div>
      )}

      <AnimatePresence>
        {insights && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {insights.profile_summary && (
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <p className="text-white/80 text-sm leading-relaxed">
                  {insights.profile_summary}
                </p>
              </div>
            )}

            {insights.notes_summary && (
              <div className="p-4 bg-blue-500/10 backdrop-blur-sm rounded-lg border border-blue-400/30">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <h4 className="font-medium text-blue-300 text-sm">Notes Summary</h4>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {insights.notes_summary}
                </p>
              </div>
            )}

            {insights.inactivity_risk && (
              <div className={`p-4 backdrop-blur-sm rounded-lg border ${
                insights.inactivity_risk.risk_level === 'high' 
                  ? 'bg-red-500/10 border-red-400/30'
                  : insights.inactivity_risk.risk_level === 'medium'
                  ? 'bg-yellow-500/10 border-yellow-400/30'
                  : 'bg-green-500/10 border-green-400/30'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className={`w-4 h-4 ${
                      insights.inactivity_risk.risk_level === 'high' ? 'text-red-400' :
                      insights.inactivity_risk.risk_level === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`} />
                    <h4 className="font-medium text-white">Inactivity Risk</h4>
                  </div>
                  <Badge className={getRiskColor(insights.inactivity_risk.risk_level)}>
                    {insights.inactivity_risk.risk_percentage}% • {insights.inactivity_risk.risk_level}
                  </Badge>
                </div>
                
                {insights.inactivity_risk.risk_factors && insights.inactivity_risk.risk_factors.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {insights.inactivity_risk.risk_factors.map((factor, idx) => (
                      <p key={idx} className="text-white/70 text-xs flex items-start gap-2">
                        <span className="text-white/40">•</span>
                        {factor}
                      </p>
                    ))}
                  </div>
                )}
                
                {insights.inactivity_risk.recommendation && (
                  <p className="text-white/80 text-sm mt-2 pt-2 border-t border-white/10">
                    💡 {insights.inactivity_risk.recommendation}
                  </p>
                )}
              </div>
            )}

            {insights.outreach_strategy && insights.outreach_strategy.is_needed && (
              <div className="p-4 bg-purple-500/10 backdrop-blur-sm rounded-lg border border-purple-400/30">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-purple-400" />
                  <h4 className="font-medium text-white">Re-Engagement Strategy</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 bg-white/5 rounded text-center">
                    <p className="text-white/60 text-xs mb-1">Best Channel</p>
                    <p className="text-white text-sm font-medium">
                      {getChannelIcon(insights.outreach_strategy.best_channel)} {insights.outreach_strategy.best_channel}
                    </p>
                  </div>
                  <div className="p-2 bg-white/5 rounded text-center">
                    <p className="text-white/60 text-xs mb-1">Timing</p>
                    <p className="text-white text-sm font-medium">{insights.outreach_strategy.timing}</p>
                  </div>
                </div>

                {insights.outreach_strategy.tone && (
                  <div className="p-2 bg-white/5 rounded mb-3">
                    <p className="text-white/60 text-xs mb-1">Recommended Tone</p>
                    <p className="text-white text-sm">{insights.outreach_strategy.tone}</p>
                  </div>
                )}

                {insights.outreach_strategy.strategies && insights.outreach_strategy.strategies.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-white/80 text-sm font-medium">Strategies:</p>
                    {insights.outreach_strategy.strategies.map((strategy, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/5">
                        <p className="text-white/80 text-sm">
                          {idx + 1}. {strategy}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-white font-medium">More Insights</span>
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-white/60" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/60" />
              )}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {insights.suggested_tags && insights.suggested_tags.length > 0 && (
                    <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Tags className={`w-4 h-4 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                        <h4 className="font-medium text-white">Suggested Tags</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {insights.suggested_tags.map((tag, idx) => (
                          <button
                            key={idx}
                            onClick={() => applyTag(tag)}
                            disabled={contact.tags?.includes(tag)}
                            className={`px-3 py-1 rounded-full text-sm transition-all duration-300 flex items-center gap-1 ${
                              contact.tags?.includes(tag)
                                ? 'bg-white/20 text-white/50 cursor-not-allowed'
                                : isRetro
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-400/50 hover:bg-purple-500/30'
                            }`}
                          >
                            {contact.tags?.includes(tag) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.follow_up_analysis && (
                    <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className={`w-4 h-4 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                        <h4 className="font-medium text-white">Follow-Up Timing</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Suggested timing:</span>
                          <Badge
                            className={`${
                              insights.follow_up_analysis.urgency === 'high'
                                ? 'bg-red-500/20 text-red-300'
                                : insights.follow_up_analysis.urgency === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-green-500/20 text-green-300'
                            }`}
                          >
                            {insights.follow_up_analysis.optimal_days} days
                          </Badge>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">
                          {insights.follow_up_analysis.reasoning}
                        </p>
                        <Button
                          onClick={applyFollowUpReminder}
                          size="sm"
                          variant="outline"
                          className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          Set Reminder
                        </Button>
                      </div>
                    </div>
                  )}

                  {insights.conversation_starters && insights.conversation_starters.length > 0 && (
                    <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className={`w-4 h-4 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                        <h4 className="font-medium text-white">Conversation Starters</h4>
                      </div>
                      <div className="space-y-2">
                        {insights.conversation_starters.map((starter, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group relative"
                            onClick={() => copyToClipboard(starter, idx)}
                          >
                            <p className="text-white/80 text-sm leading-relaxed pr-8">
                              💬 {starter}
                            </p>
                            <div className="absolute top-3 right-3">
                              {copiedStarter === idx ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contact.ai_last_generated && (
                    <p className="text-white/40 text-xs text-center">
                      Generated {new Date(contact.ai_last_generated).toLocaleDateString()} at{' '}
                      {new Date(contact.ai_last_generated).toLocaleTimeString()}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {!insights && !loading && (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60 text-sm mb-4">
            Get comprehensive AI insights about {contact.name}
          </p>
          <ul className="text-white/40 text-xs space-y-1 mb-6">
            <li>• Smart tag suggestions</li>
            <li>• Optimal follow-up timing</li>
            <li>• Personalized conversation ideas</li>
            <li>• Inactivity risk assessment</li>
            <li>• Re-engagement strategies</li>
            <li>• Note summarization</li>
          </ul>
        </div>
      )}
    </div>
  );
}