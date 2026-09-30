import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Payment Successful' };

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ enrollmentId?: string; course?: string }>;
}) {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gradient-hero)',
      padding: '2rem',
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(26,26,38,0.9)',
        border: '1px solid rgba(0,200,150,0.2)',
        borderRadius: '24px',
        padding: '4rem 3rem',
        maxWidth: '520px',
        width: '100%',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          width: '80px', height: '80px',
          background: 'rgba(0,200,150,0.15)',
          border: '2px solid rgba(0,200,150,0.4)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem',
          margin: '0 auto 1.5rem',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}>
          ✅
        </div>

        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '2rem',
          fontWeight: '800',
          color: 'var(--color-success)',
          marginBottom: '1rem',
        }}>
          Enrollment Confirmed!
        </h1>

        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
          You're all set! We'll send your class details and joining link to your email within 24 hours.
          Prepare to level up your skills! 🚀
        </p>

        <div style={{
          background: 'rgba(0,200,150,0.05)',
          border: '1px solid rgba(0,200,150,0.15)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          textAlign: 'left',
        }}>
          <div>📧 Check your email for the confirmation receipt</div>
          <div>📱 Save our WhatsApp contact for quick support</div>
          <div>📅 Batch details will be shared 24 hrs before class</div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/courses" className="btn btn-secondary">
            Explore More Courses
          </Link>
          <Link href="/" className="btn btn-primary">
            Go to Home →
          </Link>
        </div>
      </div>
    </section>
  );
}
