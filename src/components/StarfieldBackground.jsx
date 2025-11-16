
import React, { useEffect, useRef } from 'react';

export default function StarfieldBackground({ theme = 'cosmic', opacity = 1, mouseX = 0.5, mouseY = 0.5 }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]); // Changed from starsRef to particlesRef for cosmic dust
  const flaresRef = useRef([]); // Added for ambient flares, replaces nebula concept
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  // Removed rotationRef as it's no longer used for particle movement

  // Smooth spotlight tracking
  const spotlightTargetRef = useRef({ x: 0.5, y: 0.5 });
  const spotlightCurrentRef = useRef({ x: 0.5, y: 0.5 });
  const spotlightVelocityRef = useRef({ x: 0, y: 0 });

  // Replaced themeConfig with themeConfigs as per outline
  const themeConfigs = {
    cosmic: {
      gradient: ['#06021b', '#120a35', '#1a0f4d'],
      dustColors: ['#ffffff', '#ffd6a5', '#a5d8ff', '#d4a5ff'],
      flareColor: '#a78bfa'
    },
    sunrise: {
      gradient: ['#1a0f0a', '#3d1f17', '#5d2f27'],
      dustColors: ['#ffffff', '#ffd6a5', '#ffb088', '#ff9966'],
      flareColor: '#ff6b6b'
    },
    retro: {
      gradient: ['#000000', '#0a0015', '#1a0033'],
      dustColors: ['#00ffff', '#ff00ff', '#9d00ff', '#ffffff'],
      flareColor: '#ff00ff',
      neonGlow: true
    },
    aurora: {
      gradient: ['#001a1a', '#003d3d', '#005555'],
      dustColors: ['#ffffff', '#a7f3d0', '#67e8f9', '#8b5cf6'],
      flareColor: '#34d399'
    },
    solar: {
      gradient: ['#1a0a00', '#3d1f0a', '#5d3f1a'],
      dustColors: ['#ffffff', '#fbbf24', '#f59e0b', '#ef4444'],
      flareColor: '#f59e0b'
    },
    ocean: {
      gradient: ['#001033', '#002855', '#004077'],
      dustColors: ['#ffffff', '#67e8f9', '#3b82f6', '#6366f1'],
      flareColor: '#4f46e5'
    }
  };

  // Update spotlight target when mouse moves
  useEffect(() => {
    spotlightTargetRef.current = { x: mouseX, y: mouseY };
  }, [mouseX, mouseY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    // Use the new themeConfigs
    const config = themeConfigs[theme] || themeConfigs.cosmic; // Default to cosmic if theme is not found

    // Helper for hex to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 255, g: 255, b: 255 }; // Default to white if parsing fails
    };

    const numParticles = 500; // As per outline

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(); // Call new particles initialization function
      initFlares(); // Initialize ambient flares
    };

    // Replaced initStars with initParticles
    const initParticles = () => {
      const { width, height } = canvas;
      particlesRef.current = Array.from({ length: numParticles }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 0.5,
        baseAlpha: Math.random() * 0.4 + 0.3,
        driftSpeedX: config.neonGlow ? Math.random() * 0.4 + 0.2 : (Math.random() - 0.5) * 0.15,
        driftSpeedY: (Math.random() - 0.5) * 0.15,
        phase: Math.random() * Math.PI * 2,
        shimmerSpeed: Math.random() * 0.0008 + 0.0004,
        color: config.dustColors[Math.floor(Math.random() * config.dustColors.length)],
      }));
    };

    // New init for ambient flares
    const initFlares = () => {
      flaresRef.current = [];
      for (let i = 0; i < 3; i++) { // A few large ambient flares
        flaresRef.current.push({
          x: Math.random(), // normalized position
          y: Math.random(),
          size: 0.2 + Math.random() * 0.4, // size relative to canvas
          speed: Math.random() * 0.0005 + 0.0001,
          phase: Math.random() * Math.PI * 2,
          driftX: (Math.random() - 0.5) * 0.05,
          driftY: (Math.random() - 0.5) * 0.05
        });
      }
    };

    const drawGradient = () => {
      // Adjusted for 3-color gradients if theme has it, else 2
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, config.gradient[0]);
      if (config.gradient.length > 2) {
        gradient.addColorStop(0.5, config.gradient[1]);
        gradient.addColorStop(1, config.gradient[2]);
      } else {
        gradient.addColorStop(1, config.gradient[1]);
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Removed drawRetroGrid and drawScanlines functions as they are not defined in the new theme config
    // and are implicitly removed by the outline's changes.

    // Removed drawDynamicNebulaLayer function as it's not defined in the new theme config
    // and is implicitly removed by the outline's changes.

    // New drawParticles function from the outline, adjusted for global opacity
    const drawParticles = (t, globalOpacity) => {
      const { width, height } = canvas;
      particlesRef.current.forEach((p) => {
        // Shimmer effect
        const shimmer = Math.sin(t * p.shimmerSpeed + p.phase) * 0.3 + 0.7;
        const alpha = p.baseAlpha * shimmer * globalOpacity; // Apply globalOpacity here

        // Horizontal drift for retro theme (VHS shimmer)
        p.x += p.driftSpeedX;
        p.y += Math.cos(t * 0.0004 + p.phase) * p.driftSpeedY * 0.5;

        // Wrap around screen
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Draw particle with enhanced glow for retro theme
        ctx.save();
        
        if (config.neonGlow) {
          ctx.shadowBlur = p.size * 8;
          ctx.shadowColor = p.color;
        } else {
          ctx.shadowBlur = p.size * 4;
          ctx.shadowColor = p.color;
        }
        
        const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        radGrad.addColorStop(0, p.color);
        radGrad.addColorStop(0.5, p.color + (config.neonGlow ? 'cc' : '80')); // 'cc' for 80% opacity, '80' for 50% opacity
        radGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = radGrad;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (config.neonGlow ? 2.5 : 2), 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
      ctx.globalAlpha = 1; // Reset global alpha after drawing particles
    };

    // Replaced drawLensFlare with a new drawFlares function for ambient glows, adjusted for global opacity
    const drawFlares = (t, globalOpacity) => {
      const { width, height } = canvas;
      const rgb = hexToRgb(config.flareColor);
      ctx.globalCompositeOperation = 'lighter'; // Blend mode for glowing effect

      flaresRef.current.forEach(flare => {
        const pulse = Math.sin(t * flare.speed + flare.phase) * 0.5 + 0.5; // Varies from 0.5 to 1.5
        const currentSize = (flare.size * (0.8 + pulse * 0.2)) * Math.max(width, height);
        const baseAlpha = 0.05 + pulse * 0.05; // Base alpha + pulse

        const centerX = width * (flare.x + Math.sin(t * 0.0002) * flare.driftX);
        const centerY = height * (flare.y + Math.cos(t * 0.0003) * flare.driftY);

        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, currentSize
        );
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseAlpha * 0.7 * globalOpacity})`);
        gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseAlpha * 0.3 * globalOpacity})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentSize, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over'; // Reset blend mode
    };

    const updateSmoothSpotlight = () => {
      const cfg = {
        acceleration: 0.002,
        friction: 0.92,
        minVelocity: 0.00001
      };

      // Calculate delta to target
      const deltaX = spotlightTargetRef.current.x - spotlightCurrentRef.current.x;
      const deltaY = spotlightTargetRef.current.y - spotlightCurrentRef.current.y;
      
      // Apply spring force
      spotlightVelocityRef.current.x += deltaX * cfg.acceleration;
      spotlightVelocityRef.current.y += deltaY * cfg.acceleration;

      // Apply friction for smooth trailing
      spotlightVelocityRef.current.x *= cfg.friction;
      spotlightVelocityRef.current.y *= cfg.friction;

      // Stop micro-movements
      if (Math.abs(spotlightVelocityRef.current.x) < cfg.minVelocity) {
        spotlightVelocityRef.current.x = 0;
      }
      if (Math.abs(spotlightVelocityRef.current.y) < cfg.minVelocity) {
        spotlightVelocityRef.current.y = 0;
      }

      // Update position
      spotlightCurrentRef.current.x += spotlightVelocityRef.current.x;
      spotlightCurrentRef.current.y += spotlightVelocityRef.current.y;
    };

    // Adjusted drawMouseSpotlight for global opacity
    const drawMouseSpotlight = (globalOpacity) => {
      const spotX = spotlightCurrentRef.current.x * canvas.width;
      const spotY = spotlightCurrentRef.current.y * canvas.height;
      const spotRadius = 300;
      
      ctx.globalCompositeOperation = 'screen';
      
      const spotlight = ctx.createRadialGradient(
        spotX, spotY, 0,
        spotX, spotY, spotRadius
      );
      
      // Use config.flareColor for spotlight
      const rgb = hexToRgb(config.flareColor);
      spotlight.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.15 * globalOpacity})`);
      spotlight.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.08 * globalOpacity})`);
      spotlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = spotlight;
      ctx.beginPath();
      ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalCompositeOperation = 'source-over';
    };

    const animate = (time) => {
      timeRef.current = time * 0.001;
      
      // Update smooth spotlight position
      updateSmoothSpotlight();
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawGradient();
      
      // Removed drawRetroGrid and drawScanlines calls

      // Draw ambient flares (replaces dynamic nebula layer)
      drawFlares(timeRef.current, opacity);

      // Draw particles (replaces stars)
      drawParticles(timeRef.current, opacity);

      // Draw smooth trailing mouse spotlight
      drawMouseSpotlight(opacity);

      // Reset globalAlpha to default for the next frame or other potential drawings
      ctx.globalAlpha = 1; 
      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme, opacity, mouseX, mouseY]); // mouseX, mouseY are in dependencies as spotlightTargetRef uses them. opacity is used in draw functions. theme determines config.

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full transition-opacity duration-1500"
      style={{ zIndex: 0 }}
    />
  );
}
