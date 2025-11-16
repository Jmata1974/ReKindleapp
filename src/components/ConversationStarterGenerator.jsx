
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Loader2,
  Send,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Wand2,
  Brain,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

// Helper function to normalize conversation starters into a clean array of PLAIN STRINGS
function normalizeConversationStarters(raw) {
  if (!raw) return [];

  // If it's already an array, extract strings
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        // If item is an object with a 'text' property, extract it
        if (item && typeof item === "object" && "text" in item) {
          return String(item.text || '');
        }
        // If item is already a string, use it
        if (typeof item === "string") {
          return item;
        }
        // Try to stringify anything else
        try {
          return String(item);
        } catch (e) {
          return '';
        }
      })
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // If it's a single string, wrap it in an array
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed ? [trimmed] : [];
  }

  // For objects that aren't arrays, try to extract if it has starters property
  if (typeof raw === 'object' && raw.starters) {
    return normalizeConversationStarters(raw.starters);
  }

  // Fallback: stringify anything else
  try {
    const asString = String(raw).trim();
    return asString ? [asString] : [];
  } catch (e) {
    console.error('Failed to normalize conversation starters:', e);
    return [];
  }
}

// Helper to convert string array back to display objects with default metadata
function convertToDisplayFormat(stringArray) {
  if (!Array.isArray(stringArray)) return [];
  
  return stringArray.map((text, idx) => ({
    text: text,
    category: 'casual', // Default category
    tone: 'warm' // Default tone
  }));
}

export default function ConversationStarterGenerator({ contact, onUpdateContact, theme = 'cosmic' }) {
  // Normalize initial starters from contact (stored as plain strings in DB)
  const initialStartersStrings = normalizeConversationStarters(contact.ai_conversation_starters);
  const initialStartersDisplay = convertToDisplayFormat(initialStartersStrings);
  
  const [generating, setGenerating] = useState(false);
  const [starters, setStarters] = useState(initialStartersDisplay);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const isRetro = theme === 'retro';

  const themeColors = {
    cosmic: { primary: '#8b5cf6', secondary: '#ec4899', tertiary: '#fbbf24' },
    sunrise: { primary: '#ff6b6b', secondary: '#ffa366', tertiary: '#f59e0b' },
    retro: { primary: '#00ffff', secondary: '#ff00ff', tertiary: '#9d00ff' },
    aurora: { primary: '#34d399', secondary: '#8b5cf6', tertiary: '#ec4899' },
    solar: { primary: '#f59e0b', secondary: '#ef4444', tertiary: '#fbbf24' },
    ocean: { primary: '#4f46e5', secondary: '#67e8f9', tertiary: '#8b5cf6' }
  };

  const colors = themeColors[theme] || themeColors.cosmic;

  const categories = [
    { value: 'all', label: 'All Ideas', emoji: '✨' },
    { value: 'casual', label: 'Casual', emoji: '😊' },
    { value: 'professional', label: 'Professional', emoji: '💼' },
    { value: 'thoughtful', label: 'Thoughtful', emoji: '💭' },
    { value: 'reconnect', label: 'Reconnect', emoji: '🔄' }
  ];

  const generateStarters = async (category = 'all') => {
    setGenerating(true);

    try {
      const categoryPrompts = {
        all: 'Generate a diverse mix of conversation starters covering casual check-ins, professional topics, thoughtful questions, and reconnection approaches',
        casual: 'Generate casual, friendly conversation starters suitable for informal catch-ups and lighthearted discussions',
        professional: 'Generate professional conversation starters related to work, career development, or business opportunities',
        thoughtful: 'Generate deep, thoughtful conversation starters that show genuine care and interest in their life and wellbeing',
        reconnect: 'Generate warm, genuine conversation starters specifically designed to reconnect after a period of no contact'
      };

      const prompt = `Generate 8 highly personalized conversation starters for this contact:

CONTACT INFORMATION:
- Name: ${contact.name}
- Relationship: ${contact.relationship || 'friend'}
- Last Contacted: ${contact.last_contacted || 'unknown'}
- Notes: ${contact.notes || 'no specific notes'}
- Tags: ${contact.tags?.join(', ') || 'none'}
- Orbit Level: ${contact.orbit_level} (1=closest, 12=furthest)
- Phone: ${contact.phone ? 'available' : 'not available'}
- Email: ${contact.email ? 'available' : 'not available'}

CATEGORY FOCUS: ${categoryPrompts[category]}

REQUIREMENTS:
1. Make each starter unique, natural, and conversational
2. Reference specific details from their profile when possible
3. Vary the tone and depth - mix light and meaningful
4. Include questions that invite engagement
5. Consider the relationship context and history
6. Make them feel personal, not generic
7. Include time-appropriate references if relevant (holidays, seasons, etc.)
8. For reconnection: acknowledge the gap naturally without being awkward

Format each starter as a complete, ready-to-send message.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            starters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string', description: 'The conversation starter message' },
                  category: { 
                    type: 'string', 
                    enum: ['casual', 'professional', 'thoughtful', 'reconnect'],
                    description: 'Category of this starter'
                  },
                  tone: { 
                    type: 'string',
                    enum: ['light', 'warm', 'curious', 'enthusiastic', 'caring'],
                    description: 'Emotional tone'
                  }
                }
              },
              minItems: 8,
              maxItems: 8
            }
          }
        }
      });

      // Get the full objects for display (with category and tone)
      const startersWithMetadata = result.starters || [];
      
      // Extract ONLY the text as plain strings for database storage
      const startersAsStrings = startersWithMetadata.map(s => s.text || String(s)).filter(s => s.trim().length > 0);
      
      // Set the full objects in state for rich display
      setStarters(startersWithMetadata);

      // Save ONLY plain strings to the database
      if (contact.id && startersAsStrings.length > 0) {
        await onUpdateContact({
          ai_conversation_starters: startersAsStrings
        });
      }

    } catch (error) {
      console.error('Failed to generate conversation starters:', error);
      // Set empty array on error instead of leaving in broken state
      setStarters([]);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sendViaChannel = (starter, channel) => {
    const message = encodeURIComponent(starter);
    switch (channel) {
      case 'sms':
        if (contact.phone) window.open(`sms:${contact.phone}?body=${message}`, '_self');
        break;
      case 'email':
        if (contact.email) window.open(`mailto:${contact.email}?body=${message}`, '_self');
        break;
      case 'phone':
        if (contact.phone) {
          copyToClipboard(starter, -1);
          window.open(`tel:${contact.phone}`, '_self');
        }
        break;
    }
  };

  const filteredStarters = selectedCategory === 'all' 
    ? starters 
    : starters.filter(s => s.category === selectedCategory);

  const getToneColor = (tone) => {
    switch (tone) {
      case 'light': return 'text-yellow-400';
      case 'warm': return 'text-orange-400';
      case 'curious': return 'text-blue-400';
      case 'enthusiastic': return 'text-pink-400';
      case 'caring': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getToneEmoji = (tone) => {
    switch (tone) {
      case 'light': return '😊';
      case 'warm': return '🤗';
      case 'curious': return '🤔';
      case 'enthusiastic': return '🎉';
      case 'caring': return '💜';
      default: return '💬';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ 
              rotate: generating ? 360 : 0,
              scale: generating ? [1, 1.2, 1] : 1
            }}
            transition={{ 
              rotate: { duration: 2, repeat: generating ? Infinity : 0, ease: 'linear' },
              scale: { duration: 0.5, repeat: generating ? Infinity : 0 }
            }}
          >
            <Wand2 className={`w-5 h-5 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
          </motion.div>
          <h3 className="text-lg font-semibold text-white">Conversation Starters</h3>
          {starters.length > 0 && (
            <Badge className={`${isRetro ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'}`}>
              {starters.length}
            </Badge>
          )}
        </div>

        <Button
          onClick={() => generateStarters(selectedCategory === 'all' ? 'all' : selectedCategory)}
          disabled={generating}
          size="sm"
          className={`${
            isRetro
              ? 'bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700'
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
              <RefreshCw className="w-4 h-4 mr-2" />
              {starters.length > 0 ? 'Refresh' : 'Generate'}
            </>
          )}
        </Button>
      </div>

      {/* Category Filter */}
      {starters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const count = cat.value === 'all' ? starters.length : starters.filter(s => s.category === cat.value).length;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.value
                    ? isRetro
                      ? 'bg-cyan-500/30 text-cyan-300 border-2 border-cyan-400/50'
                      : 'bg-purple-500/30 text-purple-300 border-2 border-purple-400/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
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

      {/* Conversation Starters List */}
      <AnimatePresence>
        {filteredStarters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-3"
          >
            {filteredStarters.map((starter, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="group relative p-4 rounded-xl border transition-all"
                style={{
                  background: isRetro 
                    ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(255, 0, 255, 0.05))'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.05))',
                  borderColor: isRetro ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)'
                }}
              >
                {/* Starter Text */}
                <div className="mb-3 pr-20">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xl">{getToneEmoji(starter.tone)}</span>
                    <p className="text-white/90 leading-relaxed flex-1">
                      {starter.text}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`text-xs ${
                      starter.category === 'casual' ? 'bg-blue-500/20 text-blue-300' :
                      starter.category === 'professional' ? 'bg-indigo-500/20 text-indigo-300' :
                      starter.category === 'thoughtful' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-pink-500/20 text-pink-300'
                    }`}>
                      {starter.category}
                    </Badge>
                    <span className={`text-xs ${getToneColor(starter.tone)}`}>
                      {starter.tone}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(starter.text, idx)}
                    className={`p-2 rounded-lg transition-all ${
                      isRetro 
                        ? 'bg-cyan-500/20 hover:bg-cyan-500/30' 
                        : 'bg-purple-500/20 hover:bg-purple-500/30'
                    }`}
                    title="Copy to clipboard"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </motion.button>
                </div>

                {/* Quick Send Options - Show on expand */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/10 pt-3 mt-3 flex gap-2"
                    >
                      {contact.phone && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendViaChannel(starter.text, 'sms')}
                            className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Text
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendViaChannel(starter.text, 'phone')}
                            className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        </>
                      )}
                      {contact.email && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendViaChannel(starter.text, 'email')}
                          className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Expand/Collapse Toggle */}
            {filteredStarters.length > 0 && (contact.phone || contact.email) && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-white/60 hover:text-white"
              >
                <Send className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {expanded ? 'Hide' : 'Show'} Quick Send Options
                </span>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!generating && starters.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <MessageCircle className="w-20 h-20 text-white/20 mx-auto mb-4" />
          </motion.div>
          
          <h4 className="text-white font-semibold mb-2">
            Generate Smart Conversation Starters
          </h4>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
            Let AI create personalized conversation openers based on {contact.name}'s profile, 
            interests, and your relationship history.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6">
            {[
              { icon: Sparkles, text: 'Personalized', color: colors.primary },
              { icon: Brain, text: 'Context-Aware', color: colors.secondary },
              { icon: MessageCircle, text: 'Natural', color: colors.tertiary },
              { icon: Target, text: 'Engaging', color: colors.primary }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <feature.icon className="w-5 h-5 mx-auto mb-1" style={{ color: feature.color }} />
                <p className="text-white/70 text-xs">{feature.text}</p>
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
            <Sparkles className={`w-16 h-16 mx-auto mb-4 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
          </motion.div>
          <p className="text-white/80 font-medium mb-2">
            Crafting personalized starters...
          </p>
          <p className="text-white/60 text-sm">
            Analyzing {contact.name}'s profile and relationship context
          </p>
          
          {/* Loading animation */}
          <div className="flex justify-center gap-1 mt-6">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: isRetro ? '#00ffff' : '#8b5cf6' }}
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
