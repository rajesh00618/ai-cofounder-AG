import React, { useState, useEffect, useRef } from 'react';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  const sheetRef = useRef(null);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0) setCurrentY(diff);
  };

  const handleTouchEnd = () => {
    if (currentY > 100) {
      onClose();
    }
    setCurrentY(0);
    setIsDragging(false);
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
      <div
        ref={sheetRef}
        className={`bottom-sheet ${isOpen ? 'open' : ''}`}
        style={{
          transform: isOpen ? `translateY(${currentY}px)` : 'translateY(100%)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bottom-sheet-handle" />
        {title && (
          <div style={{
            padding: '0 1.5rem 1rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--color-bg-glass-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)',
                fontSize: '1.25rem',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </>
  );
}
