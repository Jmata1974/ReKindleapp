
import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { differenceInDays, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SmartReminderEngine({ 
  enabled = true, 
  autoSetReminders = true,
  checkInterval = '6h',
  debugMode = false 
}) {
  const [processing, setProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState(null);
  const [stats, setStats] = useState({
    analyzed: 0,
    remindersSet: 0,
    skipped: 0,
    errors: 0
  });

  const queryClient = useQueryClient();

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
    initialData: []
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  const calculateEngagementLevel = (contact) => {
    const factors = {
      health: (contact.health_score || 50) / 100,
      recency: 0,
      frequency: 0,
      sentiment: ((contact.sentiment_score || 0) + 100) / 200
    };

    // Recency score
    if (contact.last_contacted) {
      const daysSince = differenceInDays(new Date(), new Date(contact.last_contacted));
      factors.recency = Math.max(0, 1 - daysSince / 60);
    }

    // Frequency score
    if (contact.interaction_frequency) {
      factors.frequency = Math.max(0, 1 - contact.interaction_frequency / 30);
    }

    // Weighted average
    const engagementScore = (
      factors.health * 0.3 +
      factors.recency * 0.3 +
      factors.frequency * 0.2 +
      factors.sentiment * 0.2
    ) * 100;

    return {
      score: Math.round(engagementScore),
      level: engagementScore >= 70 ? 'high' : engagementScore >= 40 ? 'medium' : 'low',
      factors
    };
  };

  const checkCustomTriggerRules = useCallback((contact, rules) => {
    if (!rules || rules.length === 0) return null;

    const triggeredRules = [];
    const now = Date.now();

    rules.forEach(rule => {
      if (!rule.enabled) return;

      let triggered = false;
      let reason = '';

      switch (rule.condition_type) {
        case 'health_drop':
          if (contact.health_score !== undefined && contact.health_factors?.previous_score) {
            const drop = contact.health_factors.previous_score - contact.health_score;
            if (drop >= rule.threshold_value) {
              triggered = true;
              reason = `Health score dropped by ${drop} points`;
            }
          }
          break;

        case 'health_below':
          if (contact.health_score !== undefined && contact.health_score < rule.threshold_value) {
            triggered = true;
            reason = `Health score is ${contact.health_score}, below threshold of ${rule.threshold_value}`;
          }
          break;

        case 'days_inactive':
          if (contact.last_contacted) {
            const daysSince = Math.floor((now - new Date(contact.last_contacted).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince >= rule.threshold_value) {
              triggered = true;
              reason = `No contact for ${daysSince} days (threshold: ${rule.threshold_value})`;
            }
          }
          break;

        case 'orbit_drift':
          if (contact.orbit_level_at_last_contact !== undefined && contact.orbit_level !== undefined) {
            const drift = contact.orbit_level - contact.orbit_level_at_last_contact;
            if (drift >= rule.threshold_value) {
              triggered = true;
              reason = `Drifted ${drift} orbits outward (threshold: ${rule.threshold_value})`;
            }
          }
          break;

        case 'sentiment_decline':
          if (contact.sentiment_history && contact.sentiment_history.length >= 2) {
            const recent = contact.sentiment_history[contact.sentiment_history.length - 1];
            const previous = contact.sentiment_history[contact.sentiment_history.length - 2];
            const decline = previous.score - recent.score;
            if (decline >= rule.threshold_value) {
              triggered = true;
              reason = `Sentiment declined by ${decline} points`;
            }
          }
          break;

        case 'milestone_approaching':
          if (contact.next_milestone?.date) {
            const daysUntil = Math.floor((new Date(contact.next_milestone.date).getTime() - now) / (1000 * 60 * 60 * 24));
            if (daysUntil > 0 && daysUntil <= rule.threshold_value) {
              triggered = true;
              reason = `Milestone "${contact.next_milestone.event}" in ${daysUntil} days`;
            }
          }
          break;
      }

      if (triggered) {
        triggeredRules.push({
          rule: rule,
          reason: reason
        });
      }
    });

    return triggeredRules.length > 0 ? triggeredRules : null;
  }, []);

  const generateAIReminder = useCallback(async (contact) => {
    const now = new Date();
    
    // Calculate engagement
    const engagement = calculateEngagementLevel(contact);
    
    // Calculate inactivity
    const daysSinceContact = contact.last_contacted 
      ? differenceInDays(now, new Date(contact.last_contacted))
      : 999;

    // Check custom trigger rules
    const customTriggers = checkCustomTriggerRules(contact, user?.custom_trigger_rules);
    const hasCustomTrigger = customTriggers && customTriggers.length > 0;

    const contextData = {
      name: contact.name,
      relationship: contact.relationship || 'friend',
      orbit_level: contact.orbit_level,
      days_since_contact: daysSinceContact,
      last_contacted: contact.last_contacted ? new Date(contact.last_contacted).toISOString().split('T')[0] : 'never',
      health_score: contact.health_score || 70,
      sentiment_score: contact.sentiment_score || 0,
      notes: contact.notes?.substring(0, 200) || '',
      tags: contact.tags || [],
      contact_goal: contact.contact_goal || 'maintain',
      reminder_frequency: contact.reminder_frequency || 'ai_suggested',
      reminder_triggers: contact.reminder_triggers || [],
      engagement_level: engagement.level,
      engagement_score: engagement.score,
      inactivity_risk_level: contact.ai_insights?.inactivity_risk?.risk_level || 'low',
      custom_goal_description: contact.custom_goal_description || '',
      ai_insights_follow_up_analysis: contact.ai_insights?.follow_up_analysis || {},
      custom_triggers_activated: hasCustomTrigger ? customTriggers.map(ct => ({
        rule_name: ct.rule.name,
        reason: ct.reason,
        priority: ct.rule.priority_level,
        action: ct.rule.action
      })) : []
    };

    try {
      const prompt = `You are an expert relationship advisor analyzing when to follow up with a contact.

CONTACT DATA: ${JSON.stringify(contextData, null, 2)}

${hasCustomTrigger ? `
CUSTOM TRIGGERS ACTIVATED:
${customTriggers.map(ct => `- ${ct.rule.name} (${ct.rule.priority_level} priority): ${ct.reason}`).join('\n')}

These custom rules were triggered by the user's specific criteria. Factor them into your analysis.
` : ''}

Determine:
1. Should a reminder be created? (yes/no)
2. What's the urgency level? (low/medium/high)
3. What's the best approach? (casual/professional/thoughtful/reconnect)
4. Why is now a good time to reach out?
5. What are 2-3 suggested conversation topics or actions?
6. When should the reminder be scheduled? (next 1-14 days)
7. Your confidence in this recommendation (0-100%)
8. Optimal timing for outreach (e.g., "weekday afternoon", "weekend morning")
9. How custom triggers influenced this decision (if any).

Consider relationship goal, health score, custom triggers, and engagement patterns.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            needs_reminder: { type: 'boolean' },
            urgency: { 
              type: 'string',
              enum: ['low', 'medium', 'high']
            },
            suggested_approach: {
              type: 'string',
              enum: ['casual', 'professional', 'thoughtful', 'reconnect']
            },
            reason: { type: 'string' },
            suggested_actions: { 
              type: 'array', 
              items: { type: 'string' },
              minItems: 1,
              maxItems: 3
            },
            days_until_reminder: { 
              type: 'integer',
              minimum: 1,
              maximum: 14
            },
            confidence_score: {
              type: 'integer',
              minimum: 0,
              maximum: 100
            },
            optimal_timing: { type: 'string' },
            custom_trigger_impact: { type: 'string' }
          },
          required: ['needs_reminder', 'urgency', 'suggested_approach', 'reason', 'suggested_actions', 'days_until_reminder', 'confidence_score', 'optimal_timing', 'custom_trigger_impact']
        }
      });

      if (!result.needs_reminder) return null;

      // Calculate reminder date
      const reminderDate = addDays(now, result.days_until_reminder);

      return {
        should_remind: result.needs_reminder,
        priority: result.urgency,
        recommended_days: result.days_until_reminder,
        reminder_date: reminderDate.toISOString().split('T')[0],
        reason: result.reason,
        suggested_action: result.suggested_actions.join('; '), // Combine actions into a string
        approach: result.suggested_approach,
        confidence: result.confidence_score,
        timing_notes: result.optimal_timing,
        engagement_score: engagement.score, // Keep existing engagement score
        generated_at: now.toISOString(),
        auto_generated: true, // Indicates AI generated the suggestion
        custom_trigger_impact: result.custom_trigger_impact, // New field
        custom_triggers: hasCustomTrigger ? customTriggers.map(ct => ct.rule.name) : [] // New field
      };

    } catch (error) {
      console.error('AI reminder generation failed:', error);
      return null;
    }
  }, [checkCustomTriggerRules, user, calculateEngagementLevel, base44.integrations.Core.InvokeLLM]); // Add dependencies

  const processReminders = async () => {
    if (!enabled || contacts.length === 0 || processing) return;

    setProcessing(true);
    const now = new Date();
    const results = { analyzed: 0, remindersSet: 0, skipped: 0, errors: 0 };

    try {
      for (const contact of contacts) {
        results.analyzed++;

        // Skip if snoozed
        if (contact.snooze_until && new Date(contact.snooze_until) > now) {
          results.skipped++;
          if (debugMode) console.log(`⏸️ ${contact.name} - snoozed`);
          continue;
        }

        // Skip if reminder was recently generated (within last 12 hours)
        if (contact.ai_reminder_last_generated) {
          const hoursSinceLastGen = differenceInDays(now, new Date(contact.ai_reminder_last_generated)) * 24;
          if (hoursSinceLastGen < 12) {
            results.skipped++;
            if (debugMode) console.log(`⏭️ ${contact.name} - recently analyzed`);
            continue;
          }
        }

        // Skip if manual reminder frequency and has active reminder
        if (contact.reminder_frequency === 'manual' && contact.reminder_date) {
          results.skipped++;
          continue;
        }

        // Generate smart reminder (now AI reminder)
        if (debugMode) console.log(`🤖 Analyzing ${contact.name}...`);
        
        const reminderData = await generateAIReminder(contact); // Call the new AI reminder function
        
        if (reminderData && reminderData.should_remind) { // Check 'should_remind' from new data structure
          const updateData = {
            ai_reminder_data: reminderData,
            ai_reminder_last_generated: now.toISOString()
          };

          // Auto-set reminder if enabled and confidence is high enough
          if (autoSetReminders && reminderData.confidence >= 70) { // Check 'confidence' from new data structure
            updateData.reminder_date = reminderData.reminder_date;
            results.remindersSet++;
            if (debugMode) console.log(`✅ ${contact.name} - reminder set for ${reminderData.reminder_date}`);
          } else {
            results.skipped++;
            if (debugMode) console.log(`💡 ${contact.name} - suggestion generated (not auto-set)`);
          }

          await updateContactMutation.mutateAsync({
            id: contact.id,
            data: updateData
          });
        } else {
          results.skipped++;
        }
      }

      setStats(results);
      setLastProcessed(now.toISOString());

      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('smartRemindersProcessed', {
        detail: { stats: results, timestamp: now.toISOString() }
      }));

    } catch (error) {
      console.error('Smart reminder processing failed:', error);
      results.errors++;
      setStats(results);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Initial run after 5 seconds
    const initialTimer = setTimeout(() => {
      processReminders();
    }, 5000);

    // Set up interval
    const intervalMs = parseInterval(checkInterval);
    const intervalId = setInterval(() => {
      processReminders();
    }, intervalMs);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, [enabled, contacts, checkInterval, autoSetReminders, debugMode, processReminders]); // Add processReminders to dependencies

  // Debug/Status Panel - Replaces the previous debugMode and minimal status blocks
  return debugMode && enabled ? (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-24 left-6 z-50 bg-black/90 border border-green-400/50 rounded-xl p-4 text-white text-xs max-w-xs"
    >
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-4 h-4 text-green-400" />
        <span className="font-semibold">Smart Reminder Engine</span>
      </div>
      <div className="space-y-1 text-white/80">
        <div>Status: {processing ? '🔄 Processing...' : '✅ Active'}</div>
        <div>Contacts: {contacts.length}</div>
        <div>Last Check: {lastProcessed ? new Date(lastProcessed).toLocaleTimeString() : 'Never'}</div>
        <div>Interval: {checkInterval}</div>
        <div>Custom Rules: {user?.custom_trigger_rules?.filter(r => r.enabled).length || 0} active</div>
      </div>
      <button
        onClick={processReminders}
        disabled={processing}
        className="mt-3 w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Force Check Now'}
      </button>
    </motion.div>
  ) : null;
}

function parseInterval(interval) {
  const match = interval.match(/^(\d+)([smh])$/);
  if (!match) return 3600000; // Default 1 hour

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    default: return 3600000;
  }
}
