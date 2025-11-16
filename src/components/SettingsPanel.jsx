import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Volume2, VolumeX, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function SettingsPanel({ isOpen, onClose }) {
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

  const handleThemeChange = (theme) => {
    updateUserMutation.mutate({ theme });
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-gradient-to-b from-indigo-950/95 to-purple-950/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto shadow-2xl"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Palette className="w-6 h-6 text-purple-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white">Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Audio Settings */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  {ambientSoundEnabled ? <Volume2 className="w-5 h-5 text-purple-400" /> : <VolumeX className="w-5 h-5 text-purple-400" />}
                  Ambient Sound
                </h3>
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
                <p className="text-white/60 text-sm mt-2">
                  Immersive cosmic soundscapes for your experience
                </p>
              </div>

              {/* Info */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/60 text-sm">
                  ✨ <span className="font-semibold text-white">Pro Tip:</span> Access themes from the Command Center menu to customize your entire app's visual style!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}