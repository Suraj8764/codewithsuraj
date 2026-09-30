import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — CodeWithSuraj',
  description: 'Learn how CodeWithSuraj protects and manages your personal data and information.',
};

export default function PrivacyPage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '5rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '840px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '3rem' }}>
          <span className="vengeance-badge" style={{ marginBottom: '1rem' }}>
            LEGAL & PRIVACY
          </span>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.2rem, 4vw, 3.25rem)',
              fontWeight: '900',
              color: '#fff',
              marginBottom: '0.75rem',
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Last updated: September 30, 2026
          </p>
        </div>

        <div className="vengeance-card" style={{ padding: '2.5rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.75rem' }}>
            1. Information We Collect
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            When you register for courses, inquire through our contact forms, or participate in live cohorts on CodeWithSuraj, we collect personal information including your full name, email address, phone number, payment transaction tokens, and learning progress.
          </p>

          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.75rem' }}>
            2. How We Use Your Data
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We use your data solely to deliver live classroom access, process secure tuition fees via Razorpay, issue verified course completion certificates, and provide job placement referral support. We strictly never sell or rent your personal information to third-party advertisers.
          </p>

          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.75rem' }}>
            3. Payment Security
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            All payments are processed through PCI-DSS Level 1 compliant gateways (Razorpay). We do not store your raw credit/debit card numbers, CVVs, or banking passwords on our servers.
          </p>

          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.75rem' }}>
            4. Cookies & Analytics
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We utilize essential session cookies and performance telemetry to remember your authentication state, smooth scrolling preferences, and course video timestamps.
          </p>

          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.75rem' }}>
            5. Contact Our Data Protection Officer
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            If you have questions regarding data deletion or wish to exercise your rights under Indian and international privacy regulations, contact us at{' '}
            <Link href="/contact" style={{ color: 'var(--color-primary-light)', textDecoration: 'underline' }}>
              contact@codewithsuraj.com
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
