import React, { useState, useCallback } from 'react';

export default function RippleButton({ children, className = '', style = {}, onClick, ...props }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const newRipple = { x, y, size, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  }, [onClick]);

  return (
    <button
      className={`ripple-container ${className}`}
      onClick={handleClick}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
      {...props}
    >
      {children}
      {ripples.map(r => (
        <span
          key={r.id}
          style={{
            position: 'absolute',
            left: r.x - r.size / 2,
            top: r.y - r.size / 2,
            width: r.size,
            height: r.size,
            borderRadius: '50%',
            background: 'rgba(196,154,108,0.2)',
            animation: 'ripple 0.6s ease-out',
            pointerEvents: 'none',
          }}
        />
      ))}
    </button>
  );
}
