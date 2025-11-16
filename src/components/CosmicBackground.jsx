import React, { useRef, useEffect } from 'react';

export default function CosmicBackground({ theme = 'cosmic' }) {
  const canvasRef = useRef(null);
  const dustRef = useRef([]);
  const cometsRef = useRef([]);
  const starsRef = useRef([]);
  const pulsingStarsRef = useRef([]);
  const parallaxStarsRef = useRef([]); // Three layers of parallax stars
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5, currentX: 0.5, currentY: 0.5 }); // Track mouse with smoothing

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Helper to convert hex to rgba
    const hexToRgba = (hex, alpha) => {
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
      }
      return `rgba(${r},${g},${b},${alpha})`;
    };

    // Theme configurations
    const themeConfigs = {
      cosmic: {
        gradient: ['#04060e', '#0b1630'],
        starColors: ['#ffffff', '#a5d8ff', '#ffdca8'],
        nebula: '#8b5cf6',
        spotlightColor: 'rgba(139, 92, 246, 0.15)'
      },
      sunrise: {
        gradient: ['#1a0f0a', '#3d1f17'],
        starColors: ['#ffffff', '#ffb088', '#ffd6a5'],
        nebula: '#ff6b6b',
        spotlightColor: 'rgba(255, 107, 107, 0.15)'
      },
      retro: {
        gradient: ['#000000', '#0a0015', '#1a0033'],
        starColors: ['#00ffff', '#ff00ff', '#9d00ff', '#ffffff'],
        nebula: '#ff00ff',
        grid: true,
        scanlines: true,
        horizontalDrift: true,
        spotlightColor: 'rgba(255, 0, 255, 0.2)'
      },
      aurora: {
        gradient: ['#001a1a', '#003d3d'],
        starColors: ['#ffffff', '#a7f3d0', '#8b5cf6'],
        nebula: '#34d399',
        spotlightColor: 'rgba(52, 211, 153, 0.15)'
      },
      solar: {
        gradient: ['#1a0a00', '#3d1f0a'],
        starColors: ['#ffffff', '#fbbf24', '#ef4444'],
        nebula: '#f59e0b',
        spotlightColor: 'rgba(251, 191, 36, 0.15)'
      },
      ocean: {
        gradient: ['#001033', '#002855'],
        starColors: ['#ffffff', '#67e8f9', '#6366f1'],
        nebula: '#4f46e5',
        spotlightColor: 'rgba(79, 70, 229, 0.15)'
      }
    };

    const config = themeConfigs[theme] || themeConfigs.cosmic;

    const NUM_DUST = 250;
    const NUM_COMETS = 4;
    const NUM_STARS = 200;

    // Init dust particles
    dustRef.current = Array.from({ length: NUM_DUST }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 1.5 + 0.5,
      r: Math.random() * 1.2 + 0.3,
      o: Math.random() * 0.35 + 0.15,
      driftSpeed: config.horizontalDrift ? Math.random() * 0.3 + 0.1 : 0
    }));

    // Init three layers of parallax stars
    parallaxStarsRef.current = [
      // Layer 1 - Background (slowest, smallest, dimmest)
      Array.from({ length: 150 }).map(() => ({
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        x: 0,
        y: 0,
        size: Math.random() * 0.8 + 0.3,
        opacity: Math.random() * 0.2 + 0.1,
        color: config.starColors[Math.floor(Math.random() * config.starColors.length)],
        speed: 0.3, // Slowest parallax
        layer: 1
      })),
      // Layer 2 - Middle (medium speed and size)
      Array.from({ length: 100 }).map(() => ({
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        x: 0,
        y: 0,
        size: Math.random() * 1.2 + 0.5,
        opacity: Math.random() * 0.3 + 0.2,
        color: config.starColors[Math.floor(Math.random() * config.starColors.length)],
        speed: 0.6, // Medium parallax
        layer: 2
      })),
      // Layer 3 - Foreground (fastest, largest, brightest)
      Array.from({ length: 50 }).map(() => ({
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        x: 0,
        y: 0,
        size: Math.random() * 1.8 + 0.8,
        opacity: Math.random() * 0.4 + 0.3,
        color: config.starColors[Math.floor(Math.random() * config.starColors.length)],
        speed: 1.0, // Fastest parallax
        layer: 3
      }))
    ];

    // Init comets
    cometsRef.current = Array.from({ length: NUM_COMETS }).map(() => {
      const speed = Math.random() * 2 + 0.5;
      const angle = Math.random() * Math.PI * 2;
      const life = Math.random() * 600 + 200;
      const fadeInDuration = Math.random() * 100 + 30;
      const fadeOutDuration = Math.random() * 100 + 30;
      const trailLength = Math.random() * 180 + 40;
      const brightness = Math.random() * 0.3 + 0.2;
      const hazeIntensity = Math.random() * 15 + 10;
      
      const edge = Math.floor(Math.random() * 4);
      let startX, startY;
      
      if (edge === 0) {
        startX = Math.random() * width;
        startY = -50;
      } else if (edge === 1) {
        startX = width + 50;
        startY = Math.random() * height;
      } else if (edge === 2) {
        startX = Math.random() * width;
        startY = height + 50;
      } else {
        startX = -50;
        startY = Math.random() * height;
      }
      
      return {
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        speed: speed,
        life: life,
        maxLife: life,
        opacity: 0,
        fadeInDuration: fadeInDuration,
        fadeOutDuration: fadeOutDuration,
        trailLength: trailLength,
        thickness: Math.random() * 2 + 1.5,
        brightness: brightness,
        hazeIntensity: hazeIntensity
      };
    });

    // Init twinkling stars
    starsRef.current = Array.from({ length: NUM_STARS }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      baseRadius: Math.random() * 1.5 + 0.5,
      baseOpacity: Math.random() * 0.4 + 0.6,
      twinkleOffset: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.015 + 0.005,
      twinkleIntensity: Math.random() * 0.6 + 0.7,
      color: config.starColors[Math.floor(Math.random() * config.starColors.length)]
    }));

    // Init pulsing stars
    pulsingStarsRef.current = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      color: config.starColors[Math.floor(Math.random() * config.starColors.length)],
      pulseDelay: Math.random() * 10000,
      pulseDuration: 800 + Math.random() * 400,
      lastPulse: -10000,
      nextPulseIn: Math.random() * 5000 + 3000
    }));

    // Track mouse movement
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX / width;
      mouseRef.current.y = e.clientY / height;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Draw nebula
    const drawNebula = (t) => {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, config.gradient[0]);
      grad.addColorStop(1, config.gradient.length > 1 ? config.gradient[1] : config.gradient[0]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const x = width * 0.5 + Math.sin(t * 0.0001 + 1.3) * 280;
      const y = height * 0.5 + Math.cos(t * 0.00008 + 0.9) * 240;
      const rad = Math.max(width, height) * 0.6;

      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, config.spotlightColor);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    };

    // Draw parallax star layers
    const drawParallaxStars = () => {
      // Smooth mouse tracking with 0.02 damping
      const damping = 0.02;
      mouseRef.current.currentX += (mouseRef.current.x - mouseRef.current.currentX) * damping;
      mouseRef.current.currentY += (mouseRef.current.y - mouseRef.current.currentY) * damping;

      const offsetX = (mouseRef.current.currentX - 0.5) * 100;
      const offsetY = (mouseRef.current.currentY - 0.5) * 100;

      // Draw each layer
      parallaxStarsRef.current.forEach((layer) => {
        layer.forEach((star) => {
          // Calculate parallax offset based on layer speed
          star.x = star.baseX + offsetX * star.speed;
          star.y = star.baseY + offsetY * star.speed;

          // Wrap around screen edges
          if (star.x < -10) star.x += width + 20;
          if (star.x > width + 10) star.x -= width + 20;
          if (star.y < -10) star.y += height + 20;
          if (star.y > height + 10) star.y -= height + 20;

          // Draw star
          ctx.save();
          ctx.shadowBlur = star.size * 2;
          ctx.shadowColor = star.color;
          
          ctx.fillStyle = hexToRgba(star.color, star.opacity);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        });
      });
    };

    // Draw cosmic dust
    const drawDust = () => {
      dustRef.current.forEach((p) => {
        if (config.horizontalDrift) {
          p.x += p.driftSpeed;
          if (p.x > width + 10) p.x = -10;
        } else {
          p.x += 0.025 * p.z;
          if (p.x > width + 10) p.x = -10;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.o})`;
        ctx.fill();
      });
    };

    // Draw comets
    const drawComets = () => {
      cometsRef.current.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.life--;

        const lifeRemaining = c.life;
        const lifeElapsed = c.maxLife - c.life;
        
        if (lifeElapsed < c.fadeInDuration) {
          c.opacity = lifeElapsed / c.fadeInDuration;
        } else if (lifeRemaining < c.fadeOutDuration) {
          c.opacity = lifeRemaining / c.fadeOutDuration;
        } else {
          c.opacity = 1;
        }

        c.opacity = Math.max(0, Math.min(1, c.opacity));
        const finalOpacity = c.opacity * c.brightness;

        const trailX = c.x - (c.vx / c.speed) * c.trailLength;
        const trailY = c.y - (c.vy / c.speed) * c.trailLength;

        ctx.save();
        ctx.shadowBlur = c.hazeIntensity;
        ctx.shadowColor = `rgba(255,255,255,${finalOpacity * 0.7})`;

        const trailGrad = ctx.createLinearGradient(trailX, trailY, c.x, c.y);
        trailGrad.addColorStop(0, `rgba(255,255,255,0)`);
        trailGrad.addColorStop(0.5, `rgba(255,255,255,${0.5 * finalOpacity})`);
        trailGrad.addColorStop(1, `rgba(255,255,255,${finalOpacity})`);
        
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = c.thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        
        ctx.restore();

        if (c.life < 0 || c.x > width + 200 || c.y > height + 200 || c.x < -200 || c.y < -200) {
          const newSpeed = Math.random() * 2 + 0.5;
          const newAngle = Math.random() * Math.PI * 2;
          const newLife = Math.random() * 600 + 200;
          
          const edge = Math.floor(Math.random() * 4);
          let startX, startY;
          
          if (edge === 0) {
            startX = Math.random() * width;
            startY = -50;
          } else if (edge === 1) {
            startX = width + 50;
            startY = Math.random() * height;
          } else if (edge === 2) {
            startX = Math.random() * width;
            startY = height + 50;
          } else {
            startX = -50;
            startY = Math.random() * height;
          }
          
          c.x = startX;
          c.y = startY;
          c.speed = newSpeed;
          c.vx = Math.cos(newAngle) * newSpeed;
          c.vy = Math.sin(newAngle) * newSpeed;
          c.life = newLife;
          c.maxLife = newLife;
          c.opacity = 0;
          c.fadeInDuration = Math.random() * 100 + 30;
          c.fadeOutDuration = Math.random() * 100 + 30;
          c.trailLength = Math.random() * 180 + 40;
          c.thickness = Math.random() * 2 + 1.5;
          c.brightness = Math.random() * 0.3 + 0.2;
          c.hazeIntensity = Math.random() * 15 + 10;
        }
      });
    };

    // Draw twinkling stars
    const drawStars = (t) => {
      starsRef.current.forEach((s) => {
        const tw = (Math.sin(t * s.twinkleSpeed + s.twinkleOffset) + 1) / 2;
        const radius = s.baseRadius * (0.7 + 0.3 * tw);
        const opacity = s.baseOpacity * (0.6 + 0.4 * tw) * s.twinkleIntensity;
        
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(s.color, opacity);
        ctx.fill();
      });
    };

    // Draw pulsing stars
    const drawPulsingStars = (t) => {
      const currentTime = Date.now();
      
      pulsingStarsRef.current.forEach((star) => {
        const timeSinceLastPulse = currentTime - star.lastPulse;
        
        if (timeSinceLastPulse > star.nextPulseIn && timeSinceLastPulse > star.pulseDuration + 100) {
          star.lastPulse = currentTime;
          star.nextPulseIn = Math.random() * 5000 + 3000;
        }
        
        const pulseProgress = timeSinceLastPulse / star.pulseDuration;
        
        if (pulseProgress < 1) {
          const pulseIntensity = Math.sin(pulseProgress * Math.PI);
          const opacity = pulseIntensity * 0.8;
          const size = star.size * (1 + pulseIntensity * 0.5);
          const glowSize = size * 3;
          
          ctx.save();
          ctx.shadowBlur = glowSize * 2;
          ctx.shadowColor = star.color;
          
          const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
          gradient.addColorStop(0, star.color);
          gradient.addColorStop(0.4, star.color + 'aa');
          gradient.addColorStop(1, 'transparent');
          
          ctx.globalAlpha = opacity;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
      });
      
      ctx.globalAlpha = 1;
    };

    const drawRetroGrid = () => {
      if (!config.grid) return;
      
      ctx.save();
      
      const horizonY = height * 0.5;
      const gridSize = 50;
      
      for (let i = -10; i <= 10; i++) {
        const horizontalOpacity = (1 - Math.abs(i) / 15);
        
        let baseColor, shadowColor;
        if (i % 3 === 0) {
          baseColor = '0, 255, 255';
          shadowColor = '#00ffff';
        } else if (i % 3 === 1) {
          baseColor = '255, 0, 255';
          shadowColor = '#ff00ff';
        } else {
          baseColor = '157, 0, 255';
          shadowColor = '#9d00ff';
        }
        
        const gradient = ctx.createLinearGradient(
          width / 2 + i * gridSize * 0.8, horizonY,
          width / 2 + i * gridSize * 1.5, height
        );
        
        gradient.addColorStop(0, `rgba(${baseColor}, 0)`);
        gradient.addColorStop(0.3, `rgba(${baseColor}, ${horizontalOpacity * 0.15})`);
        gradient.addColorStop(0.6, `rgba(${baseColor}, ${horizontalOpacity * 0.3})`);
        gradient.addColorStop(1, `rgba(${baseColor}, ${horizontalOpacity * 0.4})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 6;
        ctx.shadowColor = shadowColor;
        
        ctx.beginPath();
        ctx.moveTo(width / 2 + i * gridSize * 0.8, horizonY);
        const endY = height;
        const endX = width / 2 + i * gridSize * 1.5;
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      
      ctx.shadowBlur = 0;
      ctx.restore();
    };

    const drawScanlines = () => {
      if (!config.scanlines) return;
      
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 1);
      }
      
      const glitchY = (timeRef.current * 50) % (canvas.height * 0.4) + canvas.height * 0.6;
      ctx.fillStyle = 'rgba(255, 0, 255, 0.08)';
      ctx.fillRect(0, glitchY, canvas.width, 2);
      
      ctx.restore();
    };

    // Main animation loop
    let animationFrameId;
    const animate = (t) => {
      timeRef.current += 1;
      ctx.clearRect(0, 0, width, height);
      drawNebula(t);
      drawRetroGrid();
      drawParallaxStars(); // Draw parallax layers first (background)
      drawDust();
      drawComets();
      drawStars(t);
      drawPulsingStars(t);
      drawScanlines();
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      dustRef.current.forEach(p => {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      });
      
      starsRef.current.forEach(s => {
        if (s.x > width) s.x = Math.random() * width;
        if (s.y > height) s.y = Math.random() * height;
      });

      pulsingStarsRef.current.forEach(s => {
        if (s.x > width) s.x = Math.random() * width;
        if (s.y > height) s.y = Math.random() * height;
      });

      parallaxStarsRef.current.forEach(layer => {
        layer.forEach(s => {
          if (s.baseX > width) s.baseX = Math.random() * width;
          if (s.baseY > height) s.baseY = Math.random() * height;
        });
      });
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
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