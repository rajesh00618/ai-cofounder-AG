import React, { useRef, useEffect, useState } from 'react';

export function ScrollStorySection({ children, className = '', style = {}, animation = 'fadeInUp' }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animations = {
    fadeInUp: { opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(50px)' },
    fadeInLeft: { opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateX(0)' : 'translateX(-50px)' },
    fadeInRight: { opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateX(0)' : 'translateX(50px)' },
    fadeInScale: { opacity: isVisible ? 1 : 0, transform: isVisible ? 'scale(1)' : 'scale(0.9)' },
  };

  return (
    <div
      ref={ref}
      className={`scroll-story-section ${isVisible ? 'visible' : ''} ${className}`}
      style={{
        ...style,
        ...animations[animation],
        transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {children}
    </div>
  );
}

export function ParallaxSection({ children, speed = 0.3, className = '', style = {} }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.innerHeight - rect.top;
      setOffset(scrolled * speed);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ ...style, overflow: 'hidden' }}>
      <div style={{
        transform: `translate3d(0, ${offset}px, 0)`,
        willChange: 'transform',
      }}>
        {children}
      </div>
    </div>
  );
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}
