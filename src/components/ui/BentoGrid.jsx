import React, { useRef, useEffect, useState } from 'react';

export function BentoGrid({ children, className = '', columns = 4, gap = '1rem', style = {} }) {
  return (
    <div
      className={`bento-grid stagger-children ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function BentoItem({ children, wide = false, tall = false, large = false, full = false, className = '', style = {}, delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const spanClass = [
    wide && 'bento-item-wide',
    tall && 'bento-item-tall',
    large && 'bento-item-large',
    full && 'bento-item-full',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={`bento-item ${spanClass} ${className}`}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
        transition: `all 0.6s ${delay}s cubic-bezier(0.4,0,0.2,1)`,
      }}
    >
      {children}
    </div>
  );
}
