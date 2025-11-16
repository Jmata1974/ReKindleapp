import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  Heart, 
  Calendar, 
  Tag, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

export default function OrbitFilterPanel({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  contacts,
  theme = 'cosmic' 
}) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expanded, setExpanded] = useState({
    health: true,
    activity: true,
    tags: true,
    risk: true
  });

  const isRetro = theme === 'retro';

  // Get all unique tags from contacts
  const allTags = [...new Set(contacts.flatMap(c => c.tags || []))];
  
  // Count contacts by category
  const healthCounts = {
    excellent: contacts.filter(c => (c.health_score || 0) >= 80).length,
    good: contacts.filter(c => (c.health_score || 0) >= 60 && (c.health_score || 0) < 80).length,
    fair: contacts.filter(c => (c.health_score || 0) >= 40 && (c.health_score || 0) < 60).length,
    poor: contacts.filter(c => (c.health_score || 0) < 40).length
  };

  const activityCounts = {
    recent: contacts.filter(c => {
      if (!c.last_contacted) return false;
      const days = Math.floor((Date.now() - new Date(c.last_contacted)) / (1000 * 60 * 60 * 24));
      return days <= 7;
    }).length,
    moderate: contacts.filter(c => {
      if (!c.last_contacted) return false;
      const days = Math.floor((Date.now() - new Date(c.last_contacted)) / (1000 * 60 * 60 * 24));
      return days > 7 && days <= 30;
    }).length,
    dormant: contacts.filter(c => {
      if (!c.last_contacted) return true;
      const days = Math.floor((Date.now() - new Date(c.last_contacted)) / (1000 * 60 * 60 * 24));
      return days > 30;
    }).length
  };

  const riskCounts = {
    high: contacts.filter(c => c.ai_insights?.inactivity_risk?.risk_level === 'high').length,
    medium: contacts.filter(c => c.ai_insights?.inactivity_risk?.risk_level === 'medium').length,
    low: contacts.filter(c => c.ai_insights?.inactivity_risk?.risk_level === 'low').length
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      healthScore: [0, 100],
      lastContactedDays: [0, 365],
      tags: [],
      riskLevel: 'all',
      showAtRisk: false,
      showMilestones: false,
      groupByTags: false
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const toggleTag = (tag) => {
    setLocalFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const toggleExpanded = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-full max-w-sm z-50 shadow-2xl overflow-y-auto"
            style={{
              backgroundColor: isRetro ? 'rgba(0, 0, 0, 0.95)' : 'rgba(30, 27, 75, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRight: isRetro ? '2px solid rgba(255, 0, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Header */}
            <div className="p-6 border-b sticky top-0 z-10" 
              style={{ 
                borderColor: isRetro ? 'rgba(255, 0, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: isRetro ? 'rgba(0, 0, 0, 0.95)' : 'rgba(30, 27, 75, 0.95)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className={`w-6 h-6 ${isRetro ? 'text-pink-500' : 'text-purple-400'}`} />
                  <h2 className="text-2xl font-bold text-white">Orbit Filters</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <p className="text-white/60 text-sm">
                Showing {contacts.length} contacts
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Health Score Filter */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleExpanded('health')}
                  className="w-full flex items-center justify-between text-white"
                >
                  <div className="flex items-center gap-2">
                    <Heart className={`w-5 h-5 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                    <h3 className="font-semibold">Relationship Health</h3>
                  </div>
                  <motion.div
                    animate={{ rotate: expanded.health ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expanded.health && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-white/70">
                          <span>Health Score: {localFilters.healthScore[0]} - {localFilters.healthScore[1]}</span>
                        </div>
                        <Slider
                          value={localFilters.healthScore}
                          onValueChange={(value) => setLocalFilters(prev => ({ ...prev, healthScore: value }))}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'excellent', label: 'Excellent', color: 'bg-green-500/20 text-green-300', count: healthCounts.excellent },
                          { key: 'good', label: 'Good', color: 'bg-blue-500/20 text-blue-300', count: healthCounts.good },
                          { key: 'fair', label: 'Fair', color: 'bg-yellow-500/20 text-yellow-300', count: healthCounts.fair },
                          { key: 'poor', label: 'Poor', color: 'bg-red-500/20 text-red-300', count: healthCounts.poor }
                        ].map(({ key, label, color, count }) => (
                          <button
                            key={key}
                            onClick={() => {
                              const ranges = {
                                excellent: [80, 100],
                                good: [60, 79],
                                fair: [40, 59],
                                poor: [0, 39]
                              };
                              setLocalFilters(prev => ({ ...prev, healthScore: ranges[key] }));
                            }}
                            className={`p-2 rounded-lg border transition-all ${
                              localFilters.healthScore[0] >= (key === 'excellent' ? 80 : key === 'good' ? 60 : key === 'fair' ? 40 : 0) &&
                              localFilters.healthScore[1] <= (key === 'excellent' ? 100 : key === 'good' ? 79 : key === 'fair' ? 59 : 39)
                                ? color + ' border-current'
                                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="text-xs font-medium">{label}</div>
                            <div className="text-lg font-bold">{count}</div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Activity Filter */}
              <div className="space-y-3 border-t border-white/10 pt-6">
                <button
                  onClick={() => toggleExpanded('activity')}
                  className="w-full flex items-center justify-between text-white"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-5 h-5 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                    <h3 className="font-semibold">Last Contacted</h3>
                  </div>
                  <motion.div
                    animate={{ rotate: expanded.activity ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expanded.activity && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-white/70">
                          <span>Days ago: {localFilters.lastContactedDays[0]} - {localFilters.lastContactedDays[1]}</span>
                        </div>
                        <Slider
                          value={localFilters.lastContactedDays}
                          onValueChange={(value) => setLocalFilters(prev => ({ ...prev, lastContactedDays: value }))}
                          min={0}
                          max={365}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'recent', label: 'Recent', days: [0, 7], color: 'bg-green-500/20 text-green-300', count: activityCounts.recent },
                          { key: 'moderate', label: 'Moderate', days: [8, 30], color: 'bg-yellow-500/20 text-yellow-300', count: activityCounts.moderate },
                          { key: 'dormant', label: 'Dormant', days: [31, 365], color: 'bg-red-500/20 text-red-300', count: activityCounts.dormant }
                        ].map(({ key, label, days, color, count }) => (
                          <button
                            key={key}
                            onClick={() => setLocalFilters(prev => ({ ...prev, lastContactedDays: days }))}
                            className={`p-2 rounded-lg border transition-all ${
                              localFilters.lastContactedDays[0] === days[0] && localFilters.lastContactedDays[1] === days[1]
                                ? color + ' border-current'
                                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="text-xs font-medium">{label}</div>
                            <div className="text-lg font-bold">{count}</div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Risk Level Filter */}
              <div className="space-y-3 border-t border-white/10 pt-6">
                <button
                  onClick={() => toggleExpanded('risk')}
                  className="w-full flex items-center justify-between text-white"
                >
                  <div className="flex items-center gap-2">
                    <TrendingDown className={`w-5 h-5 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                    <h3 className="font-semibold">Risk Level</h3>
                  </div>
                  <motion.div
                    animate={{ rotate: expanded.risk ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expanded.risk && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { value: 'all', label: 'All Levels', icon: CheckCircle, count: contacts.length },
                          { value: 'high', label: 'High Risk', icon: AlertTriangle, color: 'bg-red-500/20 text-red-300', count: riskCounts.high },
                          { value: 'medium', label: 'Medium Risk', icon: Clock, color: 'bg-yellow-500/20 text-yellow-300', count: riskCounts.medium },
                          { value: 'low', label: 'Low Risk', icon: CheckCircle, color: 'bg-green-500/20 text-green-300', count: riskCounts.low }
                        ].map(({ value, label, icon: Icon, color, count }) => (
                          <button
                            key={value}
                            onClick={() => setLocalFilters(prev => ({ ...prev, riskLevel: value }))}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                              localFilters.riskLevel === value
                                ? color || 'bg-white/20 text-white border-white/30'
                                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{label}</span>
                            </div>
                            <Badge className="bg-white/20 text-white">{count}</Badge>
                          </button>
                        ))}
                      </div>

                      <div className="p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localFilters.showAtRisk}
                            onChange={(e) => setLocalFilters(prev => ({ ...prev, showAtRisk: e.target.checked }))}
                            className="w-4 h-4 rounded border-white/20"
                          />
                          <span className="text-sm text-red-300 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Highlight At-Risk Contacts
                          </span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tags Filter */}
              <div className="space-y-3 border-t border-white/10 pt-6">
                <button
                  onClick={() => toggleExpanded('tags')}
                  className="w-full flex items-center justify-between text-white"
                >
                  <div className="flex items-center gap-2">
                    <Tag className={`w-5 h-5 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                    <h3 className="font-semibold">Tags</h3>
                    {localFilters.tags.length > 0 && (
                      <Badge className={`${isRetro ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'}`}>
                        {localFilters.tags.length}
                      </Badge>
                    )}
                  </div>
                  <motion.div
                    animate={{ rotate: expanded.tags ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expanded.tags && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {allTags.length > 0 ? (
                        <>
                          <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => {
                              const count = contacts.filter(c => c.tags?.includes(tag)).length;
                              return (
                                <button
                                  key={tag}
                                  onClick={() => toggleTag(tag)}
                                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                                    localFilters.tags.includes(tag)
                                      ? isRetro
                                        ? 'bg-cyan-500/30 text-cyan-300 border-2 border-cyan-400/50'
                                        : 'bg-purple-500/30 text-purple-300 border-2 border-purple-400/50'
                                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                  }`}
                                >
                                  {tag}
                                  <Badge className="bg-white/20 text-white text-xs px-1.5">{count}</Badge>
                                </button>
                              );
                            })}
                          </div>

                          <div className="p-3 bg-purple-500/10 border border-purple-400/30 rounded-lg">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={localFilters.groupByTags}
                                onChange={(e) => setLocalFilters(prev => ({ ...prev, groupByTags: e.target.checked }))}
                                className="w-4 h-4 rounded border-white/20"
                              />
                              <span className="text-sm text-purple-300 font-medium flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Group Contacts by Tags
                              </span>
                            </label>
                          </div>
                        </>
                      ) : (
                        <p className="text-white/40 text-sm text-center py-4">
                          No tags yet. Add tags to contacts to use this filter.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Visual Indicators Toggle */}
              <div className="space-y-3 border-t border-white/10 pt-6">
                <div className="flex items-center gap-2 text-white mb-3">
                  <Sparkles className={`w-5 h-5 ${isRetro ? 'text-cyan-400' : 'text-purple-400'}`} />
                  <h3 className="font-semibold">Visual Enhancements</h3>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.showMilestones}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, showMilestones: e.target.checked }))}
                        className="w-4 h-4 rounded border-white/20"
                      />
                      <span className="text-sm text-green-300 font-medium flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        Show Milestone Indicators
                      </span>
                    </label>
                    <p className="text-xs text-white/50 ml-6 mt-1">
                      Birthdays, anniversaries, important events
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-white/10">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                >
                  Reset All
                </button>
                <button
                  onClick={handleApplyFilters}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    isRetro
                      ? 'bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  } text-white`}
                >
                  Apply Filters
                </button>
              </div>

              {/* Active Filters Summary */}
              {(localFilters.tags.length > 0 || localFilters.riskLevel !== 'all' || 
                localFilters.healthScore[0] !== 0 || localFilters.healthScore[1] !== 100 ||
                localFilters.lastContactedDays[0] !== 0 || localFilters.lastContactedDays[1] !== 365) && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white/60 text-xs mb-2">Active Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {localFilters.tags.length > 0 && (
                      <Badge className="bg-purple-500/20 text-purple-300">
                        {localFilters.tags.length} tags
                      </Badge>
                    )}
                    {localFilters.riskLevel !== 'all' && (
                      <Badge className={
                        localFilters.riskLevel === 'high' ? 'bg-red-500/20 text-red-300' :
                        localFilters.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }>
                        {localFilters.riskLevel} risk
                      </Badge>
                    )}
                    {(localFilters.healthScore[0] !== 0 || localFilters.healthScore[1] !== 100) && (
                      <Badge className="bg-blue-500/20 text-blue-300">
                        Health: {localFilters.healthScore[0]}-{localFilters.healthScore[1]}
                      </Badge>
                    )}
                    {(localFilters.lastContactedDays[0] !== 0 || localFilters.lastContactedDays[1] !== 365) && (
                      <Badge className="bg-orange-500/20 text-orange-300">
                        {localFilters.lastContactedDays[0]}-{localFilters.lastContactedDays[1]} days
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}