
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Trash, Tag, Sparkles, Pencil, Clock, X, Phone, Mail, MessageCircle, User, Filter, Search, ArrowUpDown } from 'lucide-react';
import CosmicBackground from '../components/CosmicBackground';
import Navigation from '../components/Navigation';
import BottomNavigation from '../components/BottomNavigation';
import AmbientSoundManager from '../components/AmbientSoundManager';
import CursorTrail from '../components/CursorTrail';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('All');
  const [filterContact, setFilterContact] = useState('');
  const [sortOption, setSortOption] = useState('Newest');
  const [newNote, setNewNote] = useState({ title: '', content: '', tag: 'Personal', pinned: false, reminder: '', phone: '', email: '', contact: '' });
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
    initialData: []
  });

  const theme = user?.theme || 'cosmic';

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('rekindle_notes') || '[]');
    const notesWithDates = saved.map(note => ({
      ...note,
      createdAt: note.createdAt || new Date().toISOString()
    }));
    setNotes(notesWithDates);
  }, []);

  useEffect(() => {
    localStorage.setItem('rekindle_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getContactInfo = (name) => {
    return contacts.find(c => c.name === name);
  };

  const addNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return;
    const note = { ...newNote, id: Date.now(), createdAt: new Date().toISOString() };
    setNotes([note, ...notes]);
    setNewNote({ title: '', content: '', tag: 'Personal', pinned: false, reminder: '', phone: '', email: '', contact: '' });
    setShowReminderPicker(false);
    setShowContactPicker(false);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
    setEditModalOpen(false);
    setEditingNote(null);
  };

  const togglePin = (id) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const openEditModal = (note) => {
    const contactInfo = note.contact ? getContactInfo(note.contact) : null;
    setEditingNote({ 
      ...note,
      phone: contactInfo?.phone || note.phone || '',
      email: contactInfo?.email || note.email || ''
    });
    setEditModalOpen(true);
  };

  const saveEdit = () => {
    if (!editingNote) return;
    setNotes(notes.map((n) => (n.id === editingNote.id ? editingNote : n)));
    setEditModalOpen(false);
    setEditingNote(null);
  };

  const filteredNotes = notes
    .filter((n) => (filterTag === 'All' ? true : n.tag === filterTag))
    .filter((n) => (filterContact === '' ? true : n.contact === filterContact))
    .filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'Newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'Oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'Reminder':
          if (!a.reminder && !b.reminder) return 0;
          if (!a.reminder) return 1;
          if (!b.reminder) return -1;
          return new Date(a.reminder) - new Date(b.reminder);
        case 'Contact':
          if (!a.contact && !b.contact) return 0;
          if (!a.contact) return 1;
          if (!b.contact) return -1;
          return (a.contact || '').localeCompare(b.contact || '');
        default:
          return 0;
      }
    });

  const tags = ['All', 'Personal', 'Ideas', 'Work', 'Reminders'];

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pb-32">
      <AmbientSoundManager />
      <CursorTrail />
      
      {/* Cosmic Background with Breathing Effect */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity }}
        style={{ zIndex: 0 }}
      >
        <CosmicBackground theme={theme} />
      </motion.div>

      {/* Gradient Pulse Overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-full h-full bg-gradient-to-b from-indigo-900/40 via-purple-700/20 to-black/40" />
      </motion.div>

      {/* Stellar Shimmer Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: 0.8
            }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 15 }}
          />
        ))}
      </div>

      <Navigation currentPage="Notes" />

      <div className="relative z-10 container mx-auto px-6 pt-24">
        <motion.h1 
          className="text-5xl font-bold mb-8 text-center text-transparent bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 bg-clip-text"
          initial={{ opacity: 0, y: -30 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            textShadow: [
              '0 0 20px rgba(255, 220, 168, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
              '0 0 30px rgba(255, 220, 168, 0.5), 0 0 60px rgba(255, 0, 255, 0.4)',
              '0 0 20px rgba(255, 220, 168, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)'
            ]
          }}
          transition={{ 
            opacity: { duration: 1 },
            y: { duration: 1 },
            textShadow: { duration: 3, ease: 'easeInOut', repeat: Infinity }
          }}
        >
          Personal Notes <Sparkles className="inline ml-2 text-indigo-300" />
        </motion.h1>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 max-w-5xl mx-auto">
          <div className="relative w-full md:w-auto md:flex-grow">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-300" />
            <input
              type="text"
              placeholder="🔍 Search notes..."
              className="w-full pl-12 pr-4 py-2 rounded-lg bg-white/10 text-white backdrop-blur-md border border-white/20 focus:ring-2 focus:ring-pink-500 transition-all placeholder-white/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-3 flex-wrap justify-center md:justify-end">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setFilterTag(t)}
                className={`px-3 py-1 text-sm rounded-full border transition-all ${
                  filterTag === t
                    ? 'bg-pink-600 text-white border-pink-400'
                    : 'bg-white/10 text-white border-white/20 hover:bg-pink-600/30'
                }`}
              >
                {t}
              </button>
            ))}

            <div className="flex items-center">
              <Filter className="w-4 h-4 text-white/60 mr-2" />
              <select
                value={filterContact}
                onChange={(e) => setFilterContact(e.target.value)}
                className="bg-[#1E1E2A] text-[#E8E8FF] px-3 py-1 text-sm rounded-full border border-[#5A5A7C]"
              >
                <option value="">All Contacts</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.name}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <ArrowUpDown className="w-4 h-4 text-white/60 mr-2" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-[#1E1E2A] text-[#E8E8FF] px-3 py-1 text-sm rounded-full border border-[#5A5A7C]"
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
                <option value="Reminder">By Reminder Date</option>
                <option value="Contact">By Contact Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add New Note Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="p-6 mb-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl text-left max-w-5xl mx-auto"
        >
          <input
            type="text"
            placeholder="Note title..."
            className="w-full text-2xl font-semibold bg-transparent text-pink-200 mb-2 focus:outline-none placeholder-pink-200/40"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          />
          <textarea
            placeholder="Type your note here..."
            className="w-full bg-transparent text-white resize-none h-32 focus:outline-none placeholder-indigo-300/60 mb-3"
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          />
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="bg-[#1E1E2A] text-[#E8E8FF] px-3 py-2 rounded-md border border-[#5A5A7C]"
              value={newNote.tag}
              onChange={(e) => setNewNote({ ...newNote, tag: e.target.value })}
            >
              {tags.filter((t) => t !== 'All').map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                boxShadow: ['0 0 20px rgba(139, 92, 246, 0.3)', '0 0 30px rgba(255, 0, 255, 0.5)', '0 0 20px rgba(139, 92, 246, 0.3)']
              }}
              transition={{ 
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                boxShadow: { duration: 3, ease: 'easeInOut', repeat: Infinity }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReminderPicker(!showReminderPicker)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                  transform: 'translateX(-100%)',
                  zIndex: 1,
                }}
                animate={{
                  transform: ['translateX(-100%)', 'translateX(100%)'],
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 4.2,
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Remind Me
              </span>
            </motion.button>

            {showReminderPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <input
                  type="datetime-local"
                  value={newNote.reminder}
                  onChange={(e) => setNewNote({ ...newNote, reminder: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-black text-white border-2 border-indigo-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all backdrop-blur-sm"
                  style={{
                    colorScheme: 'dark',
                    minWidth: '200px'
                  }}
                />
                {newNote.reminder && (
                  <button
                    type="button"
                    onClick={() => setNewNote({ ...newNote, reminder: '' })}
                    className="text-xs text-white/60 hover:text-white px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </motion.div>
            )}

            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                boxShadow: ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 30px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)']
              }}
              transition={{ 
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                boxShadow: { duration: 3, ease: 'easeInOut', repeat: Infinity }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowContactPicker(!showContactPicker)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                  transform: 'translateX(-100%)',
                  zIndex: 1,
                }}
                animate={{
                  transform: ['translateX(-100%)', 'translateX(100%)'],
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 4.2,
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <User className="w-4 h-4" /> Link Contact
              </span>
            </motion.button>

            {showContactPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <select
                  value={newNote.contact}
                  onChange={(e) => {
                    const selectedContact = contacts.find(c => c.name === e.target.value);
                    setNewNote({ 
                      ...newNote, 
                      contact: e.target.value,
                      phone: selectedContact?.phone || '',
                      email: selectedContact?.email || ''
                    });
                  }}
                  className="bg-[#1E1E2A] text-[#E8E8FF] px-3 py-2 rounded-md border border-[#5A5A7C] min-w-[200px]"
                >
                  <option value="">Select a contact...</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.name}>{contact.name}</option>
                  ))}
                </select>
                {newNote.contact && (
                  <button
                    type="button"
                    onClick={() => setNewNote({ ...newNote, contact: '', phone: '', email: '' })}
                    className="text-xs text-white/60 hover:text-white px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </motion.div>
            )}

            <motion.button
              onClick={addNote}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                boxShadow: ['0 0 20px rgba(236, 72, 153, 0.3)', '0 0 30px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(236, 72, 153, 0.3)']
              }}
              transition={{ 
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                boxShadow: { duration: 3, ease: 'easeInOut', repeat: Infinity }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                  transform: 'translateX(-100%)',
                  zIndex: 1,
                }}
                animate={{
                  transform: ['translateX(-100%)', 'translateX(100%)'],
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 4.2,
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Add Note
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Notes Grid with Enhanced Hover Effects */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <AnimatePresence>
            {filteredNotes.map((note) => {
              const contactInfo = getContactInfo(note.contact);
              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ 
                    scale: 1.03, 
                    boxShadow: '0 0 20px rgba(138, 180, 255, 0.3)',
                    transition: { type: 'spring', stiffness: 150, damping: 15 }
                  }}
                  className="relative cursor-pointer"
                >
                  <Card className="bg-white/10 border border-indigo-500/30 backdrop-blur-xl transition-all h-full">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1" onClick={() => openEditModal(note)}>
                          <div className="flex items-center gap-2 mb-2">
                            {note.pinned && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                            <h3 className="text-lg font-semibold text-indigo-200">{note.title || 'Untitled'}</h3>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            aria-label={note.pinned ? "Unpin note" : "Pin note"}
                          >
                            <Star className={`w-4 h-4 ${note.pinned ? 'text-yellow-400 fill-yellow-400' : 'text-white/40 hover:text-yellow-300'}`} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (window.confirm('Are you sure you want to delete this note?')) {
                                deleteNote(note.id);
                              }
                            }}
                            className="p-2 rounded-full hover:bg-red-500/20 transition-colors"
                            aria-label="Delete note"
                          >
                            <Trash className="w-4 h-4 text-red-400 hover:text-red-300" />
                          </button>
                        </div>
                      </div>
                      <div onClick={() => openEditModal(note)}>
                        <p className="text-indigo-100 whitespace-pre-wrap mb-3 line-clamp-3">{note.content}</p>
                        
                        {/* Tag, Reminder, Contact, and Date Display */}
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="px-2 py-1 rounded-lg bg-indigo-600/30 text-indigo-200">{note.tag}</span>
                            {note.reminder && (
                              <span className="flex items-center text-indigo-300 text-xs">
                                <Clock className="w-3 h-3 mr-1" /> 
                                {new Date(note.reminder).toLocaleString()}
                              </span>
                            )}
                          </div>
                          {note.contact && (
                            <span className="flex items-center text-indigo-300 text-xs">
                              <User className="w-3 h-3 mr-1" /> 
                              {note.contact}
                            </span>
                          )}
                          {note.createdAt && (
                            <span className="text-xs text-indigo-400/60">
                              Created {new Date(note.createdAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contact Action Buttons */}
                      {note.contact && contactInfo && (contactInfo.phone || contactInfo.email) && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                          {contactInfo.phone && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`tel:${contactInfo.phone}`, '_self');
                                }}
                                className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs"
                              >
                                <Phone className="w-3 h-3" />
                                Call
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`sms:${contactInfo.phone}`, '_self');
                                }}
                                className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs"
                              >
                                <MessageCircle className="w-3 h-3" />
                                Text
                              </button>
                            </>
                          )}
                          {contactInfo.email && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`mailto:${contactInfo.email}`, '_self');
                              }}
                              className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-xs"
                            >
                              <Mail className="w-3 h-3" />
                              Email
                            </button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Enhanced Empty State */}
        {filteredNotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 max-w-2xl mx-auto"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-6"
            >
              <Sparkles className="w-24 h-24 text-white/20 mx-auto" />
            </motion.div>
            
            {search || filterTag !== 'All' || filterContact ? (
              <>
                <h3 className="text-2xl font-bold text-white mb-3">No matching notes</h3>
                <p className="text-white/60 text-lg mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button
                  onClick={() => {
                    setSearch('');
                    setFilterTag('All');
                    setFilterContact('');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-white mb-3">Your thoughts deserve a home</h3>
                <p className="text-white/60 text-lg mb-6 leading-relaxed">
                  Capture ideas, reminders, and reflections about the people in your life. 
                  Link notes to contacts and never forget the little things that matter.
                </p>
                <div className="flex flex-wrap gap-3 justify-center text-sm text-white/50">
                  <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-pink-400" />
                    <span>Quick capture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    <span>Link to contacts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Set reminders</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Edit Note Modal */}
      <AnimatePresence>
        {editModalOpen && editingNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setEditModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-gradient-to-b from-indigo-950/95 to-purple-950/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(255, 220, 168, 0.5)' }}>
                    Edit Note
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Title */}
                  <input
                    type="text"
                    placeholder="Note title..."
                    className="w-full text-2xl font-semibold bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-white/40"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  />

                  {/* Content */}
                  <textarea
                    placeholder="Note content..."
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg resize-none h-40 focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-white/40"
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  />

                  {/* Tag, Reminder, and Linked Contact */}
                  <div className="flex gap-3 items-center flex-wrap">
                    <select
                      className="bg-[#1E1E2A] text-[#E8E8FF] px-3 py-2 rounded-md border border-[#5A5A7C]"
                      value={editingNote.tag}
                      onChange={(e) => setEditingNote({ ...editingNote, tag: e.target.value })}
                    >
                      {tags.filter((t) => t !== 'All').map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    <input
                      type="datetime-local"
                      value={editingNote.reminder || ''}
                      onChange={(e) => setEditingNote({ ...editingNote, reminder: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-black text-white border-2 border-indigo-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                      style={{
                        colorScheme: 'dark',
                      }}
                    />

                    <select
                      value={editingNote.contact || ''}
                      onChange={(e) => {
                        const selectedContact = contacts.find(c => c.name === e.target.value);
                        setEditingNote({ 
                          ...editingNote, 
                          contact: e.target.value,
                          phone: selectedContact?.phone || '',
                          email: selectedContact?.email || ''
                        });
                      }}
                      className="bg-[#1E1E2A] text-[#E8E8FF] px-3 py-2 rounded-md border border-[#5A5A7C]"
                    >
                      <option value="">No contact linked</option>
                      {contacts.map((contact) => (
                        <option key={contact.id} value={contact.name}>{contact.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Actions in Edit Modal - Debug to see values */}
                  {editingNote.contact && (editingNote.phone || editingNote.email) && (
                    <div className="flex gap-3 p-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg border border-white/20">
                      {editingNote.phone && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(`tel:${editingNote.phone}`, '_self');
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
                              e.stopPropagation();
                              window.open(`sms:${editingNote.phone}`, '_self');
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 flex-1 font-semibold shadow-lg hover:shadow-blue-500/50"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Text
                          </button>
                        </>
                      )}
                      {editingNote.email && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`mailto:${editingNote.email}`, '_self');
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 flex-1 font-semibold shadow-lg hover:shadow-purple-500/50"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </button>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this note?')) {
                          deleteNote(editingNote.id);
                        }
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button
                      onClick={saveEdit}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNavigation currentPage="Notes" />

      <style jsx>{`
        select {
          background-color: #1E1E2A;
          color: #E8E8FF;
          border: 1px solid #5A5A7C;
        }
        select option {
          background-color: #1E1E2A;
          color: #E8E8FF;
        }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
          font-size: 1.2em;
          padding: 4px;
        }
        input[type="datetime-local"] {
          appearance: none;
          -webkit-appearance: none;
        }
      `}</style>
    </div>
  );
}
