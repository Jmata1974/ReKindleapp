import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';

export default function NetworkHealthEngine({ enabled = true, checkInterval = '2h', debugMode = false }) {
  const queryClient = useQueryClient();

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
    initialData: []
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  const calculateHealthScore = async (contact) => {
    const now = new Date();
    
    // Calculate interaction metrics
    const daysSinceContact = contact.last_contacted 
      ? differenceInDays(now, new Date(contact.last_contacted))
      : 999;

    // Calculate orbit drift
    const orbitDrift = contact.orbit_level_at_last_contact 
      ? contact.orbit_level - contact.orbit_level_at_last_contact
      : 0;

    // Build context for AI
    const contextData = {
      name: contact.name,
      relationship: contact.relationship,
      orbit_level: contact.orbit_level,
      orbit_level_at_last_contact: contact.orbit_level_at_last_contact || contact.orbit_level,
      orbit_drift: orbitDrift,
      days_since_contact: daysSinceContact,
      contact_goal: contact.contact_goal || 'maintain',
      custom_goal: contact.custom_goal_description || '',
      notes: contact.notes || '',
      tags: contact.tags || [],
      reminder_frequency: contact.reminder_frequency || 'ai_suggested',
      has_ai_insights: !!contact.ai_insights,
      ai_risk_level: contact.ai_insights?.inactivity_risk?.risk_level || 'unknown'
    };

    try {
      const prompt = `Analyze this contact's relationship health and provide a comprehensive health score:

CONTACT INFO:
- Name: ${contextData.name}
- Relationship: ${contextData.relationship}
- Current Orbit Level: ${contextData.orbit_level} (1=closest, 12=furthest)
- Orbit Level at Last Contact: ${contextData.orbit_level_at_last_contact}
- Orbit Drift: ${contextData.orbit_drift > 0 ? `+${contextData.orbit_drift} (moving away)` : contextData.orbit_drift < 0 ? `${contextData.orbit_drift} (moving closer)` : 'No drift'}
- Days Since Last Contact: ${contextData.days_since_contact}
- Relationship Goal: ${contextData.contact_goal}
${contextData.custom_goal ? `- Custom Goal: ${contextData.custom_goal}` : ''}
- Tags: ${contextData.tags.join(', ') || 'None'}
- Notes: ${contextData.notes || 'None'}
- AI Risk Level: ${contextData.ai_risk_level}

ANALYSIS FACTORS:
1. **Recency**: How recently was contact made?
2. **Goal Alignment**: Is the relationship progressing according to user's goal?
3. **Orbit Stability**: Is the contact drifting away or staying close?
4. **Engagement**: Quality of interaction based on notes and tags
5. **Risk Assessment**: Likelihood of relationship deteriorating

Calculate a health score (0-100) where:
- 90-100: Excellent - Thriving relationship
- 70-89: Good - Healthy, on track
- 50-69: Fair - Needs attention
- 30-49: Poor - At risk
- 0-29: Critical - Immediate action needed

Provide detailed breakdown of each factor and specific recommendations.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_health_score: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Overall relationship health score'
            },
            health_grade: {
              type: 'string',
              enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
              description: 'Health grade category'
            },
            factors: {
              type: 'object',
              properties: {
                recency_score: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 100,
                  description: 'Score for how recently contacted'
                },
                goal_alignment_score: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 100,
                  description: 'How well relationship aligns with user goal'
                },
                orbit_stability_score: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 100,
                  description: 'Stability of orbit position'
                },
                engagement_score: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 100,
                  description: 'Quality of engagement'
                },
                risk_score: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 100,
                  description: 'Risk of relationship deteriorating (100=no risk)'
                }
              }
            },
            sentiment: {
              type: 'integer',
              minimum: -100,
              maximum: 100,
              description: 'Sentiment from notes (-100 negative, 0 neutral, +100 positive)'
            },
            key_issues: {
              type: 'array',
              items: { type: 'string' },
              description: 'Top 3 issues affecting health'
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific actions to improve health'
            },
            priority_level: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Priority for taking action'
            },
            trend: {
              type: 'string',
              enum: ['improving', 'stable', 'declining'],
              description: 'Health trend direction'
            }
          }
        }
      });

      return {
        health_score: result.overall_health_score,
        health_factors: result.factors,
        sentiment_score: result.sentiment,
        health_grade: result.health_grade,
        key_issues: result.key_issues,
        recommendations: result.recommendations,
        priority_level: result.priority_level,
        trend: result.trend,
        calculated_at: now.toISOString()
      };
    } catch (error) {
      console.error('Health score calculation failed:', error);
      return null;
    }
  };

  const processHealthScores = async () => {
    if (!enabled || contacts.length === 0) return;

    const now = new Date();
    const contactsToUpdate = [];

    for (const contact of contacts) {
      // Skip if health was calculated recently (within last 2 hours)
      if (contact.health_last_calculated) {
        const hoursSinceLastCalc = differenceInDays(now, new Date(contact.health_last_calculated)) * 24;
        if (hoursSinceLastCalc < 2) {
          if (debugMode) console.log(`⏭️ ${contact.name} - health recently calculated`);
          continue;
        }
      }

      if (debugMode) console.log(`💚 Calculating health score for ${contact.name}...`);
      
      const healthData = await calculateHealthScore(contact);
      
      if (healthData) {
        contactsToUpdate.push({
          contact,
          updates: {
            health_score: healthData.health_score,
            health_factors: healthData,
            health_last_calculated: now.toISOString(),
            sentiment_score: healthData.sentiment_score
          }
        });
      }
    }

    // Batch update contacts
    if (contactsToUpdate.length > 0) {
      if (debugMode) {
        console.log(`🔄 Updating ${contactsToUpdate.length} contacts with health scores`);
      }

      for (const { contact, updates } of contactsToUpdate) {
        await updateContactMutation.mutateAsync({
          id: contact.id,
          data: updates
        });
      }

      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('healthScoresUpdated', {
        detail: { count: contactsToUpdate.length }
      }));
    } else if (debugMode) {
      console.log('✅ All contacts have up-to-date health scores');
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Run immediately on mount (with delay)
    const timer = setTimeout(() => {
      processHealthScores();
    }, 5000); // 5 second delay for initial load

    // Set up interval
    const intervalMs = parseInterval(checkInterval);
    const intervalId = setInterval(() => {
      processHealthScores();
    }, intervalMs);

    // Listen for force refresh
    const handleForceRefresh = () => {
      processHealthScores();
    };
    window.addEventListener('forceHealthCheck', handleForceRefresh);

    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
      window.removeEventListener('forceHealthCheck', handleForceRefresh);
    };
  }, [enabled, contacts, checkInterval, debugMode]);

  // Debug panel
  if (debugMode && enabled) {
    return (
      <div className="fixed bottom-40 right-4 z-50 bg-black/90 border border-green-400/20 rounded-lg p-4 max-w-sm">
        <h3 className="text-white font-bold mb-2">💚 Network Health Engine</h3>
        <div className="text-white/70 text-xs space-y-1">
          <p>Status: <span className="text-green-400">Active</span></p>
          <p>Contacts: {contacts.length}</p>
          <p>Check Interval: {checkInterval}</p>
          <button
            onClick={processHealthScores}
            className="mt-2 px-3 py-1 bg-green-600 rounded text-white text-xs w-full"
          >
            Force Check Now
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function parseInterval(interval) {
  const match = interval.match(/^(\d+)([smh])$/);
  if (!match) return 7200000; // Default 2 hours

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    default: return 7200000;
  }
}