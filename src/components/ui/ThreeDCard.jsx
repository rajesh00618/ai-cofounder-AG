import React, { useRef, useState } from 'react';

export default function ThreeDCard({ children, className = '', style = {}, intensity = 10 }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState('rotateY(0deg) rotateX(0deg)');

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg)`);
  };

  const handleMouseLeave = () => setTransform('rotateY(0deg) rotateX(0deg)');

  return (
    <div
      ref={ref}
      className={`card-3d ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1000px', ...style }}
    >
      <div
        className="card-3d-inner"
        style={{
          transform,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out',
          height: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
