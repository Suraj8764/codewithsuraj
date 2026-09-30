'use client';

import { useState, useEffect } from 'react';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
}

const FALLBACK_FAQS: FAQ[] = [
  { _id: '1', question: 'Do I need prior experience to enroll?', answer: 'No prior experience is needed for beginner courses. We start from the fundamentals and build up progressively. For intermediate courses, basic programming knowledge is recommended.' },
  { _id: '2', question: 'Are the classes live or recorded?', answer: 'We offer live interactive sessions with recordings provided after each class. You can attend live for real-time doubt resolution, or watch recordings at your own pace.' },
  { _id: '3', question: 'What is the refund policy?', answer: 'We offer a 7-day money-back guarantee. If you are not satisfied with the course within the first 7 days, contact us for a full refund — no questions asked.' },
  { _id: '4', question: 'Will I get a certificate?', answer: 'Yes! Upon successful completion of the course and projects, you will receive an industry-recognized certificate from CodeWithSuraj that you can share on LinkedIn.' },
  { _id: '5', question: 'How is placement assistance provided?', answer: 'We provide resume building, mock technical interviews, LinkedIn profile optimization, and direct referrals to our network of 200+ hiring companies.' },
  { _id: '6', question: 'What payment options are available?', answer: 'We accept full payment and EMI options. You can pay via UPI, credit/debit card, netbanking, and wallet via Razorpay. EMI available through eligible cards.' },
];

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>(FALLBACK_FAQS);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/faqs?isGlobal=true')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.faqs?.length > 0) setFaqs(data.faqs);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="section-header">
          <span className="section-tag">❓ FAQs</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-desc">Everything you need to know before enrolling.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq) => (
            <div
              key={faq._id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid',
                borderColor: open === faq._id ? 'rgba(108,99,255,0.3)' : 'var(--border-subtle)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.2s ease',
              }}
            >
              <button
                onClick={() => setOpen(open === faq._id ? null : faq._id)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontFamily: 'Inter, sans-serif',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{faq.question}</span>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: 'rgba(108,99,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  flexShrink: 0,
                  transition: 'transform 0.3s ease',
                  transform: open === faq._id ? 'rotate(45deg)' : 'rotate(0)',
                  color: 'var(--color-primary-light)',
                }}>
                  +
                </span>
              </button>

              {open === faq._id && (
                <div style={{
                  padding: '0 1.5rem 1.25rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.925rem',
                  lineHeight: 1.75,
                  animation: 'fadeIn 0.2s ease',
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
