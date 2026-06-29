import React, { useRef, useState } from 'react';

export default function MagneticButton({ children, className = '', style = {}, strength = 0.3, ...props }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTransform(`translate(${x * strength}px, ${y * strength}px)`);
  };

  const handleMouseLeave = () => setTransform('');

  return (
    <button
      ref={ref}
      className={`magnetic-btn ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, transform }}
      {...props}
    >
      {children}
    </button>
  );
}
