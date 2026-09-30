'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

interface CourseInfo {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number;
}

interface EnrollmentInfo {
  _id: string;
  candidateName: string;
  email: string;
  phone: string;
  enrollmentNumber?: string;
  paymentStatus: string;
  enrollmentStatus: string;
}

interface PaymentAttempt {
  _id: string;
  enrollmentId: EnrollmentInfo | null;
  courseId: CourseInfo | null;
  candidateName: string;
  email: string;
  phone: string;
  utr: string;
  amount: number;
  paymentScreenshot?: string;
  paymentDate?: string;
  notes?: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  attemptNumber: number;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

interface Stats {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
}

const REJECTION_PRESETS = [
  'UTR / Transaction ID not found or invalid',
  'Payment amount does not match course fee',
  'Screenshot is blurry, cropped, or unreadable',
  'Duplicate UTR already used for another enrollment',
  'Payment not yet credited to institute bank account',
  'Wrong recipient UPI VPA or account',
];

export default function AdminPaymentsPage() {
  const { token } = useAdmin();
  const [attempts, setAttempts] = useState<PaymentAttempt[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, verified: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Review modal state
  const [selectedAttempt, setSelectedAttempt] = useState<PaymentAttempt | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showConfirmApprove, setShowConfirmApprove] = useState(false);
  const [screenshotZoom, setScreenshotZoom] = useState(false);

  const fetchPayments = useCallback(() => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '15');
    params.set('status', statusFilter);
    if (search.trim()) params.set('search', search.trim());

    fetch(`/api/admin/payments?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setAttempts(data.attempts || []);
          if (data.pagination) {
            setTotalPages(data.pagination.pages || 1);
            setTotal(data.pagination.total || 0);
          }
          if (data.stats) {
            setStats(data.stats);
          }
        } else {
          toast.error(data.error || 'Failed to fetch payments');
        }
      })
      .catch(() => toast.error('Network error loading payments'))
      .finally(() => setLoading(false));
  }, [token, page, statusFilter, search]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  function openReview(attempt: PaymentAttempt) {
    setSelectedAttempt(attempt);
    setIsReviewOpen(true);
    setRejectMode(false);
    setSelectedPreset('');
    setCustomReason('');
    setShowConfirmApprove(false);
    setScreenshotZoom(false);
  }

  function closeReview() {
    setIsReviewOpen(false);
    setSelectedAttempt(null);
    setRejectMode(false);
    setShowConfirmApprove(false);
  }

  async function handleApprove() {
    if (!selectedAttempt || !token) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'approve',
          attemptId: selectedAttempt._id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Payment verified! Enrollment #${data.enrollmentNumber} generated.`);
        closeReview();
        fetchPayments();
      } else {
        toast.error(data.error || 'Failed to approve payment');
      }
    } catch {
      toast.error('Network error approving payment');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedAttempt || !token) return;
    const finalReason = selectedPreset === 'Other' || !selectedPreset
      ? customReason.trim()
      : customReason.trim()
        ? `${selectedPreset} - ${customReason.trim()}`
        : selectedPreset;

    if (!finalReason || finalReason.length < 5) {
      toast.error('Please specify a rejection reason (minimum 5 characters)');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'reject',
          attemptId: selectedAttempt._id,
          rejectionReason: finalReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Payment attempt marked as rejected');
        closeReview();
        fetchPayments();
      } else {
        toast.error(data.error || 'Failed to reject payment');
      }
    } catch {
      toast.error('Network error rejecting payment');
    } finally {
      setActionLoading(false);
    }
  }

  function exportCSV() {
    const headers = ['Candidate Name', 'Email', 'Phone', 'Course', 'Amount', 'UTR', 'Status', 'Submitted At', 'Rejection Reason'];
    const rows = attempts.map((a) => [
      a.candidateName,
      a.email,
      a.phone,
      a.courseId?.name || '',
      a.amount,
      a.utr,
      a.status,
      new Date(a.submittedAt).toLocaleString('en-IN'),
      a.rejectionReason || '',
    ]);
    const csvContent = [headers, ...rows].map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `upi_payments_${statusFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: '700',
            color: '#e8e8f0',
            marginBottom: '0.35rem',
            letterSpacing: '-0.02em',
          }}>
            💳 UPI Payment Verifications
          </h1>
          <p style={{ color: '#8c8ca5', fontSize: '0.9rem' }}>
            Review candidate payment submissions, cross-verify UTRs, and activate course enrollments
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchPayments}
            style={{
              padding: '0.65rem 1.1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#e8e8f0',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={exportCSV}
            style={{
              padding: '0.65rem 1.1rem',
              background: 'rgba(124,109,248,0.12)',
              border: '1px solid rgba(124,109,248,0.3)',
              borderRadius: '10px',
              color: '#9b8dfb',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,184,0,0.1) 0%, rgba(28,28,40,0.8) 100%)',
          border: '1px solid rgba(255,184,0,0.3)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
        }}>
          <div style={{ color: '#ffb800', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Pending Review
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffb800', fontFamily: 'Outfit, sans-serif' }}>
            {stats.pending}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#8c8ca5', marginTop: '0.2rem' }}>
            Requires manual verification
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(0,200,150,0.1) 0%, rgba(28,28,40,0.8) 100%)',
          border: '1px solid rgba(0,200,150,0.3)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
        }}>
          <div style={{ color: '#00c896', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Verified & Enrolled
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#00c896', fontFamily: 'Outfit, sans-serif' }}>
            {stats.verified}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#8c8ca5', marginTop: '0.2rem' }}>
            Active course access granted
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(255,68,68,0.1) 0%, rgba(28,28,40,0.8) 100%)',
          border: '1px solid rgba(255,68,68,0.3)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
        }}>
          <div style={{ color: '#ff6b6b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Rejected
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ff6b6b', fontFamily: 'Outfit, sans-serif' }}>
            {stats.rejected}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#8c8ca5', marginTop: '0.2rem' }}>
            Reason communicated to candidate
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(124,109,248,0.1) 0%, rgba(28,28,40,0.8) 100%)',
          border: '1px solid rgba(124,109,248,0.3)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
        }}>
          <div style={{ color: '#9b8dfb', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Total Submissions
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#9b8dfb', fontFamily: 'Outfit, sans-serif' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#8c8ca5', marginTop: '0.2rem' }}>
            All-time UPI attempts
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#161622',
        border: '1px solid rgba(124,109,248,0.15)',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['pending', 'verified', 'rejected', 'all'] as const).map((status) => {
            const active = statusFilter === status;
            const labels: Record<string, string> = {
              pending: `Pending (${stats.pending})`,
              verified: `Verified (${stats.verified})`,
              rejected: `Rejected (${stats.rejected})`,
              all: `All (${stats.total})`,
            };
            return (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  border: active ? '1px solid #7c6df8' : '1px solid rgba(255,255,255,0.08)',
                  background: active ? 'rgba(124,109,248,0.2)' : 'transparent',
                  color: active ? '#ffffff' : '#8c8ca5',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 280px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search by student, email, UTR..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.2rem',
              background: '#0e0e17',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#e8e8f0',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.9rem' }}>
            🔍
          </span>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#8c8ca5',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div style={{
        background: '#161622',
        border: '1px solid rgba(124,109,248,0.12)',
        borderRadius: '18px',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#8c8ca5' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>⏳</div>
            Loading payment attempts...
          </div>
        ) : attempts.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#8c8ca5' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <h3 style={{ fontSize: '1.1rem', color: '#e8e8f0', marginBottom: '0.4rem' }}>
              No payments found
            </h3>
            <p style={{ fontSize: '0.85rem' }}>
              {statusFilter === 'pending'
                ? 'All pending payments have been reviewed!'
                : `No payments matching "${statusFilter}" status.`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Student
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Course
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Amount
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    UTR / Ref
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Screenshot
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Submitted
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Status
                  </th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => {
                  const isPending = attempt.status === 'pending';
                  const isVerified = attempt.status === 'verified';
                  const isRejected = attempt.status === 'rejected';

                  const badgeStyle = isVerified
                    ? { bg: 'rgba(0,200,150,0.12)', color: '#00c896', border: 'rgba(0,200,150,0.25)' }
                    : isRejected
                      ? { bg: 'rgba(255,68,68,0.12)', color: '#ff6b6b', border: 'rgba(255,68,68,0.25)' }
                      : { bg: 'rgba(255,184,0,0.12)', color: '#ffb800', border: 'rgba(255,184,0,0.25)' };

                  return (
                    <tr
                      key={attempt._id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Candidate */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: '600', color: '#e8e8f0', fontSize: '0.9rem' }}>
                          {attempt.candidateName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#8c8ca5' }}>
                          {attempt.email}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#686882' }}>
                          {attempt.phone}
                        </div>
                        {attempt.attemptNumber > 1 && (
                          <span style={{
                            display: 'inline-block',
                            marginTop: '0.2rem',
                            fontSize: '0.7rem',
                            background: 'rgba(124,109,248,0.15)',
                            color: '#9b8dfb',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            fontWeight: '600',
                          }}>
                            Attempt #{attempt.attemptNumber}
                          </span>
                        )}
                      </td>

                      {/* Course */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: '500', color: '#d0d0e2', fontSize: '0.88rem', maxWidth: '240px' }}>
                          {attempt.courseId?.name || 'Unknown Course'}
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: '700', color: '#00c896', fontSize: '0.95rem' }}>
                          ₹{attempt.amount?.toLocaleString('en-IN') || 0}
                        </div>
                      </td>

                      {/* UTR */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                        <code style={{
                          background: 'rgba(0,0,0,0.3)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          color: '#00d4ff',
                          fontSize: '0.82rem',
                          letterSpacing: '0.04em',
                          fontFamily: 'monospace',
                          display: 'inline-block',
                        }}>
                          {attempt.utr}
                        </code>
                      </td>

                      {/* Screenshot */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                        {attempt.paymentScreenshot ? (
                          <div
                            onClick={() => openReview(attempt)}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1px solid rgba(255,255,255,0.15)',
                              cursor: 'pointer',
                              position: 'relative',
                            }}
                            title="Click to inspect receipt"
                          >
                            <img
                              src={attempt.paymentScreenshot}
                              alt="Payment proof"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#686882' }}>None</span>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', fontSize: '0.8rem', color: '#8c8ca5' }}>
                        {new Date(attempt.submittedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <div style={{ fontSize: '0.72rem', color: '#686882' }}>
                          {new Date(attempt.submittedAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.border}`,
                          padding: '0.3rem 0.7rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>
                          {isPending && '🟡 Pending'}
                          {isVerified && '🟢 Verified'}
                          {isRejected && '🔴 Rejected'}
                        </span>
                        {isRejected && attempt.rejectionReason && (
                          <div style={{ fontSize: '0.72rem', color: '#ff8585', marginTop: '0.3rem', maxWidth: '200px' }} title={attempt.rejectionReason}>
                            {attempt.rejectionReason.slice(0, 30)}...
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <button
                          onClick={() => openReview(attempt)}
                          style={{
                            padding: '0.45rem 0.9rem',
                            borderRadius: '8px',
                            background: isPending ? '#7c6df8' : 'rgba(255,255,255,0.06)',
                            border: isPending ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          {isPending ? '🔍 Review' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ fontSize: '0.85rem', color: '#8c8ca5' }}>
              Showing {attempts.length} of {total} results
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: page <= 1 ? '#4e4e64' : '#e8e8f0',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                Previous
              </button>
              <span style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#e8e8f0' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: page >= totalPages ? '#4e4e64' : '#e8e8f0',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REVIEW & VERIFICATION MODAL */}
      {isReviewOpen && selectedAttempt && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: '#161622',
            border: '1px solid rgba(124,109,248,0.25)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '820px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#13131d',
            }}>
              <div>
                <h2 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#e8e8f0',
                  margin: 0,
                }}>
                  Payment Verification Details
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#8c8ca5', marginTop: '0.2rem' }}>
                  Attempt ID: {selectedAttempt._id}
                </div>
              </div>
              <button
                onClick={closeReview}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#e8e8f0',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{
              padding: '1.5rem 1.75rem',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}>
              {/* Status Banner */}
              <div style={{
                padding: '0.9rem 1.25rem',
                borderRadius: '12px',
                background: selectedAttempt.status === 'verified'
                  ? 'rgba(0,200,150,0.1)'
                  : selectedAttempt.status === 'rejected'
                    ? 'rgba(255,68,68,0.1)'
                    : 'rgba(255,184,0,0.1)',
                border: `1px solid ${selectedAttempt.status === 'verified'
                  ? 'rgba(0,200,150,0.3)'
                  : selectedAttempt.status === 'rejected'
                    ? 'rgba(255,68,68,0.3)'
                    : 'rgba(255,184,0,0.3)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <div>
                  <span style={{
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    color: selectedAttempt.status === 'verified'
                      ? '#00c896'
                      : selectedAttempt.status === 'rejected'
                        ? '#ff6b6b'
                        : '#ffb800',
                  }}>
                    {selectedAttempt.status === 'verified' && '✓ Payment Verified & Course Active'}
                    {selectedAttempt.status === 'rejected' && '✗ Payment Rejected'}
                    {selectedAttempt.status === 'pending' && '⏳ Verification Awaiting Admin Review'}
                  </span>
                  {selectedAttempt.rejectionReason && (
                    <div style={{ fontSize: '0.8rem', color: '#ff9090', marginTop: '0.25rem' }}>
                      Rejection Reason: {selectedAttempt.rejectionReason}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#8c8ca5' }}>
                  Submitted: {new Date(selectedAttempt.submittedAt).toLocaleString('en-IN')}
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}>
                {/* Candidate Info */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  padding: '1.1rem',
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                    Student Information
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#8c8ca5' }}>Name: </span>
                      <strong style={{ color: '#e8e8f0' }}>{selectedAttempt.candidateName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#8c8ca5' }}>Email: </span>
                      <strong style={{ color: '#e8e8f0' }}>{selectedAttempt.email}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#8c8ca5' }}>Phone: </span>
                      <strong style={{ color: '#e8e8f0' }}>{selectedAttempt.phone}</strong>
                    </div>
                    {selectedAttempt.enrollmentId?.enrollmentNumber && (
                      <div>
                        <span style={{ color: '#8c8ca5' }}>Enrollment #: </span>
                        <strong style={{ color: '#9b8dfb' }}>{selectedAttempt.enrollmentId.enrollmentNumber}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course & Transaction Info */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  padding: '1.1rem',
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                    Course & Payment Details
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#8c8ca5' }}>Course: </span>
                      <strong style={{ color: '#e8e8f0' }}>{selectedAttempt.courseId?.name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#8c8ca5' }}>Amount Paid: </span>
                      <strong style={{ color: '#00c896', fontSize: '1rem' }}>
                        ₹{selectedAttempt.amount?.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#8c8ca5' }}>UTR Number: </span>
                      <code style={{
                        background: 'rgba(0,212,255,0.1)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        color: '#00d4ff',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                      }}>
                        {selectedAttempt.utr}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedAttempt.utr);
                          toast.success('UTR copied to clipboard');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#8c8ca5',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                        title="Copy UTR"
                      >
                        📋
                      </button>
                    </div>
                    {selectedAttempt.notes && (
                      <div style={{ marginTop: '0.25rem', fontSize: '0.78rem', color: '#a8a8c0' }}>
                        <span style={{ color: '#8c8ca5' }}>Candidate Notes: </span>
                        {selectedAttempt.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Screenshot Viewer */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '1.25rem',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8c8ca5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Payment Screenshot / Receipt Proof
                  </div>
                  {selectedAttempt.paymentScreenshot && (
                    <a
                      href={selectedAttempt.paymentScreenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#9b8dfb',
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        fontWeight: '600',
                      }}
                    >
                      ↗ Open in Full Window
                    </a>
                  )}
                </div>

                {selectedAttempt.paymentScreenshot ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: '#0a0a0f',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <img
                      src={selectedAttempt.paymentScreenshot}
                      alt="Uploaded payment proof"
                      onClick={() => setScreenshotZoom(!screenshotZoom)}
                      style={{
                        maxWidth: '100%',
                        maxHeight: screenshotZoom ? '800px' : '360px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        cursor: 'zoom-in',
                        transition: 'all 0.3s ease',
                      }}
                      title="Click to toggle zoom"
                    />
                    <div style={{ fontSize: '0.75rem', color: '#686882', marginTop: '0.5rem' }}>
                      Click image to toggle zoom
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#686882',
                    fontSize: '0.85rem',
                    background: '#0a0a0f',
                    borderRadius: '12px',
                  }}>
                    No screenshot was uploaded for this attempt.
                  </div>
                )}
              </div>

              {/* Rejection Form Drawer (when reject mode is active) */}
              {rejectMode && (
                <div style={{
                  background: 'rgba(255,68,68,0.06)',
                  border: '1px solid rgba(255,68,68,0.25)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.9rem',
                }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#ff6b6b' }}>
                    Specify Rejection Reason (Required)
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#8c8ca5', margin: 0 }}>
                    This reason will be displayed to the candidate on their enrollment tracking page so they can correct it and resubmit.
                  </p>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#8c8ca5', marginBottom: '0.35rem' }}>
                      Choose a reason preset:
                    </label>
                    <select
                      value={selectedPreset}
                      onChange={(e) => setSelectedPreset(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        background: '#161622',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#e8e8f0',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value="">-- Select standard preset --</option>
                      {REJECTION_PRESETS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                      <option value="Other">Other / Custom</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#8c8ca5', marginBottom: '0.35rem' }}>
                      Additional notes or custom instructions for student:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Please upload the complete bank debit confirmation showing the 12-digit UTR..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        background: '#161622',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#e8e8f0',
                        fontSize: '0.85rem',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => setRejectMode(false)}
                      style={{
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#8c8ca5',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      style={{
                        padding: '0.55rem 1.25rem',
                        borderRadius: '8px',
                        background: '#ff4444',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        opacity: actionLoading ? 0.7 : 1,
                      }}
                    >
                      {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmation Dialog for Approval */}
              {showConfirmApprove && (
                <div style={{
                  background: 'rgba(0,200,150,0.06)',
                  border: '1px solid rgba(0,200,150,0.3)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#00c896' }}>
                    Confirm Payment Approval & Course Activation
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#d0d0e2', margin: 0, lineHeight: 1.5 }}>
                    Are you sure you want to approve this payment of <strong>₹{selectedAttempt.amount?.toLocaleString('en-IN')}</strong> for <strong>{selectedAttempt.candidateName}</strong>?
                    <br />
                    This will immediately generate official <strong>Enrollment</strong> and <strong>Receipt</strong> numbers, grant course access, and decrement 1 available seat.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => setShowConfirmApprove(false)}
                      style={{
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#8c8ca5',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      style={{
                        padding: '0.55rem 1.35rem',
                        borderRadius: '8px',
                        background: '#00c896',
                        border: 'none',
                        color: '#0a0a0f',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        opacity: actionLoading ? 0.7 : 1,
                      }}
                    >
                      {actionLoading ? 'Approving...' : 'Yes, Approve & Activate'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div style={{
              padding: '1.1rem 1.75rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: '#13131d',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              <button
                onClick={closeReview}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#8c8ca5',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>

              {selectedAttempt.status === 'pending' && !rejectMode && !showConfirmApprove && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setRejectMode(true);
                      setShowConfirmApprove(false);
                    }}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '10px',
                      background: 'rgba(255,68,68,0.12)',
                      border: '1px solid rgba(255,68,68,0.3)',
                      color: '#ff6b6b',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    ✗ Reject Payment
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmApprove(true);
                      setRejectMode(false);
                    }}
                    style={{
                      padding: '0.6rem 1.5rem',
                      borderRadius: '10px',
                      background: '#00c896',
                      border: 'none',
                      color: '#0a0a0f',
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Approve Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
