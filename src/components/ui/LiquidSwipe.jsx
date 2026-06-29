import React, { useState, useRef } from 'react';

export default function LiquidSwipe({ children, onSwipe }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState('');
  const startX = useRef(0);
  const isDragging = useRef(false);
  const items = React.Children.toArray(children);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchEnd = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0 && activeIndex < items.length - 1) {
        setDirection('left');
        setTimeout(() => {
          setActiveIndex(prev => prev + 1);
          setDirection('');
          onSwipe?.(activeIndex + 1);
        }, 400);
      } else if (diff > 0 && activeIndex > 0) {
        setDirection('right');
        setTimeout(() => {
          setActiveIndex(prev => prev - 1);
          setDirection('');
          onSwipe?.(activeIndex - 1);
        }, 400);
      }
    }
  };

  return (
    <div
      className="liquid-swipe"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', overflow: 'hidden', touchAction: 'pan-y' }}
    >
      {items.map((child, i) => (
        <div
          key={i}
          className={`liquid-swipe-item ${i === activeIndex ? '' : direction === 'left' && i === activeIndex - 1 ? 'swiping-left' : ''}`}
          style={{
            transform: i === activeIndex
              ? 'translateX(0)'
              : i < activeIndex
                ? 'translateX(-100%)'
                : 'translateX(100%)',
            opacity: i === activeIndex ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {child}
        </div>
      ))}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        padding: '1rem 0',
      }}>
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > activeIndex ? 'left' : 'right');
              setTimeout(() => {
                setActiveIndex(i);
                setDirection('');
              }, 200);
            }}
            style={{
              width: i === activeIndex ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === activeIndex ? 'var(--color-accent)' : 'rgba(255,248,235,0.15)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
