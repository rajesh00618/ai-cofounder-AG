import React from 'react';

export function SkeletonText({ lines = 3, width }) {
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{
            width: i === lines - 1 ? '60%' : (width || '100%'),
            marginBottom: '0.5em',
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = 48 }) {
  return <div className="skeleton skeleton-circle" style={{ width: size, height: size }} />;
}

export function SkeletonCard({ height = 200 }) {
  return <div className="skeleton skeleton-card" style={{ height }} />;
}

export function SkeletonBento({ count = 6 }) {
  return (
    <div className="bento-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-bento"
          style={{
            gridColumn: i === 0 || i === 3 ? 'span 2' : 'span 1',
            gridRow: i === 0 ? 'span 2' : 'span 1',
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div className="skeleton" style={{ width: '250px', height: '28px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '180px', height: '16px' }} />
        </div>
        <div className="skeleton" style={{ width: '80px', height: '28px', borderRadius: '9999px' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '2rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '14px' }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: '140px', borderRadius: '16px' }} />
          <div className="skeleton" style={{ height: '100px', borderRadius: '16px' }} />
        </div>
      </div>
    </div>
  );
}
