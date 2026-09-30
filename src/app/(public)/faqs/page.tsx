'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/faqs')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.faqs) {
          setFaqs(data.faqs);
        }
      })
      .catch((err) => console.error('Failed to fetch FAQs:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ['All', ...Array.from(set)];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchCat = selectedCategory === 'All' || f.category === selectedCategory;
      const matchSearch =
        !search.trim() ||
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [faqs, selectedCategory, search]);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '5rem', paddingBottom: '6rem' }}>
      {/* Background Glows */}
      <div
        className="vengeance-glow-orb"
        style={{ width: '500px', height: '500px', background: '#6c63ff', top: '-100px', left: '-100px' }}
      />
      <div
        className="vengeance-glow-orb"
        style={{ width: '400px', height: '400px', background: '#00d4ff', top: '50%', right: '-100px' }}
      />

      <div className="container" style={{ maxWidth: '880px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="vengeance-badge vengeance-badge-glow" style={{ marginBottom: '1.25rem' }}>
            ✦ FREQUENTLY ASKED QUESTIONS
          </span>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
              fontWeight: '900',
              lineHeight: 1.15,
              marginBottom: '1rem',
            }}
          >
            Got Questions? <span className="text-gradient">We&apos;ve Got Answers.</span>
          </h1>
          <p style={{ maxWidth: '640px', margin: '0 auto', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Everything you need to know about our batch structures, live sessions, refund policies, and career placement services.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="vengeance-card" style={{ padding: '1.25rem', marginBottom: '2.5rem' }}>
          <input
            type="text"
            placeholder="🔍 Search questions by keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ background: 'rgba(10, 10, 15, 0.7)', marginBottom: '1rem' }}
          />

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: active ? '600' : '500',
                    background: active ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'rgba(255, 255, 255, 0.05)',
                    color: active ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'transparent' : 'var(--border-subtle)'}`,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQs Accordion */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: '70px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="vengeance-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No questions matched your search.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '4rem' }}>
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={faq._id || idx}
                  className="vengeance-card"
                  style={{
                    border: `1px solid ${isOpen ? 'rgba(108, 99, 255, 0.4)' : 'var(--border-subtle)'}`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      color: '#fff',
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      gap: '1rem',
                    }}
                  >
                    <span>{faq.question}</span>
                    <span
                      style={{
                        fontSize: '1.25rem',
                        color: isOpen ? 'var(--color-secondary)' : 'var(--text-muted)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        flexShrink: 0,
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.5rem 1.5rem 1.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        lineHeight: 1.7,
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '1rem',
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div
          className="vengeance-card vengeance-card-glow"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.12) 0%, rgba(0, 212, 255, 0.08) 100%)',
          }}
        >
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
            Still Have Questions?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Our team is always happy to jump on a quick call or chat on WhatsApp.
          </p>
          <Link href="/contact" className="btn btn-primary">
            ✦ Contact Academic Counseling
          </Link>
        </div>
      </div>
    </div>
  );
}
