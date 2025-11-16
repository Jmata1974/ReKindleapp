import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarCheck, 
  Phone, 
  MessageCircle, 
  Mail, 
  X, 
  Clock, 
  Brain,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { addDays } from 'date-fns';

export default function SmartReminderCard({ 
  contact, 
  onDismiss, 
  onContactClick, 
  onAccept,
  theme = 'cosmic',
  showActions = true,
  compact = false
}) {
  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(false);
  const [customSnooze, setCustomSnooze] = useState('');
  const queryClient = useQueryClient();

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

  const isRetro = theme === 'retro';
  const aiData = contact.ai_reminder_data || {};

  const urgencyColors = {
    high: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-400/50', glow: 'rgba(239, 68, 68, 0.3)' },
    medium: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-400/50', glow: 'rgba(251, 146, 60, 0.3)' },
    low: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-400/50', glow: 'rgba(59, 130, 246, 0.3)' }
  };

  const urgencyStyle = urgencyColors[aiData.urgency] || urgencyColors.low;

  const approachStyle = aiData.suggested_approach === 'casual' ? '😊 Casual' :
                       aiData.suggested_approach === 'professional' ? '💼 Professional' :
                       aiData.suggested_approach === 'thoughtful' ? '💭 Thoughtful' :
                       aiData.suggested_approach === 'reconnect' ? '🔄 Reconnect' : '💬 General';

  const snoozeDurations = [
    { value: '1d', label: '1 Day' },
    { value: '3d', label: '3 Days' },
    { value: '1w', label: '1 Week' },
    { value: '2w', label: '2 Weeks' },
    { value: '1m', label: '1 Month' },
    { value: 'custom', label: 'Custom...' }
  ];

  const parseSnoozeDuration = (duration) => {
    const match = duration.match(/^(\d+)([dwm])$/);
    if (!match) return 3; // default 3 days
    
    const [, amount, unit] = match;
    const value = parseInt(amount);
    
    switch (unit) {
      case 'd': return value;
      case 'w': return value * 7;
      case 'm': return value * 30;
      default: return 3;
    }
  };

  const handleSnooze = (duration) => {
    let days;
    if (duration === 'custom') {
      days = parseInt(customSnooze) || 3;
    } else {
      days = parseSnoozeDuration(duration);
    }

    const snoozeDate = addDays(new Date(), days);
    updateContactMutation.mutate({
      id: contact.id,
      data: { snooze_until: snoozeDate.toISOString().split('T')[0] }
    });
    
    setSnoozeMenuOpen(false);
    if (onDismiss) onDismiss(contact.id);
  };

  const handleAccept = () => {
    updateContactMutation.mutate({
      id: contact.id,
      data: {
        reminder_date: aiData.reminder_date,
        ai_reminder_data: {
          ...aiData,
          accepted: true,
          accepted_at: new Date().toISOString()
        }
      }
    });
    
    window.dispatchEvent(new CustomEvent('pointsEarned', {
      detail: { 
        points: 15, 
        reason: 'AI reminder accepted!',
        action: `Scheduled follow-up with ${contact.name}`
      }
    }));
    
    if (onAccept) onAccept(contact.id);
  };

  const handleReject = () => {
    updateContactMutation.mutate({
      id: contact.id,
      data: {
        ai_reminder_data: null,
        ai_reminder_last_generated: null
      }
    });
    if (onDismiss) onDismiss(contact.id);
  };

  const handleMarkContacted = () => {
    const today = new Date().toISOString().split('T')[0];
    updateContactMutation.mutate({
      id: contact.id,
      data: {
        last_contacted: today,
        ai_reminder_data: null,
        ai_reminder_last_generated: null,
        reminder_date: null
      }
    });
    
    window.dispatchEvent(new CustomEvent('pointsEarned', {
      detail: { 
        points: 20, 
        reason: 'Follow-up completed!',
        action: `Contacted ${contact.name}`
      }
    }));
    
    if (onDismiss) onDismiss(contact.id);
  };

  if (compact) {
    return (
      <div className={`p-4 rounded-xl border backdrop-blur-xl ${
        isRetro ? 'bg-black/80 border-cyan-400/30' : 'bg-white/5 border-white/10'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${urgencyStyle.bg}`} />
          <span className="text-white font-medium flex-1">{contact.name}</span>
          <Badge className={`${urgencyStyle.bg} ${urgencyStyle.text}`}>
            {aiData.priority || aiData.urgency}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`p-6 rounded-2xl border backdrop-blur-xl relative overflow-hidden ${
        isRetro ? 'bg-black/80 border-cyan-400/30' : 'bg-white/5 border-white/10'
      }`}
      style={{
        boxShadow: `0 0 40px ${urgencyStyle.glow}`
      }}
    >
      {/* Urgency indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${urgencyStyle.bg}`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {contact.avatar_url ? (
            <img src={contact.avatar_url} alt={contact.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/20">
              <span className="text-xl font-bold text-white">{contact.name[0]?.toUpperCase()}</span>
            </div>
          )}
          <div>
            <h3 className="text-white font-semibold text-lg">{contact.name}</h3>
            <p className="text-white/60 text-sm capitalize">{contact.relationship?.replace('_', ' ')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`${urgencyStyle.bg} ${urgencyStyle.text} ${urgencyStyle.border} border`}>
            {aiData.urgency} priority
          </Badge>
          {aiData.was_auto_set && (
            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-400/50">
              <Sparkles className="w-3 h-3 mr-1" />
              Auto
            </Badge>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-3 mb-4">
        {/* Reason */}
        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-start gap-2 mb-2">
            <Brain className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
            <div>
              <p className="text-white/80 text-xs font-medium mb-1">Why Now?</p>
              <p className="text-white/90 text-sm leading-relaxed">{aiData.reason}</p>
            </div>
          </div>
          
          {aiData.confidence_score && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
              <span className="text-white/60 text-xs">AI Confidence:</span>
              <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${aiData.confidence_score}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
              <span className="text-white font-semibold text-sm">{aiData.confidence_score}%</span>
            </div>
          )}
        </div>

        {/* Suggested Actions */}
        {aiData.suggested_actions && aiData.suggested_actions.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/20">
            <p className="text-white/80 text-xs font-medium mb-2">💡 Suggested Actions:</p>
            <ul className="space-y-1">
              {aiData.suggested_actions.slice(0, 3).map((action, idx) => (
                <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Approach & Timing */}
        <div className="flex gap-2">
          <Badge variant="outline" className="text-white/70 border-white/20">
            {approachStyle}
          </Badge>
          {aiData.optimal_timing && (
            <Badge variant="outline" className="text-white/70 border-white/20">
              <Clock className="w-3 h-3 mr-1" />
              {aiData.optimal_timing}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="space-y-3">
          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button
              onClick={handleMarkContacted}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CalendarCheck className="w-4 h-4 mr-2" />
              Already Did
            </Button>
          </div>

          {/* Snooze & Reject */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Button
                onClick={() => setSnoozeMenuOpen(!snoozeMenuOpen)}
                variant="outline"
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Clock className="w-4 h-4 mr-2" />
                Snooze
                {snoozeMenuOpen ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
              </Button>

              {/* Snooze Dropdown */}
              <AnimatePresence>
                {snoozeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-gradient-to-b from-indigo-950/95 to-purple-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  >
                    {snoozeDurations.map((duration, idx) => (
                      <React.Fragment key={duration.value}>
                        {duration.value === 'custom' ? (
                          <div className="p-3 border-t border-white/10">
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Days"
                                value={customSnooze}
                                onChange={(e) => setCustomSnooze(e.target.value)}
                                className="flex-1 bg-white/5 border-white/10 text-white h-8 text-sm"
                                min="1"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSnooze('custom')}
                                disabled={!customSnooze}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                Set
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSnooze(duration.value)}
                            className={`w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 transition-colors text-sm ${
                              user?.default_snooze_duration === duration.value ? 'bg-white/5 font-medium' : ''
                            }`}
                          >
                            {duration.label}
                            {user?.default_snooze_duration === duration.value && (
                              <span className="ml-2 text-xs text-white/40">(default)</span>
                            )}
                          </button>
                        )}
                      </React.Fragment>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              onClick={handleReject}
              variant="outline"
              className="bg-white/5 border-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-300"
            >
              <X className="w-4 h-4 mr-2" />
              Dismiss
            </Button>
          </div>

          {/* Contact Methods */}
          {(contact.phone || contact.email) && (
            <div className="flex gap-2 pt-2 border-t border-white/10">
              {contact.phone && (
                <>
                  <button
                    onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg transition-all text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                  <button
                    onClick={() => window.open(`sms:${contact.phone}`, '_self')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-all text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Text
                  </button>
                </>
              )}
              {contact.email && (
                <button
                  onClick={() => window.open(`mailto:${contact.email}`, '_self')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg transition-all text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}