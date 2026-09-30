'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Promotion {
  _id: string;
  title: string;
  description: string;
  cta: string;
  ctaUrl: string;
  backgroundColor: string;
  textColor: string;
}

export default function PromoBanner() {
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/promotions')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.promotions?.length > 0) {
          setPromo(data.promotions.find((p: { type: string }) => p.type === 'topbar') || null);
        }
      })
      .catch(() => {});
  }, []);

  if (!promo || dismissed) return null;

  return (
    <div
      className="promo-bar"
      style={{
        background: promo.backgroundColor,
        color: promo.textColor,
        position: 'relative',
        zIndex: 1001,
      }}
    >
      <span style={{ fontWeight: 600 }}>🔥 {promo.title}</span>
      {promo.description && (
        <span style={{ opacity: 0.85 }}> — {promo.description}</span>
      )}
      {promo.cta && promo.ctaUrl && (
        <Link
          href={promo.ctaUrl}
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '0.2rem 0.75rem',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '0.8rem',
            transition: 'background 0.2s',
            color: promo.textColor,
          }}
        >
          {promo.cta} →
        </Link>
      )}
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: 'absolute',
          right: '1rem',
          background: 'none',
          border: 'none',
          color: promo.textColor,
          cursor: 'pointer',
          opacity: 0.7,
          fontSize: '1.1rem',
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
