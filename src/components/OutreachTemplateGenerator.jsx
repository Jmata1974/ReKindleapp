import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Loader2,
  Send,
  Phone,
  Mail,
  MessageCircle,
  Target,
  Heart,
  Briefcase,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

export default function OutreachTemplateGenerator({ contact, onUpdateContact, theme = 'cosmic' }) {
  const [generating, setGenerating] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [selectedType, setSelectedType] = useState('all');

  const isRetro = theme === 'retro';

  const templateTypes = [
    { value: 'all', label: 'All Templates', icon: FileText },
    { value: 'goal_aligned', label: 'Goal-Aligned', icon: Target },
    { value: 'check_in', label: 'Check-In', icon: Heart },
    { value: 'professional', label: 'Professional', icon: Briefcase },
    { value: 'reconnect', label: 'Reconnect', icon: Users }
  ];

  const generateTemplates = async () => {
    setGenerating(true);

    try {
      const prompt = `Generate 6 highly personalized outreach message templates for this contact:

CONTACT PROFILE:
- Name: ${contact.name}
- Relationship: ${contact.relationship || 'friend'}
- Relationship Goal: ${contact.contact_goal || 'maintain'}
${contact.custom_goal_description ? `- Custom Goal: ${contact.custom_goal_description}` : ''}
- Last Contacted: ${contact.last_contacted || 'unknown'}
- Notes: ${contact.notes || 'no specific notes'}
- Tags: ${contact.tags?.join(', ') || 'none'}
- Orbit Level: ${contact.orbit_level} (1=closest, 12=furthest)
- Health Score: ${contact.health_score || 'unknown'}
- Preferred Communication: ${contact.behavior_patterns?.preferred_communication || 'unknown'}
${contact.next_milestone ? `- Upcoming Milestone: ${contact.next_milestone.event} on ${contact.next_milestone.date}` : ''}

PAST INTERACTIONS:
${contact.sentiment_history?.slice(-3).map(s => `- ${s.date}: ${s.note_excerpt || 'No excerpt'}`).join('\n') || 'No recent history'}

REQUIREMENTS:
1. Create complete, ready-to-send messages (not just openers)
2. Align each template with the contact's relationship goal
3. Reference past interactions and notes when relevant
4. Include appropriate call-to-action for each message type
5. Vary length and formality based on relationship
6. For reconnection: acknowledge gap naturally
7. For goal-aligned: explicitly advance the stated relationship goal
8. For professional: include collaboration or networking elements
9. Make each template feel genuine and personalized
10. Include appropriate sign-offs

Generate exactly 6 templates covering:
- 2 goal-aligned messages
- 1 casual check-in
- 1 professional/networking
- 1 reconnection message
- 1 milestone-based (if applicable) or thoughtful follow-up`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            templates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  subject: { 
                    type: 'string', 
                    description: 'Email subject line or message title' 
                  },
                  body: { 
                    type: 'string', 
                    description: 'Full message body' 
                  },
                  type: { 
                    type: 'string',
                    enum: ['goal_aligned', 'check_in', 'professional', 'reconnect', 'milestone'],
                    description: 'Template type'
                  },
                  channel: {
                    type: 'string',
                    enum: ['email', 'text', 'phone', 'any'],
                    description: 'Best channel for this message'
                  },
                  tone: {
                    type: 'string',
                    description: 'Message tone description'
                  }
                }
              },
              minItems: 6,
              maxItems: 6
            }
          }
        }
      });

      setTemplates(result.templates || []);

    } catch (error) {
      console.error('Failed to generate templates:', error);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sendTemplate = (template, channel) => {
    const message = encodeURIComponent(template.body);
    switch (channel) {
      case 'sms':
        if (contact.phone) window.open(`sms:${contact.phone}?body=${message}`, '_self');
        break;
      case 'email':
        if (contact.email) window.open(`mailto:${contact.email}?subject=${encodeURIComponent(template.subject)}&body=${message}`, '_self');
        break;
      case 'phone':
        if (contact.phone) {
          copyToClipboard(template.body, -1);
          window.open(`tel:${contact.phone}`, '_self');
        }
        break;
    }
  };

  const filteredTemplates = selectedType === 'all' 
    ? templates 
    : templates.filter(t => t.type === selectedType);

  const getTypeColor = (type) => {
    switch (type) {
      case 'goal_aligned': return 'bg-purple-500/20 text-purple-300';
      case 'check_in': return 'bg-pink-500/20 text-pink-300';
      case 'professional': return 'bg-blue-500/20 text-blue-300';
      case 'reconnect': return 'bg-orange-500/20 text-orange-300';
      case 'milestone': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email': return Mail;
      case 'text': return MessageCircle;
      case 'phone': return Phone;
      default: return Send;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className={`w-5 h-5 ${isRetro ? 'text-pink-400' : 'text-purple-400'}`} />
          <h3 className="text-lg font-semibold text-white">Outreach Templates</h3>
          {templates.length > 0 && (
            <Badge className={`${isRetro ? 'bg-pink-500/20 text-pink-300' : 'bg-purple-500/20 text-purple-300'}`}>
              {templates.length}
            </Badge>
          )}
        </div>

        <Button
          onClick={generateTemplates}
          disabled={generating}
          size="sm"
          className={`${
            isRetro
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          } text-white`}
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {templates.length > 0 ? 'Regenerate' : 'Generate'}
            </>
          )}
        </Button>
      </div>

      {/* Type Filter */}
      {templates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {templateTypes.map((type) => {
            const Icon = type.icon;
            const count = type.value === 'all' ? templates.length : templates.filter(t => t.type === type.value).length;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedType === type.value
                    ? isRetro
                      ? 'bg-pink-500/30 text-pink-300 border-2 border-pink-400/50'
                      : 'bg-purple-500/30 text-purple-300 border-2 border-purple-400/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{type.label}</span>
                {count > 0 && (
                  <Badge className="ml-1 bg-white/20 text-white text-xs px-1.5">
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Templates List */}
      <AnimatePresence>
        {filteredTemplates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            {filteredTemplates.map((template, idx) => {
              const ChannelIcon = getChannelIcon(template.channel);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group p-5 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(template.type)}>
                          {template.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-white/60 border-white/20">
                          <ChannelIcon className="w-3 h-3 mr-1" />
                          {template.channel}
                        </Badge>
                      </div>
                      <h4 className="text-white font-semibold mb-1">{template.subject}</h4>
                      <p className="text-white/60 text-xs">{template.tone}</p>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(template.body, idx)}
                      className={`p-2 rounded-lg transition-all ${
                        isRetro 
                          ? 'bg-pink-500/20 hover:bg-pink-500/30' 
                          : 'bg-purple-500/20 hover:bg-purple-500/30'
                      }`}
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-white" />
                      )}
                    </motion.button>
                  </div>

                  {/* Body */}
                  <div className="p-4 bg-black/20 rounded-lg mb-3">
                    <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
                      {template.body}
                    </p>
                  </div>

                  {/* Quick Send Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {contact.phone && (template.channel === 'text' || template.channel === 'any') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendTemplate(template, 'sms')}
                        className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Text
                      </Button>
                    )}
                    {contact.phone && (template.channel === 'phone' || template.channel === 'any') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendTemplate(template, 'phone')}
                        className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    )}
                    {contact.email && (template.channel === 'email' || template.channel === 'any') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendTemplate(template, 'email')}
                        className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!generating && templates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 px-6"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FileText className="w-20 h-20 text-white/20 mx-auto mb-4" />
          </motion.div>
          
          <h4 className="text-white font-semibold mb-2">
            Generate Smart Outreach Templates
          </h4>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
            AI crafts complete, personalized messages tailored to your relationship goal 
            with {contact.name} and past interactions.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6">
            {[
              { icon: Target, text: 'Goal-Aligned', desc: 'Advances your relationship objective' },
              { icon: Heart, text: 'Contextual', desc: 'Based on past conversations' },
              { icon: Sparkles, text: 'Ready to Send', desc: 'Complete messages, not just ideas' },
              { icon: Send, text: 'Multi-Channel', desc: 'Optimized for email, text, or call' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-white/5 rounded-lg border border-white/10 text-left"
              >
                <feature.icon className={`w-5 h-5 mb-2 ${isRetro ? 'text-pink-400' : 'text-purple-400'}`} />
                <p className="text-white/90 text-xs font-medium mb-1">{feature.text}</p>
                <p className="text-white/50 text-xs">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className={`w-16 h-16 mx-auto mb-4 ${isRetro ? 'text-pink-400' : 'text-purple-400'}`} />
          </motion.div>
          <p className="text-white/80 font-medium mb-2">
            Crafting personalized templates...
          </p>
          <p className="text-white/60 text-sm">
            Analyzing relationship goal, past interactions, and context
          </p>
          
          <div className="flex justify-center gap-1 mt-6">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: isRetro ? '#ff00ff' : '#8b5cf6' }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}