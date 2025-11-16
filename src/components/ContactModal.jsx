
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Save, Trash2, FileText, Phone, MessageCircle, Mail, Plus, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ContactAI from './ContactAI';
import HealthScoreCard from './HealthScoreCard';
import AdvancedAIAnalyzer from './AdvancedAIAnalyzer';
import ConversationStarterGenerator from './ConversationStarterGenerator';
import OutreachTemplateGenerator from './OutreachTemplateGenerator';

export default function ContactModal({ isOpen, onClose, contact, onSave, onDelete }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'friend',
    orbit_level: 6, // Default to middle ring (12 / 2)
    phone: '',
    email: '',
    notes: '',
    // reminder_days: 1, // This will be removed, but keeping for initial consistency before useEffect runs
    last_contacted: '',
    avatar_url: '',
    angle: Math.random() * 360,
    sphere_color: '#8b5cf6',
    tags: [],
    reminder_date: '',
    attachment_url: '',
    notes_history: [],
    ai_insights: null,
    ai_last_generated: null
  });
  
  const [uploading, setUploading] = useState(false);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const [outreachExpanded, setOutreachExpanded] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });
  const theme = user?.theme || 'cosmic';

  const themeColors = {
    cosmic: { primary: '#8b5cf6', secondary: '#fbbf24' },
    sunrise: { primary: '#ff6b6b', secondary: '#ffa366' },
    retro: { primary: '#ff00ff', secondary: '#00ffff' },
    aurora: { primary: '#34d399', secondary: '#8b5cf6' },
    solar: { primary: '#f59e0b', secondary: '#ef4444' },
    ocean: { primary: '#4f46e5', secondary: '#67e8f9' }
  };

  const colors = themeColors[theme] || themeColors.cosmic;
  const availableTags = ['Client', 'Friend', 'Family', 'Vendor', 'Lead', 'VIP', 'Mentor', 'Team'];

  // Update mutation for AI insights
  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  const handleAIUpdate = async (aiData) => {
    if (contact?.id) {
      setFormData(prev => ({ ...prev, ...aiData }));
      await updateContactMutation.mutateAsync({ 
        id: contact.id, 
        data: aiData 
      });
    }
  };

  useEffect(() => {
    if (contact) {
      setFormData({
        ...contact,
        tags: contact.tags || [],
        notes_history: contact.notes_history || [],
        phone: contact.phone || '',
        email: contact.email || '',
        reminder_date: contact.reminder_date || '',
        attachment_url: contact.attachment_url || '',
        // Ensure reminder_days is not present if reminder_date is used, or handle conversion if needed
        // For now, assuming reminder_date replaces reminder_days
        reminder_days: undefined,
        ai_insights: contact.ai_insights || null,
        ai_last_generated: contact.ai_last_generated || null
      });
    } else {
      setFormData({
        name: '',
        relationship: 'friend',
        orbit_level: 6, // Default to middle ring (12 / 2)
        phone: '',
        email: '',
        notes: '',
        // reminder_days: 1, // Removed in favor of reminder_date
        last_contacted: '',
        avatar_url: '',
        angle: Math.random() * 360,
        sphere_color: '#8b5cf6',
        tags: [],
        reminder_date: '',
        attachment_url: '',
        notes_history: [],
        ai_insights: null,
        ai_last_generated: null
      });
    }
  }, [contact, isOpen]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setUploading(false);
  };

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, attachment_url: file_url }));
    } catch (error) {
      console.error('Attachment upload failed:', error);
    }
    setAttachmentUploading(false);
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleNotesBlur = () => {
    // Add to history only if notes are updated and contact already exists
    if (contact && formData.notes !== (contact.notes || '')) {
      const newHistory = [
        ...(formData.notes_history || []),
        {
          timestamp: new Date().toISOString(),
          action: 'Notes updated' // More descriptive action
        }
      ];
      setFormData(prev => ({ ...prev, notes_history: newHistory }));
    }
  };

  const handleAddToNotes = () => {
    // First, save the contact to Orbit
    const dataToSave = { ...formData };
    delete dataToSave.reminder_days;
    
    // Save contact first
    onSave(dataToSave);
    
    // Create a new note with contact information
    const newNote = {
      id: Date.now(),
      title: `Note about ${formData.name}`,
      content: formData.notes || `Contact info for ${formData.name}`,
      tag: 'Personal',
      pinned: false,
      reminder: '',
      phone: formData.phone || '',
      email: formData.email || '',
      contact: formData.name,
      createdAt: new Date().toISOString()
    };

    // Get existing notes from localStorage
    const existingNotes = JSON.parse(localStorage.getItem('rekindle_notes') || '[]');
    
    // Add new note
    const updatedNotes = [newNote, ...existingNotes];
    
    // Save to localStorage
    localStorage.setItem('rekindle_notes', JSON.stringify(updatedNotes));
    
    // Close modal
    onClose(); 
    
    // Small delay to ensure contact is saved, then navigate
    setTimeout(() => {
      navigate(createPageUrl('Notes'));
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Pulse ambient sound
    if (window.ambientSound) {
      window.ambientSound.pulseForContact();
    }
    
    const dataToSave = { ...formData };
    delete dataToSave.reminder_days;

    // Track if this is a new contact or updating last_contacted
    const isNewContact = !contact;
    const isContactUpdate = formData.last_contacted && (!contact || formData.last_contacted !== contact.last_contacted);

    if (isContactUpdate) {
      const currentOrbit = contact?.orbit_level || formData.orbit_level || 6;
      const newOrbit = Math.max(1, currentOrbit - 3);
      
      dataToSave.manual_position = false;
      dataToSave.orbit_level = newOrbit;
      dataToSave.orbit_level_at_last_contact = newOrbit;
      
      if (window.ambientSound) {
        setTimeout(() => window.ambientSound.pulseForContact(), 200);
      }

      // Award points for follow-up
      if (contact) { // Only award if it's an update to an existing contact
        window.dispatchEvent(new CustomEvent('pointsEarned', {
          detail: { 
            points: 20, 
            reason: 'Follow-up completed!',
            action: `Contacted ${contact.name}`
          }
        }));
      }
    }

    // Award points for new contact
    if (isNewContact) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('pointsEarned', {
          detail: { 
            points: 10, 
            reason: 'New contact added!',
            action: `Added ${formData.name} to your network`
          }
        }));
      }, 500);
    }

    onSave(dataToSave);

    // Dispatch event for gamification tracking
    window.dispatchEvent(new CustomEvent('contactUpdated', {
      detail: { isNew: isNewContact, wasContacted: isContactUpdate }
    }));
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
            onAnimationStart={() => {
              if (isOpen && window.ambientSound) {
                window.ambientSound.deepenForModal();
              }
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onAnimationComplete={(definition) => {
              // Only restore filter when closing (exit animation)
              if (!isOpen && window.ambientSound) {
                window.ambientSound.restoreFilter();
              }
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-gradient-to-b from-indigo-950/95 to-purple-950/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gradient-to-b from-indigo-950/95 to-transparent backdrop-blur-xl z-10">
                <h2 className="text-2xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(255, 220, 168, 0.5)' }}>
                  {contact ? 'Edit Contact' : 'Add Contact'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Wrapper for scrollable form content */}
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {/* Health Score Section */}
                {contact && contact.health_score !== undefined && (
                  <HealthScoreCard contact={contact} theme={theme} />
                )}

                <form onSubmit={handleSubmit} className="space-y-6"> {/* p-6 removed here, applied to parent div */}
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      {formData.avatar_url ? (
                        <img
                          src={formData.avatar_url}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/20">
                          <span className="text-3xl font-bold text-white">
                            {formData.name[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    {uploading && <p className="text-sm text-white/60">Uploading...</p>}
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label className="text-white">Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      placeholder="Enter name"
                      required
                    />
                  </div>

                  {/* Contact Info - Moved up before tags */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-white">Phone</Label>
                      <Input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Email</Label>
                      <Input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  {/* Contact Action Buttons - Always show when phone or email is filled */}
                  {(formData.phone || formData.email) && (
                    <div className="space-y-3">
                      <div className="flex gap-2 p-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg border border-white/20">
                        {formData.phone && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(`tel:${formData.phone}`, '_self');
                              }}
                              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 flex-1 font-semibold shadow-lg hover:shadow-green-500/50"
                            >
                              <Phone className="w-4 h-4" />
                              Call
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(`sms:${formData.phone}`, '_self');
                              }}
                              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 flex-1 font-semibold shadow-lg hover:shadow-blue-500/50"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Text
                            </button>
                          </>
                        )}
                        {formData.email && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(`mailto:${formData.email}`, '_self');
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 flex-1 font-semibold shadow-lg hover:shadow-purple-500/50"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </button>
                        )}
                      </div>

                      {/* Add to Notes Button */}
                      <button
                        type="button"
                        onClick={handleAddToNotes}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-pink-500/50"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Notes
                      </button>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-white">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                            formData.tags.includes(tag)
                              ? 'text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          }`}
                          style={formData.tags.includes(tag) ? {
                            backgroundColor: colors.primary + '60',
                            border: `1px solid ${colors.secondary}`
                          } : {}}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Relationship */}
                  <div className="space-y-2">
                    <Label className="text-white">Relationship</Label>
                    <Select value={formData.relationship} onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="close_friend">Close Friend</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="colleague">Colleague</SelectItem>
                        <SelectItem value="acquaintance">Acquaintance</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Orbit Level */}
                  <div className="space-y-2">
                    <Label className="text-white">Orbit Level (1 = closest, 12 = furthest)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="12" // Changed from 10 to 12
                      value={formData.orbit_level}
                      onChange={(e) => setFormData(prev => ({ ...prev, orbit_level: parseInt(e.target.value) }))}
                      className="bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>

                  {/* Last Contacted */}
                  <div className="space-y-2">
                    <Label className="text-white">Last Contacted</Label>
                    <Input
                      type="date"
                      value={formData.last_contacted || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_contacted: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  {/* Reminder */}
                  <div className="space-y-2">
                    <Label className="text-white">Set Reminder</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const date = new Date();
                          date.setDate(date.getDate() + 3);
                          setFormData(prev => ({ ...prev, reminder_date: date.toISOString().split('T')[0] }));
                        }}
                        className="px-3 py-2 bg-white/10 rounded-lg text-white/80 text-sm hover:bg-white/20 transition-colors"
                      >
                        3 days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const date = new Date();
                          date.setDate(date.getDate() + 7);
                          setFormData(prev => ({ ...prev, reminder_date: date.toISOString().split('T')[0] }));
                        }}
                        className="px-3 py-2 bg-white/10 rounded-lg text-white/80 text-sm hover:bg-white/20 transition-colors"
                      >
                        1 week
                      </button>
                      <Input
                        type="date"
                        value={formData.reminder_date || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, reminder_date: e.target.value }))}
                        className="bg-white/5 border-white/10 text-white flex-1"
                        placeholder="Custom date"
                      />
                    </div>
                    {formData.reminder_date && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, reminder_date: '' }))}
                        className="text-xs text-white/60 hover:text-white mt-1"
                      >
                        Clear reminder
                      </button>
                    )}
                  </div>

                  {/* AI Insights Section - NEW */}
                  {contact && (
                    <div className="space-y-2 border-t border-white/10 pt-6">
                      <button
                        type="button"
                        onClick={() => setAiExpanded(!aiExpanded)}
                        className="flex items-center justify-between w-full text-white group"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className={`w-5 h-5 ${theme === 'retro' ? 'text-cyan-400' : 'text-purple-400'}`} />
                          <Label className="cursor-pointer text-lg">AI Insights</Label>
                          {formData.ai_insights && (
                            <span className="text-xs text-white/40">
                              • Updated {new Date(formData.ai_last_generated).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <motion.div
                          animate={{ rotate: aiExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {aiExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 space-y-6">
                              {/* Conversation Starter Generator - Featured First */}
                              <div className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl border border-purple-400/20">
                                <ConversationStarterGenerator
                                  contact={formData}
                                  onUpdateContact={handleAIUpdate}
                                  theme={theme}
                                />
                              </div>

                              {/* Basic AI Insights */}
                              <ContactAI
                                contact={formData}
                                onUpdateContact={handleAIUpdate}
                                theme={theme}
                              />
                              
                              {/* Advanced AI Analysis */}
                              <div className="border-t border-white/10 pt-6">
                                <AdvancedAIAnalyzer
                                  contact={formData}
                                  onUpdateContact={handleAIUpdate}
                                  theme={theme}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Outreach Templates Section - NEW */}
                  {contact && (
                    <div className="space-y-2 border-t border-white/10 pt-6">
                      <button
                        type="button"
                        onClick={() => setOutreachExpanded(!outreachExpanded)}
                        className="flex items-center justify-between w-full text-white group"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className={`w-5 h-5 ${theme === 'retro' ? 'text-pink-400' : 'text-purple-400'}`} />
                          <Label className="cursor-pointer text-lg">Outreach Templates</Label>
                        </div>
                        <motion.div
                          animate={{ rotate: outreachExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {outreachExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4">
                              <OutreachTemplateGenerator
                                contact={formData}
                                onUpdateContact={handleAIUpdate}
                                theme={theme}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Notes Section */}
                  <div className="space-y-2 border-t border-white/10 pt-6">
                    <button
                      type="button"
                      onClick={() => setNotesExpanded(!notesExpanded)}
                      className="flex items-center justify-between w-full text-white"
                    >
                      <Label className="cursor-pointer">Notes & Attachments</Label>
                      <motion.div
                        animate={{ rotate: notesExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {notesExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="space-y-3 overflow-hidden"
                        >
                          <Textarea
                            value={formData.notes || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            onBlur={handleNotesBlur}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-32"
                            placeholder="Add personal notes..."
                          />

                          {/* Attachment */}
                          <div>
                            <Label className="text-white text-sm mb-2 block">Attachment</Label>
                            {formData.attachment_url ? (
                              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                                <FileText className="w-4 h-4 text-white/60" />
                                <a
                                  href={formData.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-white/80 hover:text-white flex-1 truncate"
                                >
                                  {formData.attachment_url.split('/').pop()}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, attachment_url: '' }))}
                                  className="text-white/60 hover:text-white"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 border-dashed rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                                <Upload className="w-4 h-4 text-white/60" />
                                <span className="text-sm text-white/60">
                                  {attachmentUploading ? 'Uploading...' : 'Upload file or image'}
                                </span>
                                <input
                                  type="file"
                                  onChange={handleAttachmentUpload}
                                  className="hidden"
                                  disabled={attachmentUploading}
                                />
                              </label>
                            )}
                          </div>

                          {/* History */}
                          {formData.notes_history && formData.notes_history.length > 0 && (
                            <div className="pt-3 border-t border-white/10">
                              <Label className="text-white text-sm mb-2 block">History</Label>
                              <div className="space-y-1">
                                {formData.notes_history.slice(-3).map((entry, idx) => ( // Show last 3 entries
                                  <p key={idx} className="text-xs text-white/50">
                                    {entry.action} • {new Date(entry.timestamp).toLocaleDateString()}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sphere Color */}
                  <div className="space-y-2">
                    <Label className="text-white">Sphere Color</Label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={formData.sphere_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, sphere_color: e.target.value }))}
                        className="w-16 h-10 rounded border border-white/10 bg-white/5 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.sphere_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, sphere_color: e.target.value }))}
                        className="bg-white/5 border-white/10 text-white flex-1"
                        placeholder="#8b5cf6"
                      />
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: formData.sphere_color }}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    {contact && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => onDelete(contact.id)}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
