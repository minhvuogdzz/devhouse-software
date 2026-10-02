import React, { useEffect, useRef } from 'react';
import './mousetrail.css'; // Đảm bảo bạn đã tạo file CSS
import anime from 'animejs/lib/anime.es.js';

const MouseTrail = () => {
  const containerRef = useRef(null);
  const rainbowColors = ['#f1c40f'];
  let colorIndex = 0;
  let lastX = null;
  let lastY = null;
  let lastTrailTime = 0;
  const TRAIL_DELAY = 10; // ms

  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTrailTime < TRAIL_DELAY) return;
      lastTrailTime = now;

      const currentX = e.clientX;
      const currentY = e.clientY;

      let angle = 0;
      if (lastX !== null && lastY !== null) {
        const dx = currentX - lastX;
        const dy = currentY - lastY;
        angle = Math.atan2(dy, dx) * (180 / Math.PI);
      }

      lastX = currentX;
      lastY = currentY;

      const dot = document.createElement('div');
      dot.className = 'trail';

      const color = rainbowColors[colorIndex % rainbowColors.length];
      colorIndex++;

      const starSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${color}">
          <path d="M12 2l2.9 6.6L22 9.2l-5 4.9 1.2 6.9L12 17.8l-6.2 3.2L7 14.1 2 9.2l7.1-1L12 2z"/>
        </svg>`;
      const encodedStar = `data:image/svg+xml;base64,${btoa(starSvg)}`;
      dot.style.backgroundImage = `url("${encodedStar}")`;

      dot.style.left = `${currentX - 10}px`;
      dot.style.top = `${currentY - 10}px`;
      dot.style.transform = `rotate(${angle}deg)`;

      containerRef.current.appendChild(dot);

      anime({
        targets: dot,
        scale: [{ value: 1.4, duration: 0 }, { value: 0.6, duration: 500 }],
        opacity: [{ value: 1, duration: 0 }, { value: 0, duration: 700 }],
        easing: 'easeOutQuad',
        duration: 700,
        complete: () => dot.remove()
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <div ref={containerRef} className="mouse-trail-container"></div>;
};

export default MouseTrail;
