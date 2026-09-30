'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Trainer {
  _id: string;
  name: string;
  photo: string;
  designation: string;
  bio: string;
  experience: number;
  skills: string[];
  linkedin?: string;
  github?: string;
  twitter?: string;
  youtube?: string;
}

export default function AboutPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trainers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.trainers) {
          setTrainers(data.trainers);
        }
      })
      .catch((err) => console.error('Failed to load trainers:', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Developers Trained', value: '15,000+', icon: '👨‍💻' },
    { label: 'Placement Success', value: '96.8%', icon: '🚀' },
    { label: 'Hiring Partners', value: '250+', icon: '🏢' },
    { label: 'Average Rating', value: '4.9 / 5', icon: '⭐' },
  ];

  const pillars = [
    {
      icon: '⚡',
      title: 'Real-World Production Code',
      desc: 'We throw out toy examples. You architect real microservices, multi-tenant databases, caching layers, and high-concurrency systems.',
    },
    {
      icon: '🧠',
      title: 'Active Industry Mentorship',
      desc: 'Learn directly from Principal Architects and Staff Engineers working daily in top tech enterprises and high-growth unicorns.',
    },
    {
      icon: '🛠️',
      title: 'Hands-On Capstone Portfolios',
      desc: 'Build and deploy 4+ enterprise-scale projects with CI/CD pipelines, Docker containers, and live public URLs that wow hiring managers.',
    },
    {
      icon: '🤝',
      title: 'Lifetime Developer Guild',
      desc: 'Gain lifetime access to our exclusive alumni network, weekly live tech talks, mock interviews, and direct referral opportunities.',
    },
  ];

  const milestones = [
    { year: '2021', title: 'The Genesis', desc: 'Started as an invite-only cohort for 30 engineers aiming for high-growth tech startups.' },
    { year: '2023', title: 'Curriculum Expansion', desc: 'Introduced deep-dive AI engineering, Next.js App Router, and Cloud Architecture tracks.' },
    { year: '2024', title: 'Hiring Network Scale', desc: 'Partnered with 200+ product startups and tech companies for priority hiring pipelines.' },
    { year: '2026', title: 'Global Tech Academy', desc: 'Empowering over 15,000+ developers globally with industry-leading practical courses.' },
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '5rem', paddingBottom: '6rem' }}>
      {/* Background glow orbs */}
      <div
        className="vengeance-glow-orb"
        style={{ width: '500px', height: '500px', background: '#6c63ff', top: '-100px', left: '-150px' }}
      />
      <div
        className="vengeance-glow-orb"
        style={{ width: '450px', height: '450px', background: '#00d4ff', top: '30%', right: '-120px' }}
      />

      {/* Hero Section */}
      <section className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '5rem' }}>
        <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
          <span className="vengeance-badge vengeance-badge-glow">
            ✦ OUR STORY & MISSION
          </span>
        </div>
        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '900',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Architecting the Future of <br />
          <span className="text-gradient">Practical Tech Education</span>
        </h1>
        <p
          style={{
            maxWidth: '760px',
            margin: '0 auto 2.5rem',
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          We bridge the chasm between academic theory and real-world high-throughput engineering.
          No fluff, no outdated tutorials—just production-grade coding with senior mentors.
        </p>

        {/* Stats Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginTop: '3rem',
          }}
        >
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="vengeance-card"
              style={{
                padding: '1.75rem 1.25rem',
                textAlign: 'center',
                background: 'rgba(18, 18, 26, 0.75)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#fff',
                  marginBottom: '0.25rem',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values / Pillars */}
      <section className="container" style={{ position: 'relative', zIndex: 1, marginBottom: '6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-tag">✦ WHY CODEWITHSURAJ</span>
          <h2 className="section-title">The Four Engineering Pillars</h2>
          <p className="section-desc">
            How our pragmatic curriculum accelerates your journey to Staff Engineer level.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="vengeance-card"
              style={{
                padding: '2.25rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.2), rgba(0, 212, 255, 0.2))',
                  border: '1px solid rgba(108, 99, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}
              >
                {p.icon}
              </div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>
                {p.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.65 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Instructors / Mentors */}
      <section className="container" style={{ position: 'relative', zIndex: 1, marginBottom: '6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-tag">✦ MEET THE FACULTY</span>
          <h2 className="section-title">Learn from Seasoned Practitioners</h2>
          <p className="section-desc">
            Our instructors don&apos;t just teach—they build and lead production systems every day.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: '360px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : trainers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No instructors listed currently.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
            {trainers.map((t) => (
              <div
                key={t._id}
                className="vengeance-card"
                style={{
                  padding: '2rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                {/* Photo with Cyber Ring */}
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    padding: '3px',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    marginBottom: '1.25rem',
                    boxShadow: '0 0 20px rgba(108, 99, 255, 0.35)',
                  }}
                >
                  <img
                    src={t.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                    alt={t.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>

                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>
                  {t.name}
                </h3>
                <div style={{ color: 'var(--color-primary-light)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  {t.designation}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {t.bio}
                </p>

                {/* Skills */}
                {t.skills && t.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    {t.skills.slice(0, 4).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.6rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Social icons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                  {t.linkedin && (
                    <a
                      href={t.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-muted)', fontSize: '1.1rem', transition: 'color 0.2s' }}
                      aria-label="LinkedIn"
                    >
                      💼
                    </a>
                  )}
                  {t.github && (
                    <a
                      href={t.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-muted)', fontSize: '1.1rem', transition: 'color 0.2s' }}
                      aria-label="GitHub"
                    >
                      🐙
                    </a>
                  )}
                  {t.twitter && (
                    <a
                      href={t.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-muted)', fontSize: '1.1rem', transition: 'color 0.2s' }}
                      aria-label="Twitter"
                    >
                      🐦
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Timeline */}
      <section className="container" style={{ position: 'relative', zIndex: 1, marginBottom: '6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-tag">✦ OUR JOURNEY</span>
          <h2 className="section-title">The Evolution of Excellence</h2>
        </div>

        <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="vengeance-card"
              style={{
                padding: '1.75rem 2rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.5rem',
              }}
            >
              <div
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: 'var(--color-secondary)',
                  background: 'rgba(0, 212, 255, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(0, 212, 255, 0.25)',
                  whiteSpace: 'nowrap',
                }}
              >
                {m.year}
              </div>
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: '700', color: '#fff', marginBottom: '0.35rem' }}>
                  {m.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {m.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          className="vengeance-card vengeance-card-glow"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)',
          }}
        >
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: '800',
              color: '#fff',
              marginBottom: '1rem',
            }}
          >
            Ready to Take Your Engineering to the Next Level?
          </h2>
          <p
            style={{
              maxWidth: '600px',
              margin: '0 auto 2rem',
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
            }}
          >
            Join thousands of developers building scalable systems and advancing their careers.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/courses" className="btn btn-primary btn-lg">
              ✦ Explore All Courses
            </Link>
            <Link href="/contact" className="btn btn-secondary btn-lg">
              💬 Speak with an Advisor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
