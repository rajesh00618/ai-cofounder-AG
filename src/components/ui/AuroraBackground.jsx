import React, { useRef, useEffect, useState } from 'react';

export default function AuroraBackground({ children, intensity = 0.5, colors, className = '' }) {
  const ref = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);

  const defaultColors = colors || [
    'rgba(196,154,108,0.08)',
    'rgba(125,184,125,0.06)',
    'rgba(123,168,196,0.05)',
    'rgba(160,120,80,0.06)',
  ];

  return (
    <div ref={ref} className={`aurora-bg ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        inset: '-50%',
        background: `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, ${defaultColors[0]} 0%, transparent 50%),
                     radial-gradient(ellipse at ${100 - mousePos.x}% ${100 - mousePos.y}%, ${defaultColors[1]} 0%, transparent 50%),
                     radial-gradient(ellipse at 50% 0%, ${defaultColors[2]} 0%, transparent 60%),
                     radial-gradient(ellipse at 0% 100%, ${defaultColors[3]} 0%, transparent 60%)`,
        backgroundSize: '200% 200%',
        animation: 'aurora 20s ease infinite',
        opacity: intensity,
        pointerEvents: 'none',
        transition: 'background 0.5s ease',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
