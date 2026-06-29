import React, { useRef, useState } from 'react';

export default function ThreeDCard({ children, className = '', style = {}, intensity = 10, glow = false }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTransform(
      `perspective(1200px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.02,1.02,1.02)`
    );
  };

  const handleMouseLeave = () => setTransform('');

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1200px', ...style }}
    >
      <div
        className={className}
        style={{
          transform,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out',
          willChange: 'transform',
          position: 'relative',
        }}
      >
        {children}
        {glow && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99,102,241,0.08), transparent 60%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        )}
      </div>
    </div>
  );
}
