import React, { useState, useEffect } from 'react';

export default function CursorGlow({ color = 'rgba(196,154,108,0.06)', size = 400 }) {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    window.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
    };
  }, [visible]);

  return (
    <div
      style={{
        position: 'fixed',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0,
        transform: 'translate(-50%, -50%)',
        left: pos.x,
        top: pos.y,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
      aria-hidden="true"
    />
  );
}
