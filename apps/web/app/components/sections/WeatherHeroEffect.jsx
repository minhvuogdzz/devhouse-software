import React, { useEffect, useRef } from 'react';

/**
 * WeatherHeroEffect: High-performance canvas weather visual effects for Hero Banner.
 *
 * Supports conditions:
 * - 'rain': Realistic angled raindrops with splash dynamics.
 * - 'thunderstorm': Intense rain + procedural lightning bolts + screen flash.
 * - 'sunny': Gentle sun rays + floating ambient light motes.
 * - 'cloudy': Soft drifting mist and atmospheric cloud layers.
 *
 * Features:
 * - Pure HTML5 Canvas, zero external libraries.
 * - Respects prefers-reduced-motion and document visibility (auto-pauses when tab is hidden).
 * - High-DPI screen support (devicePixelRatio).
 * - Subtle, non-intrusive blending so hero typography remains 100% legible.
 */
export function WeatherHeroEffect({ condition = 'rain', className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let isVisible = true;

    // --- Particle and Entity State ---
    // Raindrops
    const rainCount = condition === 'thunderstorm' ? 140 : 80;
    const drops = [];
    const splashes = [];

    // Sun motes
    const moteCount = 35;
    const motes = [];

    // Clouds
    const cloudCount = 6;
    const clouds = [];

    // Lightning state
    let lightningBolt = null; // { segments: [{x1, y1, x2, y2}], alpha: 1 }
    let flashAlpha = 0;
    let nextLightningTime = Date.now() + 2000 + Math.random() * 4000;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initEntities();
    }

    function initEntities() {
      // Init drops
      drops.length = 0;
      for (let i = 0; i < rainCount; i++) {
        drops.push({
          x: Math.random() * (width + 100) - 50,
          y: Math.random() * height,
          speed: 12 + Math.random() * 8,
          length: 18 + Math.random() * 14,
          opacity: 0.15 + Math.random() * 0.25,
          thickness: 0.8 + Math.random() * 0.8,
        });
      }

      // Init motes (sunny)
      motes.length = 0;
      for (let i = 0; i < moteCount; i++) {
        motes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 1.5 + Math.random() * 2.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.2 - Math.random() * 0.3,
          alpha: 0.1 + Math.random() * 0.4,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          pulse: Math.random() * Math.PI,
        });
      }

      // Init clouds
      clouds.length = 0;
      for (let i = 0; i < cloudCount; i++) {
        clouds.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.7),
          radiusX: 120 + Math.random() * 180,
          radiusY: 40 + Math.random() * 60,
          speed: 0.15 + Math.random() * 0.2,
          opacity: 0.04 + Math.random() * 0.05,
        });
      }
    }

    function createLightning() {
      const segments = [];
      let startX = width * 0.2 + Math.random() * (width * 0.6);
      let startY = 0;
      const targetY = height * 0.85;

      let curX = startX;
      let curY = startY;

      while (curY < targetY) {
        const nextX = curX + (Math.random() - 0.5) * 45;
        const nextY = curY + 15 + Math.random() * 25;
        segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });

        // Branching chance
        if (Math.random() < 0.25 && segments.length < 25) {
          const branchX = nextX + (Math.random() - 0.5) * 50;
          const branchY = nextY + 15 + Math.random() * 30;
          segments.push({ x1: nextX, y1: nextY, x2: branchX, y2: branchY, isBranch: true });
        }

        curX = nextX;
        curY = nextY;
      }

      lightningBolt = { segments, alpha: 1.0 };
      flashAlpha = 0.28; // Screen flash
      nextLightningTime = Date.now() + 3500 + Math.random() * 5500;
    }

    function renderRain(isThunder) {
      const angle = 0.18; // Slight wind angle
      const sinAngle = Math.sin(angle);
      const cosAngle = Math.cos(angle);

      ctx.lineWidth = 1;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.x += d.speed * sinAngle;
        d.y += d.speed * cosAngle;

        // Reset if offscreen
        if (d.y > height || d.x > width + 50) {
          // Trigger splash at bottom with small probability
          if (splashes.length < 20 && Math.random() < 0.3) {
            splashes.push({
              x: d.x,
              y: Math.min(d.y, height - 5),
              r: 1,
              maxR: 4 + Math.random() * 6,
              alpha: 0.35,
            });
          }
          d.y = -d.length;
          d.x = Math.random() * (width + 100) - 50;
        }

        const headX = d.x;
        const headY = d.y;
        const tailX = d.x - d.length * sinAngle;
        const tailY = d.y - d.length * cosAngle;

        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        grad.addColorStop(0, 'rgba(186, 230, 253, 0)');
        grad.addColorStop(
          1,
          isThunder ? `rgba(191, 219, 254, ${d.opacity * 1.3})` : `rgba(147, 197, 253, ${d.opacity})`
        );

        ctx.strokeStyle = grad;
        ctx.lineWidth = d.thickness;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();
      }

      // Draw splashes
      for (let i = splashes.length - 1; i >= 0; i--) {
        const sp = splashes[i];
        sp.r += 0.4;
        sp.alpha -= 0.025;

        if (sp.alpha <= 0) {
          splashes.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(186, 230, 253, ${sp.alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y, sp.r * 1.4, sp.r * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function renderLightning() {
      const now = Date.now();
      if (now >= nextLightningTime && !lightningBolt) {
        createLightning();
      }

      // Screen ambient flash
      if (flashAlpha > 0.01) {
        ctx.fillStyle = `rgba(219, 234, 254, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);
        flashAlpha *= 0.82; // Fast decay
      }

      // Lightning Bolt
      if (lightningBolt) {
        ctx.save();
        ctx.shadowColor = 'rgba(147, 197, 253, 0.9)';
        ctx.shadowBlur = 15;

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = `rgba(255, 255, 255, ${lightningBolt.alpha})`;
        ctx.beginPath();

        for (const seg of lightningBolt.segments) {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        }
        ctx.stroke();

        // Glow inner line
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(191, 219, 254, ${lightningBolt.alpha * 0.8})`;
        ctx.stroke();

        ctx.restore();

        lightningBolt.alpha *= 0.72; // Quick flash fade
        if (lightningBolt.alpha < 0.05) {
          lightningBolt = null;
        }
      }
    }

    function renderSunny() {
      // 1. Warm Sun Rays from top-right corner
      const sunX = width * 0.85;
      const sunY = -20;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, Math.max(width, height) * 0.8);
      sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.16)');
      sunGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.06)');
      sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');

      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Floating golden motes
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        m.pulse += m.pulseSpeed;

        if (m.y < -10) m.y = height + 10;
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        const dynamicAlpha = m.alpha * (0.6 + 0.4 * Math.sin(m.pulse));
        ctx.fillStyle = `rgba(252, 211, 77, ${dynamicAlpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function renderCloudy() {
      // Soft drifting mist patches
      for (const c of clouds) {
        c.x += c.speed;
        if (c.x - c.radiusX > width) {
          c.x = -c.radiusX;
          c.y = Math.random() * (height * 0.7);
        }

        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radiusX);
        grad.addColorStop(0, `rgba(203, 213, 225, ${c.opacity})`);
        grad.addColorStop(0.6, `rgba(148, 163, 184, ${c.opacity * 0.4})`);
        grad.addColorStop(1, 'rgba(148, 163, 184, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.radiusX, c.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      if (condition === 'rain') {
        renderRain(false);
      } else if (condition === 'thunderstorm') {
        renderRain(true);
        renderLightning();
      } else if (condition === 'sunny') {
        renderSunny();
      } else if (condition === 'cloudy') {
        renderCloudy();
      }

      animationFrameId = requestAnimationFrame(frame);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animationFrameId = requestAnimationFrame(frame);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [condition]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
    />
  );
}
