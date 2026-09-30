'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CTASettings {
  badge?: string;
  headline?: string;
  description?: string;
}

const DEFAULT_CTA: CTASettings = {
  badge: '🔥 New Batch Starting Soon',
  headline: 'Ready to Launch Your Career?',
  description: 'Join 500+ developers who already transformed their careers. Don\'t wait — limited seats per batch.',
};

export default function CTASection() {
  const [cta, setCta] = useState<CTASettings>(DEFAULT_CTA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/homepage')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings?.cta) {
          setCta(data.settings.cta);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const settings = { ...DEFAULT_CTA, ...cta };

  return (
    <section style={{
      padding: '6rem 0',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(108,99,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,255,0.08))',
          border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: '28px',
          padding: '4rem',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative corner */}
          <div style={{
            position: 'absolute', top: '-50px', right: '-50px',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(108,99,255,0.15)',
            border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: '100px',
            padding: '0.4rem 1.2rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#8b85ff',
          }}>
            {settings.badge}
          </div>

          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            marginBottom: '1rem',
          }}>
            {settings.headline}
          </h2>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            maxWidth: '500px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            {settings.description}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/courses" className="btn btn-primary btn-lg" id="cta-explore-courses">
              🚀 Explore Courses
            </Link>
            <Link href="/contact" className="btn btn-ghost btn-lg" id="cta-contact-us">
              📞 Talk to Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
