import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CursorTrail() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef(null);
  const isOverCanvasRef = useRef(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });

  const theme = user?.theme || 'cosmic';

  // Theme color configurations
  const themeColors = {
    cosmic: { primary: '#8b5cf6', secondary: '#fbbf24' },
    sunrise: { primary: '#ff6b6b', secondary: '#ffa366' },
    retro: { primary: '#ff00ff', secondary: '#00ffff' },
    aurora: { primary: '#34d399', secondary: '#8b5cf6' },
    solar: { primary: '#f59e0b', secondary: '#ef4444' },
    ocean: { primary: '#4f46e5', secondary: '#67e8f9' }
  };

  const colors = themeColors[theme] || themeColors.cosmic;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) return; // Disable on mobile

    const handleMouseMove = (e) => {
      if (!isOverCanvasRef.current) return;

      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      const now = Date.now();
      if (now - lastTimeRef.current < 16) return; // Throttle to ~60fps
      lastTimeRef.current = now;

      // Create new particle
      particlesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        life: 1,
        size: Math.random() * 4 + 2,
        color: Math.random() > 0.5 ? colors.primary : colors.secondary,
        velocityX: (Math.random() - 0.5) * 0.5,
        velocityY: (Math.random() - 0.5) * 0.5
      });

      // Limit particles
      if (particlesRef.current.length > 50) {
        particlesRef.current.shift();
      }
    };

    const handleMouseEnter = () => {
      isOverCanvasRef.current = true;
    };

    const handleMouseLeave = () => {
      isOverCanvasRef.current = false;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.life -= 0.015; // Fade out over ~0.8s
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        if (particle.life <= 0) return false;

        // Draw particle with glow
        const opacity = particle.life;
        const size = particle.size * particle.life;

        ctx.save();
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 3
        );
        gradient.addColorStop(0, particle.color + Math.floor(opacity * 100).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.5, particle.color + Math.floor(opacity * 50).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, particle.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = particle.color + Math.floor(opacity * 200).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        return true;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    
    animationFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [colors, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}