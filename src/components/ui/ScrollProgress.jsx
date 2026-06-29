import React from 'react';
import { useScrollProgress } from './ScrollStory';

export default function ScrollProgress() {
  const progress = useScrollProgress();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 200,
        background: 'transparent',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: 'var(--gradient-primary)',
          transition: 'width 0.1s linear',
          boxShadow: '0 0 10px rgba(196,154,108,0.5)',
        }}
      />
    </div>
  );
}
