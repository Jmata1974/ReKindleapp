import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, AlertTriangle, TrendingDown, Calendar, Target, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CustomTriggerRules({ rules, onRulesChange, theme = 'cosmic' }) {
  const [editingRule, setEditingRule] = useState(null);
  const isRetro = theme === 'retro';

  const conditionTypes = [
    { value: 'health_drop', label: 'Health Score Drops', icon: TrendingDown, description: 'Trigger when health drops by X points' },
    { value: 'health_below', label: 'Health Below Threshold', icon: AlertTriangle, description: 'Trigger when health falls below X' },
    { value: 'days_inactive', label: 'Days Without Contact', icon: Calendar, description: 'Trigger after X days of no contact' },
    { value: 'orbit_drift', label: 'Orbit Drift', icon: Target, description: 'Trigger when contact moves out X orbits' },
    { value: 'sentiment_decline', label: 'Sentiment Declining', icon: Heart, description: 'Trigger when sentiment drops by X points' },
    { value: 'milestone_approaching', label: 'Milestone Soon', icon: Sparkles, description: 'Trigger X days before milestone' }
  ];

  const addNewRule = () => {
    const newRule = {
      id: Date.now().toString(),
      name: 'New Trigger Rule',
      enabled: true,
      condition_type: 'health_drop',
      threshold_value: 10,
      action: 'suggest_reminder',
      priority_level: 'medium'
    };
    setEditingRule(newRule);
  };

  const saveRule = (rule) => {
    const existingIndex = rules.findIndex(r => r.id === rule.id);
    if (existingIndex >= 0) {
      const updatedRules = [...rules];
      updatedRules[existingIndex] = rule;
      onRulesChange(updatedRules);
    } else {
      onRulesChange([...rules, rule]);
    }
    setEditingRule(null);
  };

  const deleteRule = (ruleId) => {
    onRulesChange(rules.filter(r => r.id !== ruleId));
  };

  const toggleRule = (ruleId) => {
    const updatedRules = rules.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    onRulesChange(updatedRules);
  };

  const getConditionLabel = (rule) => {
    const condition = conditionTypes.find(c => c.value === rule.condition_type);
    const unit = rule.condition_type === 'days_inactive' || rule.condition_type === 'milestone_approaching' ? 'days' :
                 rule.condition_type === 'orbit_drift' ? 'rings' : 'points';
    return `${condition?.label}: ${rule.threshold_value} ${unit}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">Custom Trigger Rules</h3>
          <p className="text-white/60 text-xs">Define when AI should suggest or create reminders</p>
        </div>
        <Button
          onClick={addNewRule}
          size="sm"
          className={`${
            isRetro
              ? 'bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          } text-white`}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Rule
        </Button>
      </div>

      {/* Existing Rules */}
      {rules.length > 0 ? (
        <div className="space-y-3">
          {rules.map((rule, idx) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-xl border transition-all ${
                rule.enabled 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                  : 'bg-black/40 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-medium">{rule.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      rule.priority_level === 'critical' ? 'bg-red-500/20 text-red-300' :
                      rule.priority_level === 'high' ? 'bg-orange-500/20 text-orange-300' :
                      rule.priority_level === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {rule.priority_level}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">{getConditionLabel(rule)}</p>
                  <p className="text-white/40 text-xs mt-1">
                    Action: {rule.action === 'auto_set_reminder' ? '🤖 Auto-set' : 
                             rule.action === 'suggest_reminder' ? '💡 Suggest' : '🔔 Notify'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Target className="w-4 h-4 text-white/60 hover:text-white" />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400/60 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
          <AlertTriangle className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60 text-sm">No custom rules yet</p>
          <p className="text-white/40 text-xs">Click "Add Rule" to create your first trigger</p>
        </div>
      )}

      {/* Rule Editor Modal */}
      <AnimatePresence>
        {editingRule && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
              onClick={() => setEditingRule(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-md"
            >
              <div className="bg-gradient-to-b from-indigo-950/95 to-purple-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">
                  {rules.find(r => r.id === editingRule.id) ? 'Edit Rule' : 'Create Rule'}
                </h3>

                <div className="space-y-4">
                  {/* Rule Name */}
                  <div className="space-y-2">
                    <Label className="text-white">Rule Name</Label>
                    <Input
                      value={editingRule.name}
                      onChange={(e) => setEditingRule(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="e.g., Alert on health drop"
                    />
                  </div>

                  {/* Condition Type */}
                  <div className="space-y-2">
                    <Label className="text-white">Trigger Condition</Label>
                    <Select 
                      value={editingRule.condition_type} 
                      onValueChange={(value) => setEditingRule(prev => ({ ...prev, condition_type: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-white/60 text-xs">
                      {conditionTypes.find(t => t.value === editingRule.condition_type)?.description}
                    </p>
                  </div>

                  {/* Threshold Value */}
                  <div className="space-y-2">
                    <Label className="text-white">
                      Threshold Value ({
                        editingRule.condition_type === 'days_inactive' || editingRule.condition_type === 'milestone_approaching' ? 'days' :
                        editingRule.condition_type === 'orbit_drift' ? 'rings' : 'points'
                      })
                    </Label>
                    <Input
                      type="number"
                      value={editingRule.threshold_value}
                      onChange={(e) => setEditingRule(prev => ({ ...prev, threshold_value: parseFloat(e.target.value) }))}
                      className="bg-white/5 border-white/10 text-white"
                      min="1"
                    />
                  </div>

                  {/* Action */}
                  <div className="space-y-2">
                    <Label className="text-white">Action</Label>
                    <Select 
                      value={editingRule.action} 
                      onValueChange={(value) => setEditingRule(prev => ({ ...prev, action: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suggest_reminder">💡 Suggest Reminder</SelectItem>
                        <SelectItem value="auto_set_reminder">🤖 Auto-Set Reminder</SelectItem>
                        <SelectItem value="notify_only">🔔 Notify Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label className="text-white">Priority Level</Label>
                    <Select 
                      value={editingRule.priority_level} 
                      onValueChange={(value) => setEditingRule(prev => ({ ...prev, priority_level: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🔵 Low</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="high">🟠 High</SelectItem>
                        <SelectItem value="critical">🔴 Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setEditingRule(null)}
                    className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => saveRule(editingRule)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Save Rule
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}