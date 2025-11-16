import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { differenceInDays, addDays } from 'date-fns';

export default function AIReminderEngine({ enabled = true, checkInterval = '1h', debugMode = false }) {
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

  const generateAIReminder = async (contact) => {
    const now = new Date();
    
    // Calculate days since last contact
    const daysSinceContact = contact.last_contacted 
      ? differenceInDays(now, new Date(contact.last_contacted))
      : 999;

    // Build context for AI
    const contextData = {
      name: contact.name,
      relationship: contact.relationship,
      orbit_level: contact.orbit_level,
      days_since_contact: daysSinceContact,
      contact_goal: contact.contact_goal || 'maintain',
      custom_goal: contact.custom_goal_description || '',
      reminder_frequency: contact.reminder_frequency || 'ai_suggested',
      tags: contact.tags || [],
      notes: contact.notes || '',
      ai_insights: contact.ai_insights || null
    };

    try {
      const prompt = `Analyze this contact and generate a smart reminder suggestion:

CONTACT INFO:
- Name: ${contextData.name}
- Relationship: ${contextData.relationship}
- Orbit Level: ${contextData.orbit_level} (1=closest, 12=furthest)
- Days Since Contact: ${contextData.days_since_contact}
- Relationship Goal: ${contextData.contact_goal}
- Tags: ${contextData.tags.join(', ') || 'None'}
- Notes: ${contextData.notes || 'None'}

REMINDER PREFERENCES:
- Frequency: ${contextData.reminder_frequency}

AI INSIGHTS:
${contextData.ai_insights ? JSON.stringify(contextData.ai_insights, null, 2) : 'No AI insights generated yet'}

Based on this information, provide:
1. Should we remind the user about this contact? (yes/no)
2. Urgency level (low/medium/high/critical)
3. Suggested days until next contact (1-90)
4. Reason for reminder (brief, user-friendly)
5. Suggested action to take
6. Conversation starter ideas (3 suggestions)
7. Context tags (relevant life events, topics to discuss)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            should_remind: {
              type: 'boolean',
              description: 'Whether to remind the user'
            },
            urgency: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'How urgent this reminder is'
            },
            suggested_days_until_contact: {
              type: 'integer',
              minimum: 1,
              maximum: 90,
              description: 'Recommended days until next contact'
            },
            reason: {
              type: 'string',
              description: 'User-friendly reason for this reminder'
            },
            suggested_action: {
              type: 'string',
              description: 'Specific action to take'
            },
            conversation_starters: {
              type: 'array',
              items: { type: 'string' },
              description: '3 conversation starter ideas'
            },
            context_tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Relevant topics or events to discuss'
            },
            follow_up_score: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Score indicating how important this follow-up is'
            }
          }
        }
      });

      // Calculate next reminder date
      const nextReminderDate = addDays(now, result.suggested_days_until_contact);

      return {
        ...result,
        next_reminder_date: nextReminderDate.toISOString().split('T')[0],
        generated_at: now.toISOString()
      };
    } catch (error) {
      console.error('AI reminder generation failed:', error);
      return null;
    }
  };

  const processReminders = async () => {
    if (!enabled || contacts.length === 0) return;

    const now = new Date();
    const contactsToUpdate = [];

    for (const contact of contacts) {
      // Skip if snoozed
      if (contact.snooze_until && new Date(contact.snooze_until) > now) {
        if (debugMode) console.log(`⏸️ ${contact.name} - snoozed until ${contact.snooze_until}`);
        continue;
      }

      // Skip if AI reminder was generated recently (within last 24 hours)
      if (contact.ai_reminder_last_generated) {
        const hoursSinceLastGen = differenceInDays(now, new Date(contact.ai_reminder_last_generated)) * 24;
        if (hoursSinceLastGen < 24) {
          if (debugMode) console.log(`⏭️ ${contact.name} - AI reminder recently generated`);
          continue;
        }
      }

      // Check if contact needs AI reminder generation
      const needsAIReminder = 
        contact.reminder_frequency === 'ai_suggested' ||
        !contact.ai_reminder_data ||
        (contact.reminder_triggers && contact.reminder_triggers.includes('ai_prediction'));

      if (needsAIReminder) {
        if (debugMode) console.log(`🤖 Generating AI reminder for ${contact.name}...`);
        
        const aiReminderData = await generateAIReminder(contact);
        
        if (aiReminderData && aiReminderData.should_remind) {
          contactsToUpdate.push({
            contact,
            updates: {
              ai_reminder_data: aiReminderData,
              ai_reminder_last_generated: now.toISOString(),
              reminder_date: aiReminderData.next_reminder_date
            }
          });
        }
      }
    }

    // Batch update contacts
    if (contactsToUpdate.length > 0) {
      if (debugMode) {
        console.log(`🔄 Updating ${contactsToUpdate.length} contacts with AI reminders`);
      }

      for (const { contact, updates } of contactsToUpdate) {
        await updateContactMutation.mutateAsync({
          id: contact.id,
          data: updates
        });
      }

      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('aiRemindersUpdated', {
        detail: { count: contactsToUpdate.length }
      }));
    } else if (debugMode) {
      console.log('✅ All contacts have up-to-date AI reminders');
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Run immediately on mount
    const timer = setTimeout(() => {
      processReminders();
    }, 3000); // 3 second delay for initial load

    // Set up interval
    const intervalMs = parseInterval(checkInterval);
    const intervalId = setInterval(() => {
      processReminders();
    }, intervalMs);

    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
    };
  }, [enabled, contacts, checkInterval, debugMode]);

  // Debug panel
  if (debugMode && enabled) {
    return (
      <div className="fixed bottom-24 right-4 z-50 bg-black/90 border border-white/20 rounded-lg p-4 max-w-sm">
        <h3 className="text-white font-bold mb-2">🤖 AI Reminder Engine</h3>
        <div className="text-white/70 text-xs space-y-1">
          <p>Status: <span className="text-green-400">Active</span></p>
          <p>Contacts: {contacts.length}</p>
          <p>Check Interval: {checkInterval}</p>
          <button
            onClick={processReminders}
            className="mt-2 px-3 py-1 bg-purple-600 rounded text-white text-xs w-full"
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