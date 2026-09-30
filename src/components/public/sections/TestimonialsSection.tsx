'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  _id: string;
  name: string;
  photo: string;
  designation: string;
  company: string;
  review: string;
  rating: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ opacity: s <= rating ? 1 : 0.25 }}>★</span>
      ))}
    </div>
  );
}

// Fallback testimonials shown when DB is empty
const FALLBACK = [
  {
    _id: '1',
    name: 'Aditya Sharma',
    photo: '',
    designation: 'Software Engineer',
    company: 'TCS',
    review: 'CodeWithSuraj transformed my career. The MERN stack course is incredibly detailed with real projects. Got placed at TCS within 2 months of completion!',
    rating: 5,
  },
  {
    _id: '2',
    name: 'Priya Patel',
    photo: '',
    designation: 'Full Stack Developer',
    company: 'Infosys',
    review: 'The live sessions are amazing. Suraj explains every concept with practical examples. The placement support is outstanding — resume to offer letter in 6 weeks.',
    rating: 5,
  },
  {
    _id: '3',
    name: 'Rohan Mehta',
    photo: '',
    designation: '.NET Developer',
    company: 'Wipro',
    review: 'I did the Full Stack .NET course and it was one of the best investments I made. The curriculum is up-to-date with what companies actually need.',
    rating: 5,
  },
  {
    _id: '4',
    name: 'Sneha Joshi',
    photo: '',
    designation: 'React Developer',
    company: 'Startup',
    review: 'Went from zero to building production React apps in 3 months. The community support and mentor availability is truly what sets this apart.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.testimonials?.length > 0) {
          setTestimonials(data.testimonials);
        }
      })
      .catch(() => {});
  }, []);

  const current = testimonials[active];

  return (
    <section className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">💬 Testimonials</span>
          <h2 className="section-title">
            Students Who{' '}
            <span className="text-gradient">Transformed</span>
          </h2>
          <p className="section-desc">
            Real stories from real students who changed their careers with CodeWithSuraj.
          </p>
        </div>

        {/* Featured Testimonial */}
        <div style={{
          background: 'rgba(26,26,38,0.8)',
          border: '1px solid rgba(108,99,255,0.15)',
          borderRadius: '24px',
          padding: '3rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: '800px',
          margin: '0 auto 3rem',
        }}>
          {/* Quote mark */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '2rem',
            fontSize: '8rem',
            fontFamily: 'Georgia, serif',
            color: 'rgba(108,99,255,0.08)',
            lineHeight: 1,
            pointerEvents: 'none',
          }}>
            "
          </div>

          <StarRating rating={current.rating} />
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-primary)',
            lineHeight: 1.8,
            margin: '1.5rem 0',
            fontStyle: 'italic',
            position: 'relative',
          }}>
            "{current.review}"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: '700',
              color: '#fff',
              flexShrink: 0,
            }}>
              {current.photo ? (
                <img src={current.photo} alt={current.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : current.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{current.name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {current.designation} @ {current.company}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Dots / Mini Cards */}
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {testimonials.map((t, i) => (
            <button
              key={t._id}
              onClick={() => setActive(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                background: i === active ? 'rgba(108,99,255,0.15)' : 'rgba(26,26,38,0.5)',
                border: `1px solid ${i === active ? 'rgba(108,99,255,0.4)' : 'var(--border-subtle)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: 'var(--text-primary)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#fff',
                flexShrink: 0,
              }}>
                {t.name.charAt(0)}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{t.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.company}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
