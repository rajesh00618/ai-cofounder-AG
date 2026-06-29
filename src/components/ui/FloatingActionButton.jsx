import React, { useState } from 'react';

export default function FloatingActionButton({ icon, label, onClick, extended = false, mini = false, style = {} }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={`fab ${extended ? 'fab-extended' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...style,
        width: mini ? '40px' : undefined,
        height: mini ? '40px' : undefined,
        animation: 'bounceIn 0.5s ease-out',
      }}
      aria-label={label}
      title={label}
    >
      {icon}
      {extended && isHovered && (
        <span style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
      )}
    </button>
  );
}
