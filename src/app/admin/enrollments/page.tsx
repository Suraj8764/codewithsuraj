'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

interface Enrollment {
  _id: string;
  candidateName: string;
  email: string;
  phone: string;
  courseId: { name: string; slug: string } | null;
  paymentId: { amount: number; status: string; razorpayPaymentId: string } | null;
  status: string;
  enrolledAt: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(255,184,0,0.1)', color: '#ffb800' },
  paid: { bg: 'rgba(0,200,150,0.1)', color: '#00c896' },
  confirmed: { bg: 'rgba(0,212,255,0.1)', color: '#00d4ff' },
  active: { bg: 'rgba(124,109,248,0.1)', color: '#9b8dfb' },
  completed: { bg: 'rgba(0,200,150,0.08)', color: '#00c896' },
  cancelled: { bg: 'rgba(255,68,68,0.1)', color: '#ff4444' },
};

export default function AdminEnrollmentsPage() {
  const { token } = useAdmin();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  function fetchEnrollments() {
    if (!token) return;
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '20');
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    fetch(`/api/enrollments?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setEnrollments(data.enrollments);
          setTotalPages(data.pagination.pages);
          setTotal(data.pagination.total);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchEnrollments(); }, [token, search, statusFilter, page]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/enrollments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast.success('Status updated'); fetchEnrollments(); }
    else toast.error('Failed to update');
  }

  function exportCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Course', 'Status', 'Payment', 'Amount', 'Date'];
    const rows = enrollments.map((e) => [
      e.candidateName, e.email, e.phone,
      e.courseId?.name || '', e.status,
      e.paymentId?.status || '', e.paymentId?.amount || '',
      new Date(e.createdAt).toLocaleDateString('en-IN'),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollments-${Date.now()}.csv`;
    a.click();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', marginBottom: '0.25rem' }}>
            Enrollments
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>{total} total enrollments</p>
        </div>
        <button onClick={exportCSV} className="btn btn-ghost btn-sm"
          style={{ border: '1px solid var(--admin-border)', color: '#e8e8f0' }}>
          📥 Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--admin-card)', border: '1px solid var(--admin-border)',
        borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
        display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#6b6b8a' }}>🔍</span>
          <input type="text" placeholder="Search by name, email, phone..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input" style={{ paddingLeft: '2.25rem', background: 'var(--admin-bg)' }}
            id="enrollments-search" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="form-input form-select" style={{ width: 'auto', minWidth: '140px', background: 'var(--admin-bg)' }}
          id="enrollments-filter-status">
          <option value="">All Status</option>
          {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b6b8a' }}>Loading enrollments...</div>
        ) : enrollments.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <p style={{ color: '#6b6b8a' }}>No enrollments found.</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    {['Candidate', 'Course', 'Status', 'Payment', 'Amount', 'Date', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6b8a' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((en, i) => (
                    <tr key={en._id}
                      style={{ borderBottom: i < enrollments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(124,109,248,0.03)'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: '600', color: '#e8e8f0', fontSize: '0.875rem' }}>{en.candidateName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b6b8a' }}>{en.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b6b8a' }}>{en.phone}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#a8a8c0' }}>{en.courseId?.name || '—'}</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <select
                          value={en.status}
                          onChange={(e) => updateStatus(en._id, e.target.value)}
                          style={{
                            background: STATUS_COLORS[en.status]?.bg,
                            color: STATUS_COLORS[en.status]?.color,
                            border: `1px solid ${STATUS_COLORS[en.status]?.color}44`,
                            padding: '0.3rem 0.6rem', borderRadius: '6px',
                            fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', appearance: 'none',
                          }}
                        >
                          {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{
                          background: en.paymentId?.status === 'paid' ? 'rgba(0,200,150,0.1)' : 'rgba(255,184,0,0.1)',
                          color: en.paymentId?.status === 'paid' ? '#00c896' : '#ffb800',
                          padding: '0.2rem 0.5rem', borderRadius: '5px', fontSize: '0.75rem', fontWeight: '600',
                        }}>
                          {en.paymentId?.status || 'No payment'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ color: '#00c896', fontWeight: '700', fontSize: '0.875rem' }}>
                          {en.paymentId?.amount ? `₹${en.paymentId.amount.toLocaleString('en-IN')}` : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#6b6b8a' }}>
                          {new Date(en.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <button style={{ padding: '0.3rem 0.6rem', background: 'rgba(124,109,248,0.1)', border: '1px solid rgba(124,109,248,0.2)', borderRadius: '6px', color: '#9b8dfb', fontSize: '0.78rem', cursor: 'pointer' }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem' }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      border: '1px solid', cursor: 'pointer',
                      borderColor: page === i + 1 ? 'rgba(124,109,248,0.4)' : 'var(--admin-border)',
                      background: page === i + 1 ? 'rgba(124,109,248,0.1)' : 'transparent',
                      color: page === i + 1 ? '#9b8dfb' : '#6b6b8a',
                      fontWeight: '600', fontSize: '0.875rem',
                    }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
