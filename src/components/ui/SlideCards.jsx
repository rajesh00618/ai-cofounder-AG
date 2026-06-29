import React, { useState, useRef, useEffect } from 'react';

export function SlideCard({ children, className = '', style = {} }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`slide-card ${className}`}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(40px)',
        transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {children}
    </div>
  );
}

export function SlideCardDeck({ children, autoPlay = false, interval = 5000 }) {
  const [active, setActive] = useState(0);
  const items = React.Children.toArray(children);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!autoPlay) return;
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [autoPlay, interval, items.length]);

  const goTo = (i) => {
    setActive(i);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
      <div style={{ position: 'relative', minHeight: '300px' }}>
        {items.map((child, i) => (
          <div
            key={i}
            style={{
              position: i === active ? 'relative' : 'absolute',
              inset: 0,
              opacity: i === active ? 1 : 0,
              transform: `translateX(${i === active ? 0 : i > active ? '100%' : '-100%'})`,
              transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {child}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '1rem' }}>
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === active ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === active ? 'var(--color-accent)' : 'rgba(255,248,235,0.15)',
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
