import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, GripVertical, Maximize2, Minimize2, ChevronUp, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomNavigation({ currentPage, orbitSpacing, onOrbitSpacingChange, zoomLevel, onZoomChange }) {
  const [isVertical, setIsVertical] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });

  const theme = user?.theme || 'cosmic';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

  const themeAccents = {
    cosmic: '#8b5cf6',
    sunrise: '#ff6b6b',
    retro: '#ff00ff',
    aurora: '#34d399',
    solar: '#f59e0b',
    ocean: '#4f46e5'
  };

  const accentColor = themeAccents[theme];
  const isRetro = theme === 'retro';

  const handleZoomIn = () => {
    if (onZoomChange) {
      const newZoom = Math.min(2, zoomLevel + 0.1);
      onZoomChange(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (onZoomChange) {
      const newZoom = Math.max(0.5, zoomLevel - 0.1);
      onZoomChange(newZoom);
    }
  };

  // 📱 Mobile: Pull-out drawer from bottom
  if (isMobile) {
    return (
      <>
        {/* Pull Tab Handle */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto"
          initial={false}
        >
          {/* Pull Tab */}
          <motion.button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className={`w-full backdrop-blur-xl border-t shadow-2xl transition-all duration-300 ${
              isRetro 
                ? 'bg-black/90 border-cyan-400/30' 
                : 'bg-black/80 border-white/10'
            }`}
            style={isRetro ? { boxShadow: '0 -5px 40px rgba(0, 255, 255, 0.2)' } : {}}
          >
            <div className="flex flex-col items-center py-2 safe-area-bottom">
              <motion.div
                animate={{ rotate: mobileDrawerOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronUp className={`w-6 h-6 ${isRetro ? 'text-cyan-400' : 'text-white'}`} />
              </motion.div>
              <span className={`text-xs font-medium mt-1 ${isRetro ? 'text-cyan-300' : 'text-white/60'}`}>
                {mobileDrawerOpen ? 'Close' : 'Orbit Controls'}
              </span>
            </div>
          </motion.button>

          {/* Drawer Content */}
          <AnimatePresence>
            {mobileDrawerOpen && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className={`absolute bottom-full left-0 right-0 backdrop-blur-xl border-t shadow-2xl ${
                  isRetro 
                    ? 'bg-black/95 border-cyan-400/30' 
                    : 'bg-black/90 border-white/10'
                }`}
                style={isRetro ? { boxShadow: '0 -5px 40px rgba(0, 255, 255, 0.3)' } : {}}
              >
                {/* Orbit Controls */}
                {currentPage === 'Orbit' && onOrbitSpacingChange && (
                  <div className="p-6">
                    <h3 className={`text-sm font-semibold mb-4 ${isRetro ? 'text-cyan-300' : 'text-white/60'}`}>
                      ORBIT CONTROLS
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-white/80 text-sm">Spacing</label>
                          <span className={`text-sm font-semibold ${isRetro ? 'text-cyan-300' : 'text-white'}`}>
                            {orbitSpacing}
                          </span>
                        </div>
                        <Slider
                          value={[orbitSpacing]}
                          onValueChange={(value) => onOrbitSpacingChange(value[0])}
                          min={20}
                          max={60}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-white/80 text-sm">Zoom</label>
                          <span className={`text-sm font-semibold ${isRetro ? 'text-cyan-300' : 'text-white'}`}>
                            {Math.round(zoomLevel * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleZoomOut}
                            className={`p-2 rounded-lg transition-all ${
                              isRetro 
                                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300' 
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                          <Slider
                            value={[zoomLevel]}
                            onValueChange={(value) => onZoomChange(value[0])}
                            min={0.5}
                            max={2}
                            step={0.1}
                            className="flex-1"
                          />
                          <button
                            onClick={handleZoomIn}
                            className={`p-2 rounded-lg transition-all ${
                              isRetro 
                                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300' 
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </>
    );
  }

  // 🖥️ Desktop: Horizontal fixed bar at bottom (draggable) - Orbit controls only
  return (
    <motion.div
      className="fixed z-40 pointer-events-auto"
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: isVertical ? -window.innerWidth + 150 : -window.innerWidth/2 + 200,
        right: isVertical ? window.innerWidth - 150 : window.innerWidth/2 - 200,
        top: isVertical ? -window.innerHeight/2 + 200 : -window.innerHeight + 80,
        bottom: isVertical ? window.innerHeight/2 - 200 : window.innerHeight - 80
      }}
      style={{
        left: isVertical ? 'auto' : '50%',
        right: isVertical ? '24px' : 'auto',
        bottom: isVertical ? 'auto' : '24px',
        top: isVertical ? '50%' : 'auto',
        x: isVertical ? 0 : '-50%',
        y: isVertical ? '-50%' : 0,
        maxHeight: isVertical ? '80vh' : 'auto',
        cursor: 'grab'
      }}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <div 
        className={`backdrop-blur-xl border rounded-full shadow-2xl ${
          isRetro 
            ? 'bg-black/60 border-cyan-400/30' 
            : 'bg-black/40 border-white/10'
        } ${isVertical ? 'p-2' : 'px-6 py-2'}`}
        style={isRetro ? { boxShadow: '0 0 30px rgba(255, 0, 255, 0.3), 0 0 60px rgba(0, 255, 255, 0.2)' } : {}}
      >
        <div className={`flex items-center ${isVertical ? 'flex-col' : 'flex-row'} gap-3`}>
          {/* Drag Handle */}
          <div className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-grab">
            <GripVertical className={`w-4 h-4 ${isRetro ? 'text-cyan-400' : 'text-white/50'}`} />
          </div>

          {/* Orientation Toggle */}
          <button
            onClick={() => setIsVertical(!isVertical)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            {isVertical ? (
              <Maximize2 className={`w-4 h-4 ${isRetro ? 'text-pink-500' : 'text-white/50'}`} />
            ) : (
              <Minimize2 className={`w-4 h-4 ${isRetro ? 'text-pink-500' : 'text-white/50'}`} />
            )}
          </button>

          {currentPage === 'Orbit' && onOrbitSpacingChange && (
            <>
              <div className={`${isVertical ? 'w-6 h-px' : 'w-px h-6'} bg-white/10`} />
              <div className={`flex items-center ${isVertical ? 'flex-col' : 'flex-row'} gap-2`}>
                <span className="text-white/60 text-xs whitespace-nowrap">Spacing</span>
                <Slider
                  value={[orbitSpacing]}
                  onValueChange={(value) => onOrbitSpacingChange(value[0])}
                  min={20}
                  max={60}
                  step={1}
                  className={isVertical ? 'h-20 w-3' : 'w-20'}
                  orientation={isVertical ? 'vertical' : 'horizontal'}
                />
                <span className="text-white/60 text-xs w-6 text-center">{orbitSpacing}</span>
              </div>
            </>
          )}

          {currentPage === 'Orbit' && onZoomChange && (
            <>
              <div className={`${isVertical ? 'w-6 h-px' : 'w-px h-6'} bg-white/10`} />
              <div className={`flex items-center ${isVertical ? 'flex-col-reverse' : 'flex-row'} gap-1.5`}>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-all duration-300"
                >
                  <ZoomOut className="w-4 h-4 text-white/60 hover:text-white" />
                </button>
                <span className="text-white/60 text-xs w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-all duration-300"
                >
                  <ZoomIn className="w-4 h-4 text-white/60 hover:text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}