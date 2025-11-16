
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu, X, Settings, Home, Orbit, FileText, Bell, TrendingUp, User, Palette, ChevronRight, ChevronLeft, Upload, Trophy, Volume2, VolumeX, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Navigation({ currentPage, theme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const menuItems = [
    { name: 'Home', icon: Home, path: 'Home' },
    { name: 'Orbit', icon: Orbit, path: 'Orbit' },
    { name: 'Notes', icon: FileText, path: 'Notes' },
    { name: 'Reminders', icon: Bell, path: 'Reminders' },
    { name: 'Insights', icon: TrendingUp, path: 'Insights' },
    { name: 'Profile', icon: User, path: 'Profile' },
    { name: 'Achievements', icon: Trophy, path: 'Gamification' },
    { name: 'Import', icon: Upload, path: 'ImportContacts' }
  ];

  const themes = [
    { value: 'cosmic', name: 'Cosmic Purple', gradient: 'from-purple-600 via-indigo-600 to-blue-600', icon: '🌌' },
    { value: 'sunrise', name: 'Sunrise Orange', gradient: 'from-orange-500 via-red-500 to-pink-500', icon: '🌅' },
    { value: 'retro', name: 'Retro Neon', gradient: 'from-pink-600 via-purple-600 to-cyan-500', icon: '🎮' },
    { value: 'aurora', name: 'Aurora Green', gradient: 'from-green-400 via-emerald-500 to-teal-600', icon: '🌃' },
    { value: 'solar', name: 'Solar Gold', gradient: 'from-yellow-500 via-orange-500 to-red-500', icon: '☀️' },
    { value: 'ocean', name: 'Deep Ocean', gradient: 'from-blue-600 via-indigo-700 to-purple-700', icon: '🌊' }
  ];

  const currentTheme = user?.theme || 'cosmic';
  const ambientSoundEnabled = user?.ambient_sound_enabled !== false;

  const handleThemeChange = (themeValue) => {
    updateUserMutation.mutate({ theme: themeValue });
  };

  const toggleAmbientSound = () => {
    updateUserMutation.mutate({ ambient_sound_enabled: !ambientSoundEnabled });
    if (window.ambientSound) {
      if (ambientSoundEnabled) {
        window.ambientSound.stop();
      } else {
        window.ambientSound.start();
      }
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <>
      {/* ReKindle Title - Only show on subpages, not on Home - NOW CLICKABLE */}
      {currentPage !== 'Home' && !isMobile && (
        <Link to={createPageUrl('Home')} className="fixed top-6 left-10 z-50 focus:outline-none group">
          <motion.h1
            className={`font-extrabold text-5xl md:text-6xl tracking-tighter whitespace-nowrap leading-none
              text-transparent bg-clip-text flex items-center drop-shadow-[0_0_20px_rgba(255,180,255,0.35)]
              transition-all duration-300 group-hover:drop-shadow-[0_0_30px_rgba(255,180,255,0.6)]
              ${theme === 'retro'
                ? 'bg-gradient-to-r from-cyan-300 via-pink-400 to-purple-500'
                : 'bg-gradient-to-r from-pink-400 via-indigo-300 to-purple-400'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            whileHover={{ scale: 1.02 }}
          >
            Re
            <motion.span
              className={`relative inline-block text-transparent bg-clip-text ml-1
                ${theme === 'retro'
                  ? 'bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400'
                  : 'bg-gradient-to-r from-indigo-300 via-pink-400 to-indigo-300'}`}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                filter: ["hue-rotate(0deg)", "hue-rotate(35deg)", "hue-rotate(0deg)"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                backgroundSize: '200% 200%',
                textShadow: '0 0 15px rgba(255,160,255,0.45)',
              }}
            >
              K
              {/* ✨ Comet shimmer */}
              <motion.span
                className="absolute -top-5 -right-8 w-3 h-3 rounded-full bg-white"
                animate={{
                  x: [0, 100, 0],
                  y: [0, -40, 0],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              indle
            </motion.span>
          </motion.h1>

          <p
            className={`text-lg md:text-xl font-medium mt-2 ml-1 opacity-80 transition-opacity duration-300 group-hover:opacity-100 ${
              theme === 'retro' ? 'text-pink-300' : 'text-gray-300'
            }`}
          >
            Reconnect. Reflect. Rekindle.
          </p>
        </Link>
      )}

      {/* 📱 Mobile: Left-Edge Pull Handle */}
      {isMobile && (
        <motion.button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 p-3 rounded-r-xl backdrop-blur-xl border-r border-t border-b shadow-2xl ${
            theme === 'retro' 
              ? 'bg-black/80 border-cyan-400/50' 
              : 'bg-black/60 border-white/20'
          }`}
          style={theme === 'retro' ? { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' } : {}}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: menuOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight className={`w-6 h-6 ${theme === 'retro' ? 'text-cyan-400' : 'text-white'}`} />
          </motion.div>
        </motion.button>
      )}

      {/* 🖥️ Desktop: Menu Button - Below Title */}
      {!isMobile && currentPage !== 'Home' && (
        <button
          onClick={() => setMenuOpen(true)}
          className={`fixed top-32 left-12 z-50 p-3 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
            theme === 'retro' 
              ? 'bg-black/40 border-cyan-400/40 text-cyan-200 hover:bg-indigo-500/20' 
              : 'bg-black/40 border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/20'
          }`}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Settings/Cog Button - Now opens Command Center */}
      <button
        onClick={() => setMenuOpen(true)}
        className={`fixed top-6 right-20 z-50 p-3 rounded-full backdrop-blur-md border transition-all duration-300 ${
          theme === 'retro' 
            ? 'bg-black/60 border-pink-500/50 hover:border-cyan-400/70 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}
      >
        <Settings className={`w-6 h-6 ${theme === 'retro' ? 'text-pink-500' : 'text-white'}`} />
      </button>

      {/* Orbit Command Center Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed left-0 top-0 bottom-0 w-80 backdrop-blur-xl border-r border-white/10 z-50 overflow-y-auto ${
                theme === 'retro'
                  ? 'bg-gradient-to-b from-black/95 to-purple-950/95'
                  : 'bg-gradient-to-b from-indigo-950/95 to-purple-950/95'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className={`text-2xl font-bold ${theme === 'retro' ? 'text-cyan-300' : 'text-white'}`}>
                    Orbit Command Center
                  </h2>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className={`w-6 h-6 ${theme === 'retro' ? 'text-cyan-300' : 'text-white'}`} />
                  </button>
                </div>

                {/* Navigation Section */}
                <section className="mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-3 px-1">
                    Navigation
                  </h3>
                  <nav className="space-y-2">
                    {menuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={createPageUrl(item.path)}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                          currentPage === item.path
                            ? theme === 'retro'
                              ? 'bg-cyan-500/20 text-cyan-300 shadow-lg'
                              : 'bg-white/20 text-white shadow-lg'
                            : theme === 'retro'
                              ? 'text-pink-300/70 hover:bg-pink-500/10 hover:text-pink-300'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </nav>
                </section>

                {/* Appearance Section */}
                <section className="mt-8 pt-8 border-t border-white/10">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4 px-1">
                    Appearance
                  </h3>

                  {/* Themes */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 px-1">
                      <Palette className="w-4 h-4 text-purple-400" />
                      Themes
                    </h4>
                    <div className="space-y-3">
                      {themes.map((themeOption) => (
                        <motion.button
                          key={themeOption.value}
                          onClick={() => handleThemeChange(themeOption.value)}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full p-4 rounded-xl border-2 transition-all relative overflow-hidden ${
                            currentTheme === themeOption.value
                              ? 'border-white/40 shadow-2xl'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          {/* Gradient background */}
                          <div className={`absolute inset-0 bg-gradient-to-r ${themeOption.gradient} opacity-20`} />
                          
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{themeOption.icon}</span>
                              <div className="text-left">
                                <div className="text-white font-semibold">{themeOption.name}</div>
                              </div>
                            </div>
                            {currentTheme === themeOption.value && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                              >
                                <Check className="w-6 h-6 text-green-400" />
                              </motion.div>
                            )}
                          </div>

                          {/* Active indicator */}
                          {currentTheme === themeOption.value && (
                            <motion.div
                              layoutId="activeTheme"
                              className="absolute inset-0 rounded-xl"
                              style={{
                                boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
                              }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Ambient Sound */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 px-1">
                      {ambientSoundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-purple-400" />}
                      Ambient Sound
                    </h4>
                    <motion.button
                      onClick={toggleAmbientSound}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                        ambientSoundEnabled
                          ? 'bg-purple-500/20 border-purple-400/50'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {ambientSoundEnabled ? <Volume2 className="w-6 h-6 text-purple-400" /> : <VolumeX className="w-6 h-6 text-white/60" />}
                        <span className="text-white font-medium">
                          {ambientSoundEnabled ? 'Sound Enabled' : 'Sound Disabled'}
                        </span>
                      </div>
                      <div className={`w-12 h-6 rounded-full transition-all ${
                        ambientSoundEnabled ? 'bg-purple-500' : 'bg-white/20'
                      }`}>
                        <motion.div
                          className="w-6 h-6 bg-white rounded-full shadow-lg"
                          animate={{ x: ambientSoundEnabled ? 24 : 0 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        />
                      </div>
                    </motion.button>
                    <p className="text-white/60 text-sm mt-2 px-1">
                      Immersive cosmic soundscapes for your experience
                    </p>
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
