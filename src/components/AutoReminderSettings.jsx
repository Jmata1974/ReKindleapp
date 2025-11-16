import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Sparkles, 
  Zap, 
  Target, 
  Bell, 
  BellOff,
  Clock,
  Brain,
  X,
  Save,
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomTriggerRules from './CustomTriggerRules';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

export default function AutoReminderSettings({ isOpen, onClose, theme = 'cosmic' }) {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });

  const [settings, setSettings] = useState({
    auto_reminders_enabled: user?.auto_reminders_enabled ?? true,
    auto_set_reminders: user?.auto_set_reminders ?? true,
    min_confidence_threshold: user?.min_confidence_threshold ?? 70,
    check_frequency: user?.check_frequency || '6h',
    prioritize_high_risk: user?.prioritize_high_risk ?? true,
    respect_manual_settings: user?.respect_manual_settings ?? true,
    custom_trigger_rules: user?.custom_trigger_rules || [],
    default_snooze_duration: user?.default_snooze_duration || '3d'
  });

  const isRetro = theme === 'retro';

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      onClose();
    }
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-gradient-to-b from-indigo-950/95 to-purple-950/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl pointer-events-auto max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gradient-to-b from-indigo-950/95 to-transparent backdrop-blur-xl z-10">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${isRetro ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
                    <Brain className={`w-6 h-6 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Smart Reminder Settings</h2>
                    <p className="text-white/60 text-sm">Configure AI-powered follow-up automation</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Master Toggle */}
                <div className="p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-purple-400" />
                      <div>
                        <h3 className="text-white font-semibold">Enable Smart Reminders</h3>
                        <p className="text-white/60 text-xs">AI analyzes all contacts for optimal follow-up timing</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.auto_reminders_enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_reminders_enabled: checked }))}
                    />
                  </div>
                </div>

                {settings.auto_reminders_enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6"
                  >
                    {/* Auto-Set Toggle */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-green-400" />
                          <div>
                            <h4 className="text-white font-medium">Auto-Set Reminders</h4>
                            <p className="text-white/60 text-xs">Automatically create reminders (high confidence only)</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.auto_set_reminders}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_set_reminders: checked }))}
                        />
                      </div>

                      {!settings.auto_set_reminders && (
                        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          <p className="text-blue-300 text-xs">
                            Suggestions will be shown in the Reminders page, but won't be automatically scheduled
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confidence Threshold */}
                    {settings.auto_set_reminders && (
                      <div className="space-y-3">
                        <Label className="text-white flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Confidence Threshold: {settings.min_confidence_threshold}%
                        </Label>
                        <Slider
                          value={[settings.min_confidence_threshold]}
                          onValueChange={(value) => setSettings(prev => ({ ...prev, min_confidence_threshold: value[0] }))}
                          min={50}
                          max={95}
                          step={5}
                          className="w-full"
                        />
                        <p className="text-white/60 text-xs">
                          Only auto-set reminders when AI is {settings.min_confidence_threshold}% confident or higher
                        </p>
                      </div>
                    )}

                    {/* Check Frequency */}
                    <div className="space-y-3">
                      <Label className="text-white flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Analysis Frequency
                      </Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: '3h', label: '3 hours' },
                          { value: '6h', label: '6 hours' },
                          { value: '12h', label: '12 hours' },
                          { value: '24h', label: '24 hours' }
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setSettings(prev => ({ ...prev, check_frequency: value }))}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              settings.check_frequency === value
                                ? isRetro
                                  ? 'bg-cyan-500/30 text-cyan-300 border-2 border-cyan-400/50'
                                  : 'bg-purple-500/30 text-purple-300 border-2 border-purple-400/50'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Default Snooze Duration */}
                    <div className="space-y-3">
                      <Label className="text-white flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Default Snooze Duration
                      </Label>
                      <Select 
                        value={settings.default_snooze_duration} 
                        onValueChange={(value) => setSettings(prev => ({ ...prev, default_snooze_duration: value }))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1d">1 Day</SelectItem>
                          <SelectItem value="3d">3 Days</SelectItem>
                          <SelectItem value="1w">1 Week</SelectItem>
                          <SelectItem value="2w">2 Weeks</SelectItem>
                          <SelectItem value="1m">1 Month</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-white/60 text-xs">
                        Default duration when snoozing AI reminder suggestions
                      </p>
                    </div>

                    {/* Custom Trigger Rules */}
                    <div className="border-t border-white/10 pt-6">
                      <CustomTriggerRules
                        rules={settings.custom_trigger_rules}
                        onRulesChange={(newRules) => setSettings(prev => ({ ...prev, custom_trigger_rules: newRules }))}
                        theme={theme}
                      />
                    </div>

                    {/* Advanced Options */}
                    <div className="space-y-3 border-t border-white/10 pt-6">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-400" />
                        Advanced Options
                      </h4>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white text-sm font-medium">Prioritize High-Risk Contacts</p>
                            <p className="text-white/60 text-xs">Focus on relationships at risk first</p>
                          </div>
                          <Switch
                            checked={settings.prioritize_high_risk}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, prioritize_high_risk: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white text-sm font-medium">Respect Manual Settings</p>
                            <p className="text-white/60 text-xs">Skip contacts with manual reminder preferences</p>
                          </div>
                          <Switch
                            checked={settings.respect_manual_settings}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, respect_manual_settings: checked }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-purple-500/10 border border-purple-400/30 rounded-xl flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-1">How It Works</h4>
                        <p className="text-white/70 text-xs leading-relaxed">
                          The AI analyzes engagement level, health scores, inactivity patterns, relationship goals, 
                          and your custom trigger rules to suggest optimal follow-up timing. High-confidence suggestions 
                          are automatically scheduled based on your settings.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex items-center justify-between sticky bottom-0 bg-gradient-to-b from-transparent to-indigo-950/95 backdrop-blur-xl">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateSettingsMutation.isPending}
                  className={`${
                    isRetro
                      ? 'bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  } text-white`}
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}