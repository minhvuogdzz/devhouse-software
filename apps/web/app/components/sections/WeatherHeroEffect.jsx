import React, { useEffect, useRef } from 'react';

/**
 * WeatherHeroEffect: Cinema-grade dynamic weather visualization engine for Hero Banner.
 *
 * Upgraded Features:
 * - High contrast in both LIGHT mode and DARK mode (detects document `data-theme`).
 * - Real volumetric multi-cluster rolling clouds with depth of field that actually veil the globe.
 * - Multi-stroke branched lightning bolts with realistic strobe flash and electric glow.
 * - Wind-angled rain streaks with distinct visibility against white surfaces.
 * - Golden amber god rays with luminous floating dust motes for sunny conditions.
 * - Storm mood ambient darkness overlay during thunderstorms.
 */
export function WeatherHeroEffect({ condition = 'cloudy', className = '', onTriggerLightning }) {
  const canvasRef = useRef(null);
  const triggerRef = useRef(null);

  // Expose trigger lightning externally if needed
  useEffect(() => {
    triggerRef.current = onTriggerLightning;
  }, [onTriggerLightning]);

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
    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Theme mutation observer
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // --- State Entities ---
    // Rain
    const rainCount = condition === 'thunderstorm' ? 160 : 90;
    const drops = [];
    const splashes = [];

    // Sun motes
    const moteCount = 45;
    const motes = [];

    // Rolling Clouds (clusters of circular puffs)
    const cloudClusters = [];
    const clusterCount = condition === 'cloudy' ? 7 : 4;

    // Lightning State
    let activeBolts = []; // array of { segments, alpha, flash }
    let flashIntensity = 0;
    let nextLightningTime = Date.now() + 1200 + Math.random() * 2500;

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
      // 1. Rain Drops
      drops.length = 0;
      for (let i = 0; i < rainCount; i++) {
        drops.push({
          x: Math.random() * (width + 120) - 60,
          y: Math.random() * height,
          speed: (condition === 'thunderstorm' ? 16 : 12) + Math.random() * 8,
          length: (condition === 'thunderstorm' ? 24 : 18) + Math.random() * 16,
          thickness: isDark ? 0.8 + Math.random() * 0.9 : 1.1 + Math.random() * 0.9,
          opacity: isDark ? 0.25 + Math.random() * 0.45 : 0.35 + Math.random() * 0.5,
        });
      }

      // 2. Sun Motes
      motes.length = 0;
      for (let i = 0; i < moteCount; i++) {
        motes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 1.8 + Math.random() * 3.2,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.25 - Math.random() * 0.4,
          alpha: 0.2 + Math.random() * 0.5,
          pulseSpeed: 0.02 + Math.random() * 0.04,
          pulse: Math.random() * Math.PI * 2,
        });
      }

      // 3. Volumetric Cloud Clusters
      cloudClusters.length = 0;
      for (let i = 0; i < clusterCount; i++) {
        const puffs = [];
        const puffCount = 7 + Math.floor(Math.random() * 6);
        const baseRadius = 80 + Math.random() * 90;

        for (let j = 0; j < puffCount; j++) {
          puffs.push({
            offsetX: (Math.random() - 0.5) * (baseRadius * 1.8),
            offsetY: (Math.random() - 0.5) * (baseRadius * 0.7),
            radius: baseRadius * (0.6 + Math.random() * 0.6),
            alphaRatio: 0.7 + Math.random() * 0.3,
          });
        }

        cloudClusters.push({
          x: Math.random() * (width + 200) - 100,
          y: (i % 2 === 0 ? 0.15 : 0.45) * height + (Math.random() - 0.5) * 80,
          speed: 0.25 + Math.random() * 0.35,
          puffs,
          baseRadius,
          opacity: isDark ? 0.2 + Math.random() * 0.2 : 0.3 + Math.random() * 0.25,
        });
      }
    }

    // Build procedural lightning with fractal branching
    function strikeLightning(startX = null) {
      const rootX = startX ?? width * 0.15 + Math.random() * (width * 0.7);
      const rootY = 0;
      const targetY = height * 0.9;
      const segments = [];

      function generateBranch(x1, y1, x2, y2, depth = 0) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);

        if (dist < 18 || depth > 5) {
          segments.push({ x1, y1, x2, y2, depth });
          return;
        }

        const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * (dist * 0.45);
        const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * (dist * 0.18);

        generateBranch(x1, y1, midX, midY, depth);
        generateBranch(midX, midY, x2, y2, depth);

        // Branch off chance
        if (Math.random() < 0.42 && depth < 3) {
          const branchTargetX = midX + (Math.random() - 0.5) * 120;
          const branchTargetY = midY + 40 + Math.random() * 80;
          generateBranch(midX, midY, branchTargetX, branchTargetY, depth + 1);
        }
      }

      generateBranch(rootX, rootY, rootX + (Math.random() - 0.5) * 100, targetY, 0);

      activeBolts.push({
        segments,
        alpha: 1.0,
        strobeTicks: 0,
      });

      flashIntensity = 0.55; // Screen flash
      nextLightningTime = Date.now() + 1800 + Math.random() * 3000;
    }

    // --- Renderers ---

    function renderRain() {
      const isThunder = condition === 'thunderstorm';
      const angle = isThunder ? 0.24 : 0.16; // More wind tilt in storm
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.x += d.speed * sinA;
        d.y += d.speed * cosA;

        if (d.y > height || d.x > width + 80) {
          if (splashes.length < 25 && Math.random() < 0.35) {
            splashes.push({
              x: d.x,
              y: Math.min(d.y, height - 8),
              r: 1,
              alpha: isDark ? 0.45 : 0.55,
            });
          }
          d.y = -d.length;
          d.x = Math.random() * (width + 120) - 60;
        }

        const headX = d.x;
        const headY = d.y;
        const tailX = d.x - d.length * sinA;
        const tailY = d.y - d.length * cosA;

        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);

        if (isDark) {
          grad.addColorStop(0, 'rgba(186, 230, 253, 0)');
          grad.addColorStop(
            1,
            isThunder
              ? `rgba(219, 234, 254, ${d.opacity * 1.2})`
              : `rgba(147, 197, 253, ${d.opacity})`,
          );
        } else {
          // Light mode: High-contrast rich blue raindrops
          grad.addColorStop(0, 'rgba(30, 64, 175, 0)');
          grad.addColorStop(
            1,
            isThunder ? `rgba(29, 78, 216, ${d.opacity * 1.3})` : `rgba(37, 99, 235, ${d.opacity})`,
          );
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = d.thickness;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();
      }

      // Splashes
      for (let i = splashes.length - 1; i >= 0; i--) {
        const sp = splashes[i];
        sp.r += 0.55;
        sp.alpha -= 0.035;

        if (sp.alpha <= 0) {
          splashes.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = isDark
          ? `rgba(186, 230, 253, ${sp.alpha})`
          : `rgba(37, 99, 235, ${sp.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y, sp.r * 1.6, sp.r * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function renderLightning() {
      const now = Date.now();
      if (now >= nextLightningTime && activeBolts.length === 0) {
        strikeLightning();
      }

      // Storm atmospheric gloom overlay
      const gloomAlpha = isDark ? 0.35 : 0.22;
      ctx.fillStyle = isDark
        ? `rgba(15, 23, 42, ${gloomAlpha})`
        : `rgba(30, 41, 59, ${gloomAlpha})`;
      ctx.fillRect(0, 0, width, height);

      // Ambient Flash
      if (flashIntensity > 0.01) {
        ctx.fillStyle = isDark
          ? `rgba(219, 234, 254, ${flashIntensity * 0.85})`
          : `rgba(241, 245, 249, ${flashIntensity * 0.95})`;
        ctx.fillRect(0, 0, width, height);
        flashIntensity *= 0.74; // Quick strobe decay
      }

      // Draw Bolts
      for (let i = activeBolts.length - 1; i >= 0; i--) {
        const bolt = activeBolts[i];
        bolt.strobeTicks++;

        // Strobe flicker simulation (double-blink)
        let renderAlpha = bolt.alpha;
        if (bolt.strobeTicks === 2) renderAlpha *= 0.3;
        if (bolt.strobeTicks === 3) renderAlpha *= 1.2;

        ctx.save();
        // Layer 1: Huge electric outer glow
        ctx.shadowColor = isDark ? 'rgba(96, 165, 250, 0.95)' : 'rgba(37, 99, 235, 0.85)';
        ctx.shadowBlur = 24;
        ctx.strokeStyle = `rgba(147, 197, 253, ${Math.min(renderAlpha, 1.0)})`;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        for (const seg of bolt.segments) {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        }
        ctx.stroke();

        // Layer 2: Ultra-bright sharp core
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffffff';
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(renderAlpha * 1.2, 1.0)})`;
        ctx.lineWidth = 2.0;
        ctx.stroke();

        ctx.restore();

        bolt.alpha *= 0.72;
        if (bolt.alpha < 0.04) {
          activeBolts.splice(i, 1);
        }
      }
    }

    function renderClouds() {
      // Draw clusters of billowing clouds that drift across the globe
      for (const cluster of cloudClusters) {
        cluster.x += cluster.speed;
        if (cluster.x - cluster.baseRadius * 2 > width) {
          cluster.x = -cluster.baseRadius * 2.5;
          cluster.y = (cluster.y > height * 0.4 ? 0.2 : 0.5) * height;
        }

        ctx.save();
        for (const puff of cluster.puffs) {
          const px = cluster.x + puff.offsetX;
          const py = cluster.y + puff.offsetY;
          const rad = puff.radius;

          const grad = ctx.createRadialGradient(px, py, rad * 0.1, px, py, rad);

          if (isDark) {
            // Dark mode: Ethereal midnight misty clouds
            grad.addColorStop(0, `rgba(51, 65, 85, ${cluster.opacity * puff.alphaRatio * 1.2})`);
            grad.addColorStop(0.55, `rgba(30, 41, 59, ${cluster.opacity * puff.alphaRatio * 0.7})`);
            grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          } else {
            // Light mode: High-definition sculpted white/slate cloud puff
            grad.addColorStop(0, `rgba(255, 255, 255, ${cluster.opacity * puff.alphaRatio * 1.6})`);
            grad.addColorStop(
              0.45,
              `rgba(241, 245, 249, ${cluster.opacity * puff.alphaRatio * 1.1})`,
            );
            grad.addColorStop(
              0.75,
              `rgba(203, 213, 225, ${cluster.opacity * puff.alphaRatio * 0.55})`,
            );
            grad.addColorStop(1, 'rgba(226, 232, 240, 0)');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, rad, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    function renderSunny() {
      // 1. Radiant Amber God Rays from Top-Right
      const sunX = width * 0.88;
      const sunY = -25;
      const rayRadius = Math.max(width, height) * 0.85;

      const sunGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, rayRadius);
      if (isDark) {
        sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
        sunGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.08)');
        sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      } else {
        // Light mode: Warm sun flare
        sunGrad.addColorStop(0, 'rgba(245, 158, 11, 0.28)');
        sunGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.12)');
        sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      }

      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Floating Golden Motes
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        m.pulse += m.pulseSpeed;

        if (m.y < -15) m.y = height + 15;
        if (m.x < -15) m.x = width + 15;
        if (m.x > width + 15) m.x = -15;

        const dynamicAlpha = m.alpha * (0.65 + 0.35 * Math.sin(m.pulse));
        ctx.fillStyle = isDark
          ? `rgba(253, 224, 71, ${dynamicAlpha})`
          : `rgba(217, 119, 6, ${dynamicAlpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      if (condition === 'rain') {
        renderRain();
      } else if (condition === 'thunderstorm') {
        renderRain();
        renderLightning();
      } else if (condition === 'cloudy') {
        renderClouds();
      } else if (condition === 'sunny') {
        renderSunny();
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
      themeObserver.disconnect();
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
