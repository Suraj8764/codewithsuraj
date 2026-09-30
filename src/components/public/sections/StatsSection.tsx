'use client';

import { useState, useEffect } from 'react';

interface Stat {
  value: string;
  label: string;
  icon: string;
  color: string;
}

const DEFAULT_STATS: Stat[] = [
  { value: '500+', label: 'Students Trained', icon: '👨‍💻', color: '#6c63ff' },
  { value: '15+', label: 'Expert Courses', icon: '📚', color: '#00d4ff' },
  { value: '95%', label: 'Placement Rate', icon: '🎯', color: '#00c896' },
  { value: '4.9/5', label: 'Student Rating', icon: '⭐', color: '#ffb800' },
  { value: '50+', label: 'Live Projects', icon: '🚀', color: '#ff6b6b' },
  { value: '8+', label: 'Years Experience', icon: '🏆', color: '#8b85ff' },
];

export default function StatsSection() {
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/homepage')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings?.stats && data.settings.stats.length > 0) {
          setStats(data.settings.stats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{
      padding: '5rem 0',
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient blur bg */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px', height: '200px',
        background: 'radial-gradient(ellipse, rgba(108,99,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '1.5rem',
          position: 'relative',
        }}>
          {stats.map((stat, i) => (
            <div
              key={stat.label || i}
              className="animate-fade-up"
              style={{
                textAlign: 'center',
                padding: '1.5rem 1rem',
                background: 'rgba(26,26,38,0.5)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                animationDelay: `${i * 0.1}s`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${stat.color}33`;
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 30px ${stat.color}22`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.75rem',
                fontWeight: '800',
                color: stat.color,
                marginBottom: '0.25rem',
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
