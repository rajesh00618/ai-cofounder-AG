import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ProgressiveDisclosure({ title, children, defaultOpen = false, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        className="disclosure-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
          {Icon && <Icon size={16} style={{ color: 'var(--color-accent-light)' }} />}
          {title}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--color-text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s ease',
          }}
        />
      </button>
      <div className={`disclosure-content ${isOpen ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  );
}
