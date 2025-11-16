
import React, { useRef, useEffect } from 'react';

export default function CosmicDustBackground({ theme = 'cosmic' }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const flaresRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Theme-based configurations
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
      retro: { // Updated retro theme to Tron-inspired
        gradient: ['#000000', '#001a1a', '#002626'],
        dustColors: ['#00ffff', '#0080ff', '#ffffff', '#00ccff'],
        flareColor: '#00ffff'
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

    const config = themeConfigs[theme] || themeConfigs.cosmic;

    const numParticles = 500;

    // Initialize dust particles
    particlesRef.current = Array.from({ length: numParticles }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      baseAlpha: Math.random() * 0.4 + 0.3,
      driftSpeedX: (Math.random() - 0.5) * 0.15,
      driftSpeedY: (Math.random() - 0.5) * 0.15,
      phase: Math.random() * Math.PI * 2,
      shimmerSpeed: Math.random() * 0.0008 + 0.0004,
      color: config.dustColors[Math.floor(Math.random() * config.dustColors.length)],
    }));

    // Initialize lens flares
    flaresRef.current = Array.from({ length: 8 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      maxSize: Math.random() * 30 + 20,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.0015 + 0.0008,
      delay: Math.random() * 3000,
    }));

    // Draw background gradient
    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, config.gradient[0]);
      gradient.addColorStop(0.5, config.gradient[1]);
      gradient.addColorStop(1, config.gradient[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    // Draw cosmic dust particles
    const drawParticles = (t) => {
      particlesRef.current.forEach((p) => {
        // Shimmer effect
        const shimmer = Math.sin(t * p.shimmerSpeed + p.phase) * 0.3 + 0.7;
        const alpha = p.baseAlpha * shimmer;

        // Sinusoidal drift
        p.x += Math.sin(t * 0.0003 + p.phase) * p.driftSpeedX;
        p.y += Math.cos(t * 0.0004 + p.phase) * p.driftSpeedY;

        // Wrap around screen
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Draw particle with glow
        ctx.save();
        ctx.shadowBlur = p.size * 4;
        ctx.shadowColor = p.color;
        
        const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        radGrad.addColorStop(0, p.color);
        radGrad.addColorStop(0.5, p.color + '80');
        radGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = radGrad;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
      ctx.globalAlpha = 1;
    };

    // Draw lens flares (micro novas)
    const drawFlares = (t) => {
      flaresRef.current.forEach((flare) => {
        const cycle = Math.sin((t - flare.delay) * flare.speed) * 0.5 + 0.5;
        const intensity = Math.pow(cycle, 2);
        
        if (intensity > 0.05) {
          const size = flare.maxSize * intensity;
          const alpha = intensity * 0.6;

          ctx.save();
          ctx.globalAlpha = alpha;
          
          // Outer glow
          const outerGrad = ctx.createRadialGradient(flare.x, flare.y, 0, flare.x, flare.y, size * 2);
          outerGrad.addColorStop(0, config.flareColor + 'aa');
          outerGrad.addColorStop(0.3, config.flareColor + '60');
          outerGrad.addColorStop(1, 'transparent');
          
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.arc(flare.x, flare.y, size * 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Inner bright core
          const innerGrad = ctx.createRadialGradient(flare.x, flare.y, 0, flare.x, flare.y, size * 0.5);
          innerGrad.addColorStop(0, '#ffffff');
          innerGrad.addColorStop(0.5, config.flareColor);
          innerGrad.addColorStop(1, 'transparent');
          
          ctx.fillStyle = innerGrad;
          ctx.beginPath();
          ctx.arc(flare.x, flare.y, size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
      });
    };

    // Main animation loop
    const animate = (t) => {
      ctx.globalCompositeOperation = 'source-over';
      drawBackground();
      
      ctx.globalCompositeOperation = 'lighter';
      drawFlares(t);
      drawParticles(t);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      // Reposition particles within new bounds
      particlesRef.current.forEach(p => {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      });
      
      flaresRef.current.forEach(f => {
        if (f.x > width) f.x = Math.random() * width;
        if (f.y > height) f.y = Math.random() * height;
      });
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
