import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function ProgressBar({ currentStep = 1, totalSteps = 1 }) {
  const pct = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 100;

  return (
    <div style={styles.wrap}>
      <div style={styles.track}>
        <div style={{ ...styles.fill, width: `${pct}%` }} />
      </div>
      <div style={styles.label}>
        <span style={styles.stepText}>Step {currentStep} of {totalSteps}</span>
        <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0',
  },
  track: {
    flex: 1,
    height: '4px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: 'var(--gradient-primary)',
    borderRadius: '2px',
    transition: 'width 0.4s ease',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexShrink: 0,
  },
  stepText: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
};
