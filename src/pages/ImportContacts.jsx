import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Users, Sparkles, ArrowRight, X, UserPlus, Merge } from 'lucide-react';
import CosmicBackground from '../components/CosmicBackground';
import Navigation from '../components/Navigation';
import BottomNavigation from '../components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ImportContacts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [uploadedContacts, setUploadedContacts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [importDecisions, setImportDecisions] = useState({});
  const [importing, setImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [importResults, setImportResults] = useState({ success: 0, merged: 0, skipped: 0 });
  const [error, setError] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });

  const { data: existingContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
    initialData: []
  });

  const theme = user?.theme || 'cosmic';
  const isRetro = theme === 'retro';

  const themeColors = {
    cosmic: { primary: '#8b5cf6', secondary: '#fbbf24' },
    sunrise: { primary: '#ff6b6b', secondary: '#ffa366' },
    retro: { primary: '#ff00ff', secondary: '#00ffff' },
    aurora: { primary: '#34d399', secondary: '#8b5cf6' },
    solar: { primary: '#f59e0b', secondary: '#ef4444' },
    ocean: { primary: '#4f46e5', secondary: '#67e8f9' }
  };

  const colors = themeColors[theme] || themeColors.cosmic;

  // Parse CSV
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const contacts = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const contact = {};
      
      headers.forEach((header, idx) => {
        if (values[idx]) {
          contact[header] = values[idx];
        }
      });

      if (contact.name || contact.email || contact.phone) {
        contacts.push({
          name: contact.name || 'Unknown',
          email: contact.email || '',
          phone: contact.phone || '',
          relationship: contact.relationship || 'other',
          notes: contact.notes || '',
          company: contact.company || '',
          title: contact.title || ''
        });
      }
    }

    return contacts;
  };

  // Parse vCard
  const parseVCard = (text) => {
    const contacts = [];
    const vcards = text.split('BEGIN:VCARD');
    
    for (const vcard of vcards) {
      if (!vcard.trim()) continue;
      
      const contact = {
        name: '',
        email: '',
        phone: '',
        notes: '',
        relationship: 'other',
        company: '',
        title: ''
      };
      
      const lines = vcard.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('FN:')) {
          contact.name = trimmed.substring(3);
        } else if (trimmed.includes('EMAIL')) {
          const email = trimmed.split(':')[1];
          if (email) contact.email = email;
        } else if (trimmed.includes('TEL')) {
          const phone = trimmed.split(':')[1];
          if (phone) contact.phone = phone;
        } else if (trimmed.startsWith('NOTE:')) {
          contact.notes = trimmed.substring(5);
        } else if (trimmed.startsWith('ORG:')) {
          contact.company = trimmed.substring(4);
        } else if (trimmed.startsWith('TITLE:')) {
          contact.title = trimmed.substring(6);
        }
      }
      
      if (contact.name || contact.email || contact.phone) {
        contacts.push(contact);
      }
    }
    
    return contacts;
  };

  // Simple local duplicate detection
  const findDuplicates = (uploadedContacts, existingContacts) => {
    const existingByKey = new Map();
    
    existingContacts.forEach((c) => {
      const emailKey = c.email ? c.email.toLowerCase().trim() : '';
      const phoneKey = c.phone ? c.phone.replace(/[^0-9]/g, '') : '';
      const key = `${emailKey}|${phoneKey}`;
      
      if (key !== '|') {
        existingByKey.set(key, c);
      }
    });

    return uploadedContacts.map((u) => {
      const emailKey = u.email ? u.email.toLowerCase().trim() : '';
      const phoneKey = u.phone ? u.phone.replace(/[^0-9]/g, '') : '';
      const key = `${emailKey}|${phoneKey}`;
      
      const match = existingByKey.get(key) || null;
      return { uploaded: u, duplicateOf: match };
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.endsWith('.csv');
    const isVCard = file.name.endsWith('.vcf') || file.name.endsWith('.vcard');

    if (!isCSV && !isVCard) {
      setError('Please upload a CSV or vCard (.vcf) file');
      return;
    }

    setError(null);

    try {
      const text = await file.text();
      let parsed = [];

      if (isCSV) {
        parsed = parseCSV(text);
      } else if (isVCard) {
        parsed = parseVCard(text);
      }

      if (parsed.length === 0) {
        setError('No valid contacts found in file');
        return;
      }

      setUploadedContacts(parsed);
      
      // Run duplicate detection
      const matchResults = findDuplicates(parsed, existingContacts);
      setMatches(matchResults);

      // Initialize decisions - default to "import" for non-duplicates, "merge" for duplicates
      const initialDecisions = {};
      matchResults.forEach((m, idx) => {
        initialDecisions[idx] = m.duplicateOf ? 'merge' : 'import';
      });
      setImportDecisions(initialDecisions);

    } catch (err) {
      setError('Failed to read file: ' + err.message);
    }
  };

  const handleGoogleConnect = () => {
    alert('🚀 Google Contacts sync is coming soon!\n\nWe\'re working on direct integration with Google Contacts. For now, please export your contacts as a CSV or vCard file from Google Contacts and upload it here.');
  };

  const handleOutlookConnect = () => {
    alert('🚀 Outlook sync is coming soon!\n\nWe\'re working on direct integration with Outlook. For now, please export your contacts as a CSV or vCard file from Outlook and upload it here.');
  };

  const handleImportConfirmed = async () => {
    setImporting(true);
    
    let successCount = 0;
    let mergedCount = 0;
    let skippedCount = 0;

    try {
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const decision = importDecisions[i];

        if (decision === 'skip') {
          skippedCount++;
          continue;
        }

        if (decision === 'merge' && match.duplicateOf) {
          // Merge: update existing contact with new info
          const mergedData = {
            notes: match.duplicateOf.notes 
              ? `${match.duplicateOf.notes}\n\n[Imported]: ${match.uploaded.notes || ''}`
              : match.uploaded.notes,
            // Keep existing name, email, phone unless they were empty
            email: match.duplicateOf.email || match.uploaded.email,
            phone: match.duplicateOf.phone || match.uploaded.phone
          };

          await base44.entities.Contact.update(match.duplicateOf.id, mergedData);
          mergedCount++;
        } else {
          // Import as new
          await base44.entities.Contact.create({
            name: match.uploaded.name || 'Unknown',
            email: match.uploaded.email || '',
            phone: match.uploaded.phone || '',
            relationship: match.uploaded.relationship?.toLowerCase() || 'other',
            notes: match.uploaded.notes || '',
            orbit_level: 6,
            angle: Math.random() * 360,
            sphere_color: '#8b5cf6',
            last_contacted: new Date().toISOString().split('T')[0]
          });
          successCount++;
        }
      }

      setImportResults({ success: successCount, merged: mergedCount, skipped: skippedCount });
      setImportComplete(true);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    } catch (err) {
      setError('Import failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const updateDecision = (index, decision) => {
    setImportDecisions(prev => ({
      ...prev,
      [index]: decision
    }));
  };

  const downloadCSVTemplate = () => {
    const csv = 'name,email,phone,relationship,notes,company,title\nJohn Doe,john@example.com,555-0100,friend,Met at conference,Acme Inc,Developer\nJane Smith,jane@example.com,555-0101,colleague,Works in marketing,Tech Corp,Manager';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadVCardTemplate = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
EMAIL:john@example.com
TEL:555-0100
NOTE:Example contact
ORG:Acme Inc
TITLE:Developer
END:VCARD

BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
EMAIL:jane@example.com
TEL:555-0101
NOTE:Another example
ORG:Tech Corp
TITLE:Manager
END:VCARD`;
    
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.vcf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setUploadedContacts([]);
    setMatches([]);
    setImportDecisions({});
    setImportComplete(false);
    setImportResults({ success: 0, merged: 0, skipped: 0 });
    setError(null);
  };

  const duplicateCount = matches.filter(m => m.duplicateOf).length;

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pb-32">
      <CosmicBackground theme={theme} />
      <Navigation currentPage="ImportContacts" theme={theme} />

      <div className="relative z-10 max-w-6xl mx-auto p-6 pt-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-2"
            style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}
          >
            📥 Import Contacts
          </motion.h1>
          <p className="text-white/60 text-lg">Bring your people into ReKindle from files or connected accounts</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Initial View: Upload File or Connect Account */}
          {!importComplete && uploadedContacts.length === 0 && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Upload a File */}
                <div className={`p-8 rounded-2xl border backdrop-blur-xl ${
                  isRetro ? 'bg-black/60 border-cyan-400/30' : 'bg-white/5 border-white/10'
                }`}>
                  <h2 className="text-2xl font-bold text-white mb-2">Upload from file</h2>
                  <p className="text-white/60 mb-6">Import contacts from CSV or vCard (.vcf) files.</p>

                  <label className={`block w-full p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 text-center ${
                    isRetro
                      ? 'border-cyan-400/50 hover:border-cyan-400/80 hover:bg-cyan-500/10'
                      : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                  }`}>
                    <Upload className="w-12 h-12 mx-auto mb-3" style={{ color: colors.primary }} />
                    <p className="text-white font-medium mb-1">Choose CSV or vCard file</p>
                    <p className="text-white/60 text-sm">Drag & drop or click to browse</p>
                    <input
                      type="file"
                      accept=".csv,.vcf,.vcard"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <FileText className="w-4 h-4" style={{ color: colors.primary }} />
                      <span>Supports CSV and vCard formats</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={downloadCSVTemplate}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        CSV Template
                      </Button>
                      <Button
                        onClick={downloadVCardTemplate}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        vCard Template
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Connect an Account */}
                <div className={`p-8 rounded-2xl border backdrop-blur-xl ${
                  isRetro ? 'bg-black/60 border-pink-400/30' : 'bg-white/5 border-white/10'
                }`}>
                  <h2 className="text-2xl font-bold text-white mb-2">Connect an account</h2>
                  <p className="text-white/60 mb-6">Soon you'll be able to sync contacts from Google and Outlook.</p>

                  <div className="space-y-3">
                    <button
                      onClick={handleGoogleConnect}
                      className={`w-full p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                        isRetro
                          ? 'bg-black/40 border-cyan-400/20 hover:border-cyan-400/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#4285F4]/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#4285F4]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-semibold">Connect Google Contacts</p>
                        <p className="text-white/60 text-xs">Coming soon</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 text-xs font-semibold">
                        Soon
                      </span>
                    </button>

                    <button
                      onClick={handleOutlookConnect}
                      className={`w-full p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                        isRetro
                          ? 'bg-black/40 border-pink-400/20 hover:border-pink-400/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#0078D4]/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#0078D4]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-semibold">Connect Outlook</p>
                        <p className="text-white/60 text-xs">Coming soon</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 text-xs font-semibold">
                        Soon
                      </span>
                    </button>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-400/30">
                    <p className="text-blue-300 text-xs">
                      💡 <strong>Tip:</strong> You can export contacts from Google or Outlook as CSV/vCard files and upload them above.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/20 border border-red-400/50 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Review & Match */}
          {!importComplete && uploadedContacts.length > 0 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className={`p-6 rounded-2xl border backdrop-blur-xl mb-6 ${
                isRetro ? 'bg-black/60 border-cyan-400/30' : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Review & match</h2>
                    <p className="text-white/60 text-sm">
                      {uploadedContacts.length} contacts found
                      {duplicateCount > 0 && ` · ${duplicateCount} possible duplicates`}
                    </p>
                  </div>
                  <Button
                    onClick={resetImport}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>

                <p className="text-white/70 text-sm mb-6">
                  We'll highlight possible duplicates so you can decide what to keep.
                </p>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {matches.map((match, idx) => {
                    const decision = importDecisions[idx];
                    const isDuplicate = !!match.duplicateOf;

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 rounded-xl border ${
                          isDuplicate
                            ? isRetro
                              ? 'bg-yellow-900/20 border-yellow-400/40'
                              : 'bg-yellow-500/10 border-yellow-400/30'
                            : isRetro
                              ? 'bg-black/40 border-cyan-400/20'
                              : 'bg-white/5 border-white/10'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-semibold">{match.uploaded.name}</h3>
                              {isDuplicate ? (
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                                  Possible duplicate
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-500/20 text-green-300 border border-green-400/30">
                                  New contact
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3 text-sm text-white/60">
                              {match.uploaded.email && <span>📧 {match.uploaded.email}</span>}
                              {match.uploaded.phone && <span>📱 {match.uploaded.phone}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Duplicate Comparison */}
                        {isDuplicate && (
                          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-white/80 text-xs font-semibold mb-2">Matches existing contact:</p>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {match.duplicateOf.name?.[0]?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">{match.duplicateOf.name}</p>
                                <div className="flex gap-2 text-xs text-white/60">
                                  {match.duplicateOf.email && <span>{match.duplicateOf.email}</span>}
                                  {match.duplicateOf.phone && <span>{match.duplicateOf.phone}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {isDuplicate ? (
                            <>
                              <Button
                                onClick={() => updateDecision(idx, 'merge')}
                                size="sm"
                                className={`flex-1 ${
                                  decision === 'merge'
                                    ? 'bg-purple-600 hover:bg-purple-700'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                              >
                                <Merge className="w-4 h-4 mr-1" />
                                Merge
                              </Button>
                              <Button
                                onClick={() => updateDecision(idx, 'import')}
                                size="sm"
                                className={`flex-1 ${
                                  decision === 'import'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                              >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Keep Both
                              </Button>
                              <Button
                                onClick={() => updateDecision(idx, 'skip')}
                                size="sm"
                                className={`flex-1 ${
                                  decision === 'skip'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Skip
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={decision === 'import'}
                                  onChange={(e) => updateDecision(idx, e.target.checked ? 'import' : 'skip')}
                                  className="w-4 h-4 rounded accent-purple-600"
                                />
                                <span className="text-white text-sm">Import this contact</span>
                              </label>
                              {decision === 'import' && (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Import Summary & Action */}
              <div className={`p-6 rounded-2xl border backdrop-blur-xl ${
                isRetro ? 'bg-black/60 border-pink-400/30' : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Ready to import</h3>
                    <div className="flex gap-4 text-sm text-white/60">
                      <span>
                        {Object.values(importDecisions).filter(d => d === 'import').length} new
                      </span>
                      <span>•</span>
                      <span>
                        {Object.values(importDecisions).filter(d => d === 'merge').length} merged
                      </span>
                      <span>•</span>
                      <span>
                        {Object.values(importDecisions).filter(d => d === 'skip').length} skipped
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={resetImport}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleImportConfirmed}
                      disabled={importing || Object.values(importDecisions).filter(d => d !== 'skip').length === 0}
                      className={`flex items-center gap-2 ${
                        isRetro
                          ? 'bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      }`}
                    >
                      {importing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Sparkles className="w-4 h-4" />
                          </motion.div>
                          Importing...
                        </>
                      ) : (
                        <>
                          Import Contacts
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-400/50 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Import Complete */}
          {importComplete && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-12 rounded-2xl border backdrop-blur-xl text-center ${
                isRetro ? 'bg-black/60 border-cyan-400/30' : 'bg-white/5 border-white/10'
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mb-6"
              >
                <CheckCircle className="w-20 h-20 mx-auto text-green-400" />
              </motion.div>
              
              <h3 className="text-3xl font-bold text-white mb-4">Import Complete! 🎉</h3>
              <div className="text-white/60 mb-8 space-y-2">
                {importResults.success > 0 && (
                  <p className="text-lg">✅ {importResults.success} new contacts added</p>
                )}
                {importResults.merged > 0 && (
                  <p className="text-lg">🔀 {importResults.merged} contacts merged</p>
                )}
                {importResults.skipped > 0 && (
                  <p className="text-white/50">⏭️ {importResults.skipped} skipped</p>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => navigate(createPageUrl('Orbit'))}
                  className={`flex items-center gap-2 ${
                    isRetro
                      ? 'bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  }`}
                >
                  View Your Orbit
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  onClick={resetImport}
                  variant="outline"
                >
                  Import More
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNavigation currentPage="ImportContacts" />
    </div>
  );
}