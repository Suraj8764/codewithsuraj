'use client';

import { useState, useEffect } from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const DEFAULT_FEATURES: Feature[] = [
  {
    icon: '🎯',
    title: 'Project-Based Learning',
    description: 'Build 5+ real-world projects per course. Deploy them to production environments with industry-standard tools.',
    color: '#6c63ff',
  },
  {
    icon: '🧑‍💻',
    title: 'Live Interactive Sessions',
    description: 'Join live coding sessions where you learn by doing. Ask questions, debug code, and get instant feedback.',
    color: '#00d4ff',
  },
  {
    icon: '💼',
    title: 'Placement Assistance',
    description: 'Resume reviews, mock interviews, LinkedIn optimization, and direct referrals to our hiring partners.',
    color: '#00c896',
  },
  {
    icon: '⏰',
    title: 'Flexible Timing',
    description: 'Weekend and weekday batches. Recordings available 24/7. Never miss a session even if you do.',
    color: '#ffb800',
  },
  {
    icon: '🏆',
    title: 'Industry Certificate',
    description: 'Earn a certificate upon completion that is recognized by 200+ hiring companies in our network.',
    color: '#ff6b6b',
  },
  {
    icon: '🤝',
    title: '1-on-1 Mentorship',
    description: 'Get dedicated mentor support for code reviews, career guidance, and technical doubts resolution.',
    color: '#8b85ff',
  },
];

export default function FeaturesSection() {
  const [features, setFeatures] = useState<Feature[]>(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/homepage')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings?.features && data.settings.features.length > 0) {
          setFeatures(data.settings.features);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">✨ Why Choose Us</span>
          <h2 className="section-title">
            Everything You Need to{' '}
            <span className="text-gradient">Succeed</span>
          </h2>
          <p className="section-desc">
            We go beyond tutorials. Our platform is designed to give you real career outcomes.
          </p>
        </div>

        <div className="grid-3">
          {features.map((feature, i) => (
            <div
              key={feature.title || i}
              className="animate-fade-up"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '2rem',
                transition: 'all 0.3s ease',
                animationDelay: `${i * 0.1}s`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = `${feature.color}44`;
                el.style.transform = 'translateY(-6px)';
                el.style.boxShadow = `0 12px 40px ${feature.color}15`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = 'var(--border-subtle)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                background: `${feature.color}18`,
                border: `1px solid ${feature.color}33`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1.25rem',
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.1rem',
                fontWeight: '700',
                marginBottom: '0.75rem',
                color: 'var(--text-primary)',
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
