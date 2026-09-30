'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PaymentAttempt {
  _id: string;
  utr: string;
  amount: number;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  paymentScreenshot?: string;
  submittedAt: string;
  reviewedAt?: string;
  attemptNumber: number;
}

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    name: string;
    slug: string;
    thumbnail: string;
    price: number;
    discountPrice: number;
    currency: string;
  } | null;
  candidateName: string;
  email: string;
  phone: string;
  amount?: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'verified' | 'rejected';
  enrollmentStatus: 'pending' | 'active' | 'rejected' | 'cancelled' | 'completed';
  courseAccess: boolean;
  enrollmentNumber?: string;
  receiptNumber?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  paymentAttempts: PaymentAttempt[];
}

const PAYMENT_STATUS_MAP = {
  pending: { label: '🟡 Verification Pending', bg: 'rgba(255,184,0,0.12)', color: '#ffb800' },
  verified: { label: '🟢 Verified', bg: 'rgba(0,200,150,0.12)', color: '#00c896' },
  rejected: { label: '🔴 Rejected', bg: 'rgba(255,68,68,0.12)', color: '#ff4444' },
};

const ENROLLMENT_STATUS_MAP = {
  pending: { label: 'Pending Verification', bg: 'rgba(255,184,0,0.1)', color: '#ffb800' },
  active: { label: '✓ Active', bg: 'rgba(0,200,150,0.1)', color: '#00c896' },
  rejected: { label: 'Rejected', bg: 'rgba(255,68,68,0.1)', color: '#ff4444' },
  cancelled: { label: 'Cancelled', bg: 'rgba(107,107,138,0.12)', color: '#9494a8' },
  completed: { label: 'Completed', bg: 'rgba(0,212,255,0.1)', color: '#00d4ff' },
};

function EnrollmentStatusContent() {
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(prefillEmail);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // Auto-fetch if email is in URL
  useEffect(() => {
    if (prefillEmail) {
      handleSearch(prefillEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(searchEmail?: string) {
    const emailToSearch = searchEmail || email;
    if (!emailToSearch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSearch)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    setSubmitted(false);
    try {
      const res = await fetch(`/api/enrollment-status?email=${encodeURIComponent(emailToSearch)}`);
      const data = await res.json();
      if (data.success) {
        setEnrollments(data.enrollments);
        setSubmitted(true);
        if (data.enrollments.length === 0) setError('No enrollments found for this email.');
      } else {
        setError(data.error || 'Failed to fetch enrollment status.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(amount: number, currency = 'INR') {
    if (currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`;
    return `${currency} ${amount.toLocaleString()}`;
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, sans-serif', padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1rem)', paddingTop: 'clamp(4.5rem, 8vw, 6rem)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: '999px', padding: '0.35rem 1rem', fontSize: '0.8rem', color: '#9b8dfb', marginBottom: '1rem', fontWeight: '600' }}>
            📊 Enrollment Status
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
            My Enrollments
          </h1>
          <p style={{ color: '#a8a8c0', fontSize: '0.95rem' }}>
            Enter your email to check your enrollment and payment status
          </p>
        </div>

        {/* Search Box */}
        <div style={{ background: 'linear-gradient(160deg, #14141e 0%, #0f0f1a 100%)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '20px', padding: 'clamp(1rem, 3vw, 1.75rem)', marginBottom: '2rem', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#a8a8c0', marginBottom: '0.6rem' }}>
            Email Address
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="email"
              id="enrollment-status-email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                padding: '0.8rem 1rem', color: '#e8e8f0', fontSize: '0.95rem',
                outline: 'none', fontFamily: 'Inter, sans-serif',
              }}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              style={{
                padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #6c63ff 0%, #4b42db 100%)',
                color: '#fff', fontWeight: '700', fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 20px rgba(108,99,255,0.35)',
                fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap',
              }}
            >
              {loading ? '⏳ Checking...' : '🔍 Check Status'}
            </button>
          </div>
          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '0.82rem', marginTop: '0.6rem' }}>⚠️ {error}</p>
          )}
        </div>

        {/* Enrollments List */}
        {submitted && enrollments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {enrollments.map((enrollment) => {
              const ps = PAYMENT_STATUS_MAP[enrollment.paymentStatus] || PAYMENT_STATUS_MAP.pending;
              const es = ENROLLMENT_STATUS_MAP[enrollment.enrollmentStatus] || ENROLLMENT_STATUS_MAP.pending;
              const isExpanded = expandedId === enrollment._id;
              const course = enrollment.courseId;
              const latestAttempt = enrollment.paymentAttempts?.[enrollment.paymentAttempts.length - 1];
              const amount = latestAttempt?.amount || 0;

              return (
                <div key={enrollment._id}
                  style={{ background: 'linear-gradient(160deg, #14141e 0%, #0f0f1a 100%)', border: `1px solid ${enrollment.paymentStatus === 'verified' ? 'rgba(0,200,150,0.3)' : enrollment.paymentStatus === 'rejected' ? 'rgba(255,68,68,0.25)' : 'rgba(108,99,255,0.2)'}`, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>

                  {/* Card Header */}
                  <div style={{ padding: 'clamp(1rem, 3.5vw, 1.5rem)', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Thumbnail */}
                    {course?.thumbnail ? (
                      <img src={course.thumbnail} alt={course.name} style={{ width: '72px', height: '72px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0, background: '#1a1a26' }} />
                    ) : (
                      <div style={{ width: '72px', height: '72px', borderRadius: '12px', background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>📚</div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '0.35rem', lineHeight: '1.3' }}>
                        {course?.name || 'Course not found'}
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                        <span style={{ background: ps.bg, color: ps.color, padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {ps.label}
                        </span>
                        <span style={{ background: es.bg, color: es.color, padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                          {es.label}
                        </span>
                        {enrollment.courseAccess && (
                          <span style={{ background: 'rgba(0,200,150,0.15)', color: '#00c896', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(0,200,150,0.3)' }}>
                            🟢 Access Granted
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.82rem', color: '#a8a8c0' }}>
                        {amount > 0 && <span><strong style={{ color: '#00c896' }}>{formatPrice(amount)}</strong> · {enrollment.paymentMethod === 'upi_manual' ? 'Manual UPI' : 'Razorpay'}</span>}
                        <span>Submitted: {formatDate(enrollment.createdAt)}</span>
                        {enrollment.verifiedAt && <span>Verified: {formatDate(enrollment.verifiedAt)}</span>}
                      </div>

                      {enrollment.enrollmentNumber && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#9b8dfb', fontFamily: 'monospace' }}>
                          {enrollment.enrollmentNumber} · {enrollment.receiptNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {enrollment.paymentStatus === 'rejected' && enrollment.rejectionReason && (
                    <div style={{ margin: '0 clamp(1rem, 3.5vw, 1.5rem)', marginBottom: '1rem', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#ff9090' }}>
                      <strong>❌ Rejection Reason:</strong> {enrollment.rejectionReason}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ padding: '0 clamp(1rem, 3.5vw, 1.5rem) clamp(1rem, 3.5vw, 1.5rem)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {enrollment.courseAccess && course?.slug && (
                      <Link href={`/courses/${course.slug}`}
                        style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: 'linear-gradient(135deg, #00c896 0%, #009e78 100%)', color: '#fff', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        🚀 Access Course
                      </Link>
                    )}

                    {enrollment.paymentStatus === 'rejected' && (
                      <Link href={`/courses`}
                        style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: 'linear-gradient(135deg, #6c63ff 0%, #4b42db 100%)', color: '#fff', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none' }}>
                        🔄 Re-enroll
                      </Link>
                    )}

                    {enrollment.receiptNumber && (
                      <Link href={`/enrollment-receipt?id=${enrollment._id}`}
                        style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', fontWeight: '600', fontSize: '0.85rem', textDecoration: 'none' }}>
                        🧾 View Receipt
                      </Link>
                    )}

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : enrollment._id)}
                      style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#a8a8c0', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
                      {isExpanded ? '▲ Hide Details' : '▾ View Details'}
                    </button>
                  </div>

                  {/* Expanded: Payment History */}
                  {isExpanded && enrollment.paymentAttempts.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(1rem, 3.5vw, 1.5rem)' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#a8a8c0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
                        Payment History ({enrollment.paymentAttempts.length} attempt{enrollment.paymentAttempts.length > 1 ? 's' : ''})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {enrollment.paymentAttempts.map((attempt) => {
                          const aps = attempt.status === 'verified' ? { color: '#00c896', bg: 'rgba(0,200,150,0.1)' } : attempt.status === 'rejected' ? { color: '#ff4444', bg: 'rgba(255,68,68,0.1)' } : { color: '#ffb800', bg: 'rgba(255,184,0,0.1)' };
                          return (
                            <div key={attempt._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#e8e8f0' }}>
                                  Attempt #{attempt.attemptNumber}
                                </span>
                                <span style={{ background: aps.bg, color: aps.color, padding: '0.2rem 0.6rem', borderRadius: '5px', fontSize: '0.75rem', fontWeight: '700' }}>
                                  {attempt.status.toUpperCase()}
                                </span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.8rem', color: '#a8a8c0' }}>
                                <span>UTR: <strong style={{ color: '#a0e4ff', fontFamily: 'monospace' }}>{attempt.utr}</strong></span>
                                <span>Amount: <strong style={{ color: '#00c896' }}>{formatPrice(attempt.amount)}</strong></span>
                                <span>Submitted: {formatDate(attempt.submittedAt)}</span>
                                {attempt.reviewedAt && <span>Reviewed: {formatDate(attempt.reviewedAt)}</span>}
                              </div>
                              {attempt.rejectionReason && (
                                <p style={{ marginTop: '0.5rem', fontSize: '0.79rem', color: '#ff9090', background: 'rgba(255,68,68,0.07)', borderRadius: '6px', padding: '0.4rem 0.6rem' }}>
                                  Reason: {attempt.rejectionReason}
                                </p>
                              )}
                              {attempt.paymentScreenshot && (
                                <button
                                  onClick={() => setPreviewImg(attempt.paymentScreenshot!)}
                                  style={{ marginTop: '0.6rem', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: '8px', padding: '0.3rem 0.7rem', color: '#9b8dfb', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>
                                  🖼 View Screenshot
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Screenshot Preview Modal */}
        {previewImg && (
          <div
            onClick={() => setPreviewImg(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ maxWidth: '600px', width: '100%', position: 'relative' }}>
              <button onClick={() => setPreviewImg(null)} style={{ position: 'absolute', top: '-2rem', right: 0, background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              <img src={previewImg} alt="Payment screenshot" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }} />
            </div>
          </div>
        )}

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link href="/courses" style={{ color: '#9b8dfb', fontSize: '0.88rem', textDecoration: 'none', fontWeight: '600' }}>
            ← Back to Courses
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EnrollmentStatusPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b6b8a' }}>Loading...</div>
      </div>
    }>
      <EnrollmentStatusContent />
    </Suspense>
  );
}
