import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sparkles, Bell, Calendar, Target, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function ReminderSettings({ contact, onSave, theme = 'cosmic' }) {
  const [settings, setSettings] = useState({
    contact_goal: contact?.contact_goal || 'maintain',
    custom_goal_description: contact?.custom_goal_description || '',
    reminder_frequency: contact?.reminder_frequency || 'ai_suggested',
    reminder_triggers: contact?.reminder_triggers || ['orbit_drift', 'long_silence', 'ai_prediction']
  });

  const isRetro = theme === 'retro';

  const contactGoals = [
    { value: 'maintain', label: 'Maintain', description: 'Keep the relationship at current level' },
    { value: 'strengthen', label: 'Strengthen', description: 'Grow closer, contact more frequently' },
    { value: 'reconnect', label: 'Reconnect', description: 'Rebuild a dormant relationship' },
    { value: 'stay_in_touch', label: 'Stay in Touch', description: 'Occasional check-ins' },
    { value: 'professional', label: 'Professional', description: 'Work-related networking' },
    { value: 'custom', label: 'Custom', description: 'Define your own goal' }
  ];

  const frequencies = [
    { value: 'ai_suggested', label: '🤖 AI Suggested', description: 'Let AI determine optimal timing' },
    { value: 'daily', label: 'Daily', description: 'Remind me every day' },
    { value: 'weekly', label: 'Weekly', description: 'Remind me every week' },
    { value: 'biweekly', label: 'Bi-weekly', description: 'Remind me every 2 weeks' },
    { value: 'monthly', label: 'Monthly', description: 'Remind me every month' },
    { value: 'quarterly', label: 'Quarterly', description: 'Remind me every 3 months' },
    { value: 'manual', label: 'Manual', description: 'I\'ll set reminders myself' }
  ];

  const triggers = [
    { value: 'orbit_drift', label: 'Orbit Drift', description: 'When contact moves outward' },
    { value: 'long_silence', label: 'Long Silence', description: 'After extended period without contact' },
    { value: 'ai_prediction', label: 'AI Prediction', description: 'When AI detects optimal timing' },
    { value: 'birthday', label: 'Birthday', description: 'On special occasions (coming soon)' },
    { value: 'milestone', label: 'Milestone', description: 'Life events (coming soon)' },
    { value: 'manual', label: 'Manual', description: 'Only manual reminders' }
  ];

  const toggleTrigger = (trigger) => {
    setSettings(prev => {
      const triggers = prev.reminder_triggers.includes(trigger)
        ? prev.reminder_triggers.filter(t => t !== trigger)
        : [...prev.reminder_triggers, trigger];
      return { ...prev, reminder_triggers: triggers };
    });
  };

  const handleSave = () => {
    onSave({
      ...settings,
      custom_goal_description: settings.contact_goal === 'custom' ? settings.custom_goal_description : ''
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border backdrop-blur-xl ${
        isRetro ? 'bg-black/80 border-cyan-400/30' : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${isRetro ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Reminder Settings</h3>
          <p className="text-white/60 text-sm">Customize how you stay connected</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Contact Goal */}
        <div>
          <Label className="text-white mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Relationship Goal
          </Label>
          <Select value={settings.contact_goal} onValueChange={(value) => setSettings(prev => ({ ...prev, contact_goal: value }))}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {contactGoals.map((goal) => (
                <SelectItem key={goal.value} value={goal.value}>
                  <div>
                    <div className="font-semibold">{goal.label}</div>
                    <div className="text-xs text-white/60">{goal.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {settings.contact_goal === 'custom' && (
            <Input
              value={settings.custom_goal_description}
              onChange={(e) => setSettings(prev => ({ ...prev, custom_goal_description: e.target.value }))}
              placeholder="Describe your custom goal..."
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          )}
        </div>

        {/* Reminder Frequency */}
        <div>
          <Label className="text-white mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Reminder Frequency
          </Label>
          <Select value={settings.reminder_frequency} onValueChange={(value) => setSettings(prev => ({ ...prev, reminder_frequency: value }))}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {frequencies.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  <div>
                    <div className="font-semibold">{freq.label}</div>
                    <div className="text-xs text-white/60">{freq.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reminder Triggers */}
        <div>
          <Label className="text-white mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Reminder Triggers
          </Label>
          <div className="space-y-2">
            {triggers.map((trigger) => (
              <button
                key={trigger.value}
                onClick={() => toggleTrigger(trigger.value)}
                disabled={trigger.value === 'birthday' || trigger.value === 'milestone'}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  settings.reminder_triggers.includes(trigger.value)
                    ? isRetro
                      ? 'bg-cyan-500/20 border-cyan-400/50'
                      : 'bg-purple-500/20 border-purple-400/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                } ${
                  (trigger.value === 'birthday' || trigger.value === 'milestone') ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{trigger.label}</div>
                    <div className="text-white/60 text-xs">{trigger.description}</div>
                  </div>
                  {settings.reminder_triggers.includes(trigger.value) && (
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        {settings.reminder_frequency === 'ai_suggested' && (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">AI-Powered Reminders</h4>
              <p className="text-white/70 text-xs">
                Our AI will analyze your interaction patterns, relationship goals, and contact behavior to suggest
                optimal times for follow-ups. You'll get personalized conversation starters and context-aware suggestions.
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className={`w-full ${
            isRetro
              ? 'bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          } text-white font-semibold`}
        >
          Save Settings
        </Button>
      </div>
    </motion.div>
  );
}