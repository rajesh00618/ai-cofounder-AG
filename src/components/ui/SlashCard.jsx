import React, { useRef, useState } from 'react';

export default function SlashCard({
  children,
  variant = '',
  clip = '',
  glow = false,
  tilt = false,
  className = '',
  style = {},
}) {
  const ref = useRef(null);
  const [tiltTransform, setTiltTransform] = useState('');

  const handleMouseMove = (e) => {
    if (!tilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltTransform(`rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`);
  };

  const handleMouseLeave = () => {
    if (!tilt) return;
    setTiltTransform('');
  };

  const classes = [
    'slash-card',
    variant && `slash-card-${variant}`,
    clip && `slash-clip-${clip}`,
    glow && 'slash-card-glow',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: tiltTransform,
        transition: 'transform 0.2s ease-out, box-shadow 0.4s ease, border-color 0.3s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
