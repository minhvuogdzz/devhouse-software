import React, { useEffect, useRef } from 'react';

/**
 * Decorative hero background: a slowly rotating dotted globe with glowing links between
 * cities, like data moving across a global network.
 *
 * - Pure canvas, no dependencies. Draws only in the browser (the server renders an empty canvas).
 * - Colours come from the theme tokens (--color-primary / --color-accent / --color-fg), so it
 *   follows light and dark mode and re-reads them whenever `data-theme` changes.
 * - Honors prefers-reduced-motion (one still frame) and pauses when off screen or hidden.
 * - Purely decorative: aria-hidden, ignores pointer events.
 */

const CITIES = [
  [21.03, 105.85], // Hà Nội
  [1.35, 103.82], // Singapore
  [35.68, 139.69], // Tokyo
  [-33.87, 151.21], // Sydney
  [25.2, 55.27], // Dubai
  [51.51, -0.13], // London
  [52.52, 13.4], // Berlin
  [40.71, -74.0], // New York
  [37.77, -122.42], // San Francisco
  [-23.55, -46.63], // São Paulo
  [-26.2, 28.05], // Johannesburg
  [19.08, 72.88], // Mumbai
];

// Pairs of CITIES indexes that are linked. Hà Nội (0) is the hub.
const LINKS = [
  [0, 1],
  [0, 2],
  [0, 4],
  [0, 5],
  [0, 7],
  [0, 8],
  [0, 3],
  [1, 3],
  [2, 8],
  [5, 7],
  [4, 10],
  [6, 11],
  [7, 9],
  [5, 6],
  [11, 0],
];

const DEG = Math.PI / 180;

function toVec(lat, lon) {
  const phi = lat * DEG;
  const lam = lon * DEG;
  return [Math.cos(phi) * Math.sin(lam), Math.sin(phi), Math.cos(phi) * Math.cos(lam)];
}

function slerp(a, b, t) {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  if (omega < 1e-5) return a;
  const s = Math.sin(omega);
  const k1 = Math.sin((1 - t) * omega) / s;
  const k2 = Math.sin(t * omega) / s;
  return [k1 * a[0] + k2 * b[0], k1 * a[1] + k2 * b[1], k1 * a[2] + k2 * b[2]];
}

function buildDots(count) {
  // Fibonacci sphere: even distribution of points.
  const dots = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    dots.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
  }
  return dots;
}

export function GlobeBackground({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cities = CITIES.map(([lat, lon]) => toVec(lat, lon));
    const arcs = LINKS.map(([a, b], i) => ({
      from: cities[a],
      to: cities[b],
      phase: (i * 0.137) % 1,
      speed: 0.07 + ((i * 7) % 5) * 0.012,
    }));

    let dots = [];
    let width = 0;
    let height = 0;
    let radius = 0;
    let cx = 0;
    let cy = 0;
    let dpr = 1;
    let rotation = 0.6; // initial longitude so Vietnam faces the viewer
    let tilt = 0.32;
    let colors = { primary: '#2563eb', accent: '#06b6d4', fg: '#888' };
    let raf = 0;
    let visible = true;
    let last = 0;

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      const pick = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
      colors = {
        primary: pick('--color-primary', colors.primary),
        accent: pick('--color-accent', colors.accent),
        fg: pick('--color-fg', colors.fg),
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius =
        width < 768 ? Math.min(width * 0.7, height * 0.55) : Math.min(width * 0.36, height * 0.78);
      cx = width / 2;
      cy = height * 0.55;
      dots = buildDots(width < 640 ? 700 : 1300);
    };

    // Rotate around Y (spin) then tilt around X; returns [x, y, z] with z > 0 facing the viewer.
    const project = v => {
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const x1 = v[0] * cosR + v[2] * sinR;
      const z1 = -v[0] * sinR + v[2] * cosR;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const y2 = v[1] * cosT - z1 * sinT;
      const z2 = v[1] * sinT + z1 * cosT;
      return [x1, y2, z2];
    };

    const toScreen = (p, lift = 1) => [cx + p[0] * radius * lift, cy - p[1] * radius * lift];

    const draw = time => {
      ctx.clearRect(0, 0, width, height);

      // Soft glow behind the globe
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.15);
      glow.addColorStop(0, colors.primary);
      glow.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Globe outline
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Dotted surface
      ctx.fillStyle = colors.fg;
      for (let i = 0; i < dots.length; i += 1) {
        const p = project(dots[i]);
        if (p[2] <= 0) continue; // far side
        const [sx, sy] = toScreen(p);
        ctx.globalAlpha = 0.14 + p[2] * 0.5;
        ctx.fillRect(sx - 0.9, sy - 0.9, 1.8, 1.8);
      }

      // Connection arcs, lifted above the surface
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      for (const arc of arcs) {
        const steps = 36;
        let started = false;
        ctx.beginPath();
        for (let s = 0; s <= steps; s += 1) {
          const t = s / steps;
          const v = slerp(arc.from, arc.to, t);
          const lift = 1 + Math.sin(t * Math.PI) * 0.22;
          const p = project(v);
          if (p[2] * lift < 0.02) {
            started = false;
            continue;
          }
          const [sx, sy] = toScreen(p, lift);
          if (!started) {
            ctx.moveTo(sx, sy);
            started = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.strokeStyle = colors.primary;
        ctx.globalAlpha = 0.5;
        ctx.stroke();

        // Pulse travelling along the link
        const t = (((time * 0.001 * arc.speed + arc.phase) % 1) + 1) % 1;
        const v = slerp(arc.from, arc.to, t);
        const lift = 1 + Math.sin(t * Math.PI) * 0.22;
        const p = project(v);
        if (p[2] * lift > 0.02) {
          const [sx, sy] = toScreen(p, lift);
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = colors.accent;
          ctx.beginPath();
          ctx.arc(sx, sy, 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.arc(sx, sy, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // City nodes
      for (let i = 0; i < cities.length; i += 1) {
        const p = project(cities[i]);
        if (p[2] <= 0.02) continue;
        const [sx, sy] = toScreen(p);
        const hub = i === 0;
        ctx.fillStyle = colors.primary;
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.arc(sx, sy, hub ? 3.6 : 2.4, 0, Math.PI * 2);
        ctx.fill();
        const pulse = reduceMotion ? 0.5 : (Math.sin(time * 0.002 + i) + 1) / 2;
        ctx.globalAlpha = 0.35 * (1 - pulse);
        ctx.beginPath();
        ctx.arc(sx, sy, (hub ? 7 : 5) + pulse * 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const frame = time => {
      if (!visible || document.hidden) {
        raf = 0;
        return;
      }
      const dt = last ? Math.min(time - last, 64) : 16;
      last = time;
      rotation += dt * 0.00009;
      draw(time);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (reduceMotion) {
        draw(0);
        return;
      }
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    readColors();
    resize();
    start();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(0);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);

    const onVisibility = () => {
      if (!document.hidden) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Re-read colours when the theme toggles
    const mo = new MutationObserver(() => {
      readColors();
      if (reduceMotion) draw(0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
