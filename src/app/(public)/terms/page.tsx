import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — CodeWithSuraj',
  description: 'Terms and Conditions governing course enrollments and cohort participation on CodeWithSuraj.',
};

export default function TermsPage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '5rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '840px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '3rem' }}>
          <span className="vengeance-badge" style={{ marginBottom: '1rem' }}>
            TERMS & CONDITIONS
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
            Terms of Service
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Last updated: September 30, 2026
          </p>
        </div>

        <div className="vengeance-card" style={{ padding: '2.5rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.75rem' }}>
            1. Agreement to Terms
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            By registering for an account, purchasing any bootcamp or course, or using the CodeWithSuraj website, you agree to abide by these Terms of Service. If you do not agree, please do not access or use our services.
          </p>

          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.75rem' }}>
            2. Intellectual Property & Course Materials
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            All course videos, lecture slides, proprietary project starter kits, and assignments provided by CodeWithSuraj instructors are protected by copyright. You may not re-upload, distribute, or resell our proprietary training materials.
          </p>

          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.75rem' }}>
            3. Refund & Cancellation Policy
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We offer a 100% money-back guarantee within the first 7 days of cohort commencement if you find the live course is not the right fit. After 7 days, course fees become non-refundable due to limited cohort seat allocation.
          </p>

          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.75rem' }}>
            4. Code of Conduct
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We maintain an inclusive, supportive developer community. Harassment, unauthorized spamming of peers, or abusive behavior in live classrooms or Discord channels will result in immediate termination of account access without refund.
          </p>

          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.75rem' }}>
            5. Questions & Assistance
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            For questions regarding course policies, batch transfers, or corporate accounts, reach out to our team at{' '}
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
