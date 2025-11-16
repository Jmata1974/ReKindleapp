import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AmbientSoundManager() {
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const gainNodeRef = useRef(null);
  const filterNodeRef = useRef(null);
  const masterGainRef = useRef(null);
  const isPlayingRef = useRef(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });

  const ambientEnabled = user?.ambient_sound_enabled || false;
  const ambientVolume = user?.ambient_sound_volume || 0.3;

  useEffect(() => {
    if (!ambientEnabled) {
      stopAmbient();
      return;
    }

    startAmbient();

    return () => {
      stopAmbient();
    };
  }, [ambientEnabled, ambientVolume]);

  // Handle page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isPlayingRef.current) {
          fadeOut();
        }
      } else {
        if (ambientEnabled && !isPlayingRef.current) {
          startAmbient();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [ambientEnabled]);

  const startAmbient = () => {
    if (isPlayingRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      const ctx = audioContextRef.current;

      // Create master gain
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.gain.value = 0;
      masterGainRef.current.connect(ctx.destination);

      // Create filter for modal effects
      filterNodeRef.current = ctx.createBiquadFilter();
      filterNodeRef.current.type = 'lowpass';
      filterNodeRef.current.frequency.value = 2000;
      filterNodeRef.current.connect(masterGainRef.current);

      // Create gain node for volume control
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.gain.value = 1;
      gainNodeRef.current.connect(filterNodeRef.current);

      // Create cosmic soundscape with multiple oscillators
      const frequencies = [
        { freq: 55, gain: 0.15, type: 'sine' },      // Deep bass hum
        { freq: 110, gain: 0.08, type: 'sine' },     // Octave harmonic
        { freq: 220, gain: 0.05, type: 'triangle' }, // Higher harmonic
        { freq: 165, gain: 0.04, type: 'sine' }      // Perfect fifth
      ];

      frequencies.forEach(({ freq, gain, type }) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        oscGain.gain.value = gain;
        
        osc.connect(oscGain);
        oscGain.connect(gainNodeRef.current);
        osc.start();
        
        oscillatorsRef.current.push({ osc, gain: oscGain });
      });

      // Fade in
      masterGainRef.current.gain.setValueAtTime(0, ctx.currentTime);
      masterGainRef.current.gain.linearRampToValueAtTime(
        ambientVolume,
        ctx.currentTime + 3
      );

      isPlayingRef.current = true;

      // Expose control methods globally
      window.ambientSound = {
        pulseForContact: () => pulseForContact(),
        deepenForModal: () => deepenForModal(),
        restoreFilter: () => restoreFilter()
      };

    } catch (error) {
      console.error('Audio context failed:', error);
    }
  };

  const stopAmbient = () => {
    if (!isPlayingRef.current) return;

    try {
      oscillatorsRef.current.forEach(({ osc }) => {
        osc.stop();
      });
      oscillatorsRef.current = [];

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      isPlayingRef.current = false;
      delete window.ambientSound;
    } catch (error) {
      console.error('Stop ambient failed:', error);
    }
  };

  const fadeOut = () => {
    if (!masterGainRef.current || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    masterGainRef.current.gain.setValueAtTime(
      masterGainRef.current.gain.value,
      ctx.currentTime
    );
    masterGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
  };

  const pulseForContact = () => {
    if (!gainNodeRef.current || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const currentGain = gainNodeRef.current.gain.value;
    
    gainNodeRef.current.gain.cancelScheduledValues(ctx.currentTime);
    gainNodeRef.current.gain.setValueAtTime(currentGain, ctx.currentTime);
    gainNodeRef.current.gain.linearRampToValueAtTime(currentGain * 1.3, ctx.currentTime + 0.1);
    gainNodeRef.current.gain.linearRampToValueAtTime(currentGain, ctx.currentTime + 0.4);
  };

  const deepenForModal = () => {
    if (!filterNodeRef.current || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    filterNodeRef.current.frequency.cancelScheduledValues(ctx.currentTime);
    filterNodeRef.current.frequency.setValueAtTime(2000, ctx.currentTime);
    filterNodeRef.current.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.5);
  };

  const restoreFilter = () => {
    if (!filterNodeRef.current || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    filterNodeRef.current.frequency.cancelScheduledValues(ctx.currentTime);
    filterNodeRef.current.frequency.setValueAtTime(
      filterNodeRef.current.frequency.value,
      ctx.currentTime
    );
    filterNodeRef.current.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.5);
  };

  // Update volume when changed
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current && isPlayingRef.current) {
      const ctx = audioContextRef.current;
      masterGainRef.current.gain.setValueAtTime(
        masterGainRef.current.gain.value,
        ctx.currentTime
      );
      masterGainRef.current.gain.linearRampToValueAtTime(
        ambientVolume,
        ctx.currentTime + 0.3
      );
    }
  }, [ambientVolume]);

  return null; // This component doesn't render anything
}