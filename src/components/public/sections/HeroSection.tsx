'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeroSettings {
  badge?: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
}

const DEFAULT_SETTINGS: HeroSettings = {
  badge: 'Enrollments Open — Limited Seats Available',
  headline: 'Master Full Stack Development',
  subheadline: 'with Expert Mentorship',
  description: 'Learn MERN Stack, Full Stack .NET, Python, React, Node.js & AI from real-world industry experts. Build projects that get you hired.',
  ctaPrimary: '🚀 Explore Courses',
  ctaSecondary: 'Meet the Trainer',
};

export default function HeroSection() {
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/homepage')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings?.hero) {
          setSettings(data.settings.hero);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hero = { ...DEFAULT_SETTINGS, ...settings };

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--gradient-hero)',
      paddingTop: '100px',
    }}>
      {/* Background Orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '5%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(108, 99, 255, 0.15) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Grid Lines */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(108,99,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,1) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
        }}>
          {/* Left Content */}
          <div className="animate-fade-up">
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(108, 99, 255, 0.1)',
              border: '1px solid rgba(108, 99, 255, 0.3)',
              borderRadius: '100px',
              padding: '0.4rem 1.2rem',
              marginBottom: '2rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#8b85ff',
            }}>
              <span style={{ fontSize: '0.7rem' }}>🟢</span>
              {hero.badge}
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '900',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}>
              {hero.headline}
              <br />
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '85%' }}>
                {hero.subheadline}
              </span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              marginBottom: '2.5rem',
              maxWidth: '520px',
            }}>
              {hero.description}
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link href="/courses" className="btn btn-primary btn-lg" id="hero-explore-courses">
                {hero.ctaPrimary}
              </Link>
              <Link href="/about" className="btn btn-secondary btn-lg" id="hero-meet-trainer">
                {hero.ctaSecondary}
              </Link>
            </div>

            {/* Social Proof */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {[
                { value: '500+', label: 'Students Placed' },
                { value: '15+', label: 'Courses' },
                { value: '4.9★', label: 'Average Rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Feature Cards */}
          <div className="animate-fade-up delay-300" style={{ position: 'relative' }}>
            {/* Main card */}
            <div style={{
              background: 'rgba(26, 26, 38, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(108, 99, 255, 0.2)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.5rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Most Popular
                  </div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '700' }}>
                    MERN Stack Development
                  </h3>
                </div>
                <span className="badge badge-success">Open</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {['MongoDB & Mongoose', 'Express.js & REST APIs', 'React.js & Next.js', 'Node.js & Authentication'].map((tech) => (
                  <div key={tech} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}>
                    <span style={{ color: 'var(--color-success)', fontSize: '0.8rem' }}>✓</span>
                    {tech}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }}>₹25,000</span>
                  <span style={{
                    display: 'block',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: 'var(--color-success)',
                  }}>₹18,999</span>
                </div>
                <Link href="/courses/mern-stack-development" className="btn btn-primary btn-sm">
                  Enroll →
                </Link>
              </div>
            </div>

            {/* Floating badges */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
              borderRadius: '16px',
              padding: '0.75rem 1.25rem',
              boxShadow: '0 8px 30px rgba(108, 99, 255, 0.4)',
              animation: 'float 3s ease-in-out infinite',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>🎯 Job-Ready</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)' }}>Real Projects</div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}>
              {[
                { icon: '⚡', title: 'Live Sessions', desc: 'Interactive Classes' },
                { icon: '💼', title: 'Placement Help', desc: 'Resume & Interview' },
                { icon: '🏆', title: 'Certificate', desc: 'Industry Recognized' },
                { icon: '♾️', title: 'Lifetime Access', desc: 'Course Recordings' },
              ].map((f) => (
                <div key={f.title} style={{
                  background: 'rgba(26, 26, 38, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '1rem',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{f.icon}</div>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.2rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > .container > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
