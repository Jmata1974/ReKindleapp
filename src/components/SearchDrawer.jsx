import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Calendar, Phone, MessageCircle, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';

export default function SearchDrawer({ isOpen, onClose, contacts, onContactHover, onContactClick, onUpdateReminder, theme }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const isRetro = theme === 'retro';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

  const filteredContacts = useMemo(() => {
    let results = contacts;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.notes?.toLowerCase().includes(query) ||
          c.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (filterType === 'recent') {
      results = results.filter((c) => {
        if (!c.last_contacted) return false;
        const days = differenceInDays(new Date(), new Date(c.last_contacted));
        return days <= 7;
      });
    } else if (filterType === 'dormant') {
      results = results.filter((c) => {
        if (!c.last_contacted) return true;
        const days = differenceInDays(new Date(), new Date(c.last_contacted));
        return days > 30;
      });
    } else if (filterType === 'inner') {
      results = results.filter((c) => c.orbit_level <= 4);
    }

    // Sort by name
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, searchQuery, filterType]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-2xl overflow-hidden"
            style={{
              backgroundColor: isRetro ? 'rgba(0, 0, 0, 0.95)' : 'rgba(30, 27, 75, 0.95)',
              backdropFilter: 'blur(20px)',
              borderLeft: isRetro ? '2px solid rgba(0, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: isRetro ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Search Contacts</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  {/* Changed: Use ChevronRight on both desktop and mobile for consistency */}
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, notes, or tags..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 mt-4">
                {['all', 'recent', 'dormant', 'inner'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      filterType === type
                        ? isRetro
                          ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                          : 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {type === 'all' && 'All'}
                    {type === 'recent' && 'Recent'}
                    {type === 'dormant' && 'Dormant'}
                    {type === 'inner' && 'Inner Circle'}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto h-[calc(100%-180px)]">
              {filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40">
                  <Search className="w-12 h-12 mb-2" />
                  <p>No contacts found</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {filteredContacts.map((contact) => (
                    <ContactSearchCard
                      key={contact.id}
                      contact={contact}
                      onHover={onContactHover}
                      onClick={onContactClick}
                      theme={theme}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ContactSearchCard({ contact, onHover, onClick, theme }) {
  const isRetro = theme === 'retro';
  const daysSinceContact = contact.last_contacted
    ? differenceInDays(new Date(), new Date(contact.last_contacted))
    : null;

  const getStatusColor = () => {
    if (!daysSinceContact) return 'bg-gray-500/20 text-gray-300';
    if (daysSinceContact <= 7) return 'bg-green-500/20 text-green-300';
    if (daysSinceContact <= 30) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => onHover(contact)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(contact)}
      className="p-4 rounded-xl cursor-pointer transition-all border"
      style={{
        backgroundColor: isRetro ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.05)',
        borderColor: isRetro ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          {contact.avatar_url ? (
            <img
              src={contact.avatar_url}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: contact.sphere_color || '#8b5cf6' }}
            >
              <span className="text-white font-bold">{contact.name[0]?.toUpperCase()}</span>
            </div>
          )}
          <div>
            <h3 className="text-white font-semibold">{contact.name}</h3>
            <p className="text-white/60 text-xs capitalize">
              {contact.relationship?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <Badge className={`${getStatusColor()} text-xs`}>
          Ring {contact.orbit_level}
        </Badge>
      </div>

      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {contact.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor: isRetro ? 'rgba(255, 0, 255, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                color: isRetro ? '#ff00ff' : '#a78bfa'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {daysSinceContact !== null && (
        <p className="text-white/50 text-xs">
          Last contact: {daysSinceContact === 0 ? 'Today' : `${daysSinceContact} days ago`}
        </p>
      )}
    </motion.div>
  );
}