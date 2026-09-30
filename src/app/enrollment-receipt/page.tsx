'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Course {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number;
  currency: string;
}

interface PaymentAttempt {
  _id: string;
  utr: string;
  amount: number;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
}

interface Enrollment {
  _id: string;
  candidateName: string;
  email: string;
  phone: string;
  courseId: Course | null;
  amount?: number;
  paymentMethod: string;
  paymentStatus: string;
  enrollmentStatus: string;
  courseAccess: boolean;
  enrollmentNumber?: string;
  receiptNumber?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  createdAt: string;
  paymentAttempts?: PaymentAttempt[];
}

function ReceiptContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || searchParams.get('enrollmentId');
  const email = searchParams.get('email');

  const hasParams = Boolean(id || email);

  const [loading, setLoading] = useState(hasParams);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [error, setError] = useState(
    hasParams ? '' : 'Please provide a valid enrollment ID or email address to view the receipt.'
  );

  useEffect(() => {
    if (!id && !email) return;

    let isMounted = true;
    const query = id ? `id=${encodeURIComponent(id)}` : `email=${encodeURIComponent(email!)}`;
    fetch(`/api/enrollment-status?${query}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.enrollments && data.enrollments.length > 0) {
          const match = id
            ? data.enrollments.find((e: Enrollment) => e._id === id) || data.enrollments[0]
            : data.enrollments[0];
          setEnrollment(match);
        } else {
          setError(data.error || 'No verified enrollment record found.');
        }
      })
      .catch(() => {
        if (isMounted) setError('Failed to retrieve receipt details. Please try again.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, email]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8c8ca5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
          <div style={{ fontSize: '1rem', color: '#e8e8f0' }}>Generating official receipt...</div>
        </div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}>
        <div style={{
          background: '#161622',
          border: '1px solid rgba(255,68,68,0.25)',
          borderRadius: '20px',
          padding: '2.5rem',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#e8e8f0', fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
            Receipt Not Available
          </h2>
          <p style={{ color: '#8c8ca5', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {error || 'Unable to locate enrollment records.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link
              href="/enrollment-status"
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                background: '#7c6df8',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.88rem',
              }}
            >
              Check Status by Email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const course = enrollment.courseId;
  const verifiedAttempt = enrollment.paymentAttempts?.find((a) => a.status === 'verified') || enrollment.paymentAttempts?.[0];
  const paidAmount = enrollment.amount || verifiedAttempt?.amount || course?.discountPrice || course?.price || 0;
  const originalPrice = course?.price || paidAmount;
  const utr = verifiedAttempt?.utr || 'N/A';
  const issueDate = enrollment.verifiedAt || enrollment.createdAt;

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          nav, footer, .no-print {
            display: none !important;
          }
          .receipt-sheet {
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            margin: 0 !important;
            padding: 20px !important;
            max-width: 100% !important;
          }
          .receipt-sheet * {
            color: #111111 !important;
            text-shadow: none !important;
          }
          .print-border {
            border-color: #cccccc !important;
          }
          .print-highlight {
            color: #000000 !important;
            font-weight: bold !important;
          }
          .stamp-box {
            border: 2px dashed #008800 !important;
            color: #008800 !important;
          }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        padding: 'clamp(1rem, 4vw, 3rem) 1rem',
      }}>
        {/* Navigation / Action Bar (hidden on print) */}
        <div className="no-print" style={{
          maxWidth: '780px',
          margin: '0 auto 1.5rem auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <Link
            href="/enrollment-status"
            style={{
              color: '#8c8ca5',
              textDecoration: 'none',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            ← Back to Enrollment Status
          </Link>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c6df8, #5b4cdb)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(124,109,248,0.3)',
              }}
            >
              🖨️ Print / Download PDF
            </button>
          </div>
        </div>

        {/* Official Printable Receipt Card */}
        <div className="receipt-sheet" style={{
          maxWidth: '780px',
          margin: '0 auto',
          background: '#13131c',
          border: '1px solid rgba(124,109,248,0.2)',
          borderRadius: '24px',
          padding: 'clamp(1.5rem, 5vw, 3rem)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          position: 'relative',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: '1.75rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}>
            <div>
              <div style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.6rem',
                fontWeight: '800',
                color: '#ffffff',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{ color: '#7c6df8' }}>CodeWith</span>Suraj
              </div>
              <div style={{ fontSize: '0.82rem', color: '#8c8ca5', marginTop: '0.2rem' }}>
                Advanced Tech Masterclasses & Mentorship
              </div>
              <div style={{ fontSize: '0.78rem', color: '#686882', marginTop: '0.1rem' }}>
                support@codewithsuraj.com • Official Payment Receipt
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-block',
                background: 'rgba(0,200,150,0.12)',
                color: '#00c896',
                border: '1px solid rgba(0,200,150,0.3)',
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.5rem',
              }}>
                {enrollment.paymentStatus === 'verified' ? '✓ PAID & VERIFIED' : 'PENDING VERIFICATION'}
              </span>
              <div style={{ fontSize: '0.82rem', color: '#8c8ca5' }}>
                Date: {new Date(issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Key Reference Identifiers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '2rem',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#8c8ca5', fontWeight: '700', letterSpacing: '0.05em' }}>
                Receipt Number
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#00d4ff', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                {enrollment.receiptNumber || `REC-${new Date().getFullYear()}-${enrollment._id.slice(-6).toUpperCase()}`}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#8c8ca5', fontWeight: '700', letterSpacing: '0.05em' }}>
                Enrollment Number
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#9b8dfb', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                {enrollment.enrollmentNumber || `ENR-${new Date().getFullYear()}-${enrollment._id.slice(-6).toUpperCase()}`}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#8c8ca5', fontWeight: '700', letterSpacing: '0.05em' }}>
                Payment Method
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e8e8f0', marginTop: '0.2rem' }}>
                Manual UPI Transfer
              </div>
            </div>
          </div>

          {/* Student & Course Details 2-Column Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            {/* Student Info */}
            <div style={{
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '1.25rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#7c6df8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
                Student Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: '#8c8ca5' }}>Full Name: </span>
                  <strong style={{ color: '#ffffff' }}>{enrollment.candidateName}</strong>
                </div>
                <div>
                  <span style={{ color: '#8c8ca5' }}>Email: </span>
                  <span style={{ color: '#d0d0e2' }}>{enrollment.email}</span>
                </div>
                <div>
                  <span style={{ color: '#8c8ca5' }}>Phone: </span>
                  <span style={{ color: '#d0d0e2' }}>{enrollment.phone}</span>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div style={{
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '1.25rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#7c6df8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
                Enrolled Program
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                    {course?.name || 'Full Stack Masterclass'}
                  </strong>
                </div>
                <div style={{ color: '#8c8ca5', fontSize: '0.82rem' }}>
                  Live Mentorship • Lifetime LMS Access • Certificate of Completion
                </div>
                <div>
                  <span style={{ color: '#8c8ca5' }}>Access Status: </span>
                  <strong style={{ color: enrollment.courseAccess ? '#00c896' : '#ffb800' }}>
                    {enrollment.courseAccess ? 'Granted (Active)' : 'Pending Approval'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '2rem',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Item Description
                  </th>
                  <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                    Amount (INR)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '1rem 1.25rem', color: '#e8e8f0', fontSize: '0.9rem' }}>
                    Tuition Fee — {course?.name || 'Masterclass Admission'}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: '#e8e8f0', fontSize: '0.9rem', textAlign: 'right' }}>
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </td>
                </tr>

                {originalPrice > paidAmount && (
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem 1.25rem', color: '#00c896', fontSize: '0.85rem' }}>
                      Early Bird / Special Scholarship Discount
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', color: '#00c896', fontSize: '0.85rem', textAlign: 'right' }}>
                      -₹{(originalPrice - paidAmount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}

                <tr style={{ background: 'rgba(0,200,150,0.05)' }}>
                  <td style={{ padding: '1.1rem 1.25rem', fontWeight: '800', color: '#ffffff', fontSize: '1rem' }}>
                    Total Amount Paid
                  </td>
                  <td style={{ padding: '1.1rem 1.25rem', fontWeight: '800', color: '#00c896', fontSize: '1.2rem', textAlign: 'right', fontFamily: 'Outfit, sans-serif' }}>
                    ₹{paidAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Transaction & Verification Proof Box */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#8c8ca5', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
                Bank Transaction Ref / UPI UTR
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#00d4ff', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                {utr}
              </div>
              {enrollment.verifiedByName && (
                <div style={{ fontSize: '0.78rem', color: '#8c8ca5', marginTop: '0.25rem' }}>
                  Verified by: {enrollment.verifiedByName}
                </div>
              )}
            </div>

            {/* Official Digital Stamp */}
            <div className="stamp-box" style={{
              border: '2px dashed rgba(0,200,150,0.4)',
              borderRadius: '12px',
              padding: '0.75rem 1.25rem',
              textAlign: 'center',
              background: 'rgba(0,200,150,0.03)',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#00c896', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                ★ CODE WITH SURAJ ★
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#00c896', margin: '0.2rem 0' }}>
                VERIFIED ADMISSION
              </div>
              <div style={{ fontSize: '0.65rem', color: '#8c8ca5' }}>
                OFFICIAL DIGITAL RECORD
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '1.25rem',
            fontSize: '0.75rem',
            color: '#686882',
            lineHeight: 1.6,
          }}>
            <p style={{ margin: 0 }}>
              * This is a computer-generated tax invoice and receipt for educational course enrollment. No physical signature is required.
              For queries or batch schedule assistance, please reach out to <span style={{ color: '#8c8ca5' }}>support@codewithsuraj.com</span>.
            </p>
          </div>
        </div>

        {/* Action button at bottom */}
        <div className="no-print" style={{ textAlign: 'center', marginTop: '2rem' }}>
          {enrollment.courseAccess && course?.slug ? (
            <Link
              href={`/courses/${course.slug}`}
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                borderRadius: '12px',
                background: '#00c896',
                color: '#0a0a0f',
                fontWeight: '800',
                textDecoration: 'none',
                fontSize: '0.95rem',
              }}
            >
              Access Your Course Now →
            </Link>
          ) : (
            <Link
              href="/courses"
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e8e8f0',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              Explore Other Courses
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default function EnrollmentReceiptPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#8c8ca5' }}>Loading receipt...</div>
      </div>
    }>
      <ReceiptContent />
    </Suspense>
  );
}
