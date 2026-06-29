import React, { useState, useEffect, useRef } from 'react';

export default function KineticText({ text, tag = 'h1', className = '', delay = 0, staggerDelay = 0.03, once = true }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const Tag = tag;
  const words = text.split(' ');

  return (
    <Tag ref={ref} className={`kinetic-text ${className}`} style={{ display: 'inline', perspective: '600px' }}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="kinetic-word" style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.3em' }}>
          {word.split('').map((char, ci) => (
            <span
              key={`${char}-${ci}`}
              className="kinetic-letter"
              style={{
                display: 'inline-block',
                animation: isVisible
                  ? `kineticLetter 0.5s ${delay + (wi * word.length + ci) * staggerDelay}s ease-out forwards`
                  : 'none',
                opacity: isVisible ? undefined : 0,
                transformOrigin: 'bottom center',
              }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
