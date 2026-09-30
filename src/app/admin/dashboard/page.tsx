'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '../AdminLayoutClient';
import Link from 'next/link';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface DashboardStats {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  paidEnrollments: number;
  pendingPayments: number;
  activeStudents: number;
  totalRevenue: number;
}

interface ChartData {
  enrollmentTrend: { _id: string; count: number }[];
  courseWiseEnrollments: { courseName: string; count: number }[];
  paymentStatusData: { _id: string; count: number }[];
}

const PIE_COLORS = ['#00c896', '#ff4444', '#ffb800', '#6c63ff'];

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{
      background: 'var(--admin-card)',
      border: '1px solid var(--admin-border)',
      borderRadius: '16px',
      padding: '1.5rem',
      transition: 'all 0.2s ease',
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${color}44`;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--admin-border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{
          width: '44px', height: '44px',
          background: `${color}18`,
          border: `1px solid ${color}33`,
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem',
        }}>{icon}</div>
      </div>
      <div style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize: '2rem',
        fontWeight: '800',
        color: color,
        lineHeight: 1,
        marginBottom: '0.4rem',
      }}>{typeof value === 'number' && label === 'Revenue' ? `₹${value.toLocaleString('en-IN')}` : value}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--admin-secondary)', fontWeight: '500' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { token } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setCharts(data.charts);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const QUICK_LINKS = [
    { label: 'Add New Course', href: '/admin/courses/new', icon: '➕', color: '#7c6df8' },
    { label: 'Manage Trainers', href: '/admin/trainers', icon: '👨‍🏫', color: '#00d4ff' },
    { label: 'View Enrollments', href: '/admin/enrollments', icon: '👥', color: '#00c896' },
    { label: 'Manage Content', href: '/admin/content', icon: '🎨', color: '#ffb800' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', marginBottom: '0.3rem' }}>
            Dashboard
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {QUICK_LINKS.slice(0, 2).map((ql) => (
            <Link key={ql.href} href={ql.href} className="btn btn-sm" style={{
              background: 'var(--admin-card)',
              border: '1px solid var(--admin-border)',
              color: '#e8e8f0',
              borderRadius: '10px',
            }}>
              {ql.icon} {ql.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : stats && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
            <StatCard icon="📚" label="Total Courses" value={stats.totalCourses} color="#7c6df8" />
            <StatCard icon="✅" label="Active Courses" value={stats.activeCourses} color="#00c896" />
            <StatCard icon="👥" label="Total Enrollments" value={stats.totalEnrollments} color="#00d4ff" />
            <StatCard icon="💳" label="Paid Enrollments" value={stats.paidEnrollments} color="#6c63ff" />
            <StatCard icon="⏳" label="Pending Payments" value={stats.pendingPayments} color="#ffb800" />
            <StatCard icon="💰" label="Revenue" value={stats.totalRevenue} color="#00c896" />
            <StatCard icon="🟢" label="Active Students" value={stats.activeStudents} color="#8b85ff" />
            <StatCard icon="🔥" label="Conversion Rate" value={`${stats.totalEnrollments > 0 ? Math.round((stats.paidEnrollments / stats.totalEnrollments) * 100) : 0}%`} color="#ff6b6b" />
          </div>

          {/* Charts */}
          {charts && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Enrollment Trend */}
              <div style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: '16px',
                padding: '1.5rem',
              }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: '600', color: '#e8e8f0', marginBottom: '1.5rem' }}>
                  📈 Enrollment Trend (Last 30 Days)
                </h3>
                {charts.enrollmentTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={charts.enrollmentTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="_id" tick={{ fill: '#6b6b8a', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#1c1c28', border: '1px solid rgba(124,109,248,0.2)', borderRadius: '8px', color: '#e8e8f0' }}
                        labelStyle={{ color: '#a8a8c0' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#7c6df8" strokeWidth={2.5} dot={{ fill: '#7c6df8', r: 3 }} name="Enrollments" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6b8a' }}>
                    No enrollment data yet
                  </div>
                )}
              </div>

              {/* Payment Status Pie */}
              <div style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: '16px',
                padding: '1.5rem',
              }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: '600', color: '#e8e8f0', marginBottom: '1.5rem' }}>
                  💳 Payment Status
                </h3>
                {charts.paymentStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={charts.paymentStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="count" nameKey="_id">
                        {charts.paymentStatusData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1c1c28', border: '1px solid rgba(124,109,248,0.2)', borderRadius: '8px', color: '#e8e8f0' }} />
                      <Legend formatter={(v) => <span style={{ color: '#a8a8c0', fontSize: '0.8rem', textTransform: 'capitalize' }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6b8a' }}>
                    No payment data yet
                  </div>
                )}
              </div>

              {/* Course-wise Enrollments */}
              {charts.courseWiseEnrollments.length > 0 && (
                <div style={{
                  background: 'var(--admin-card)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  gridColumn: '1 / -1',
                }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: '600', color: '#e8e8f0', marginBottom: '1.5rem' }}>
                    📊 Course-wise Enrollments
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={charts.courseWiseEnrollments} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis type="number" tick={{ fill: '#6b6b8a', fontSize: 11 }} />
                      <YAxis type="category" dataKey="courseName" tick={{ fill: '#a8a8c0', fontSize: 11 }} width={180} />
                      <Tooltip contentStyle={{ background: '#1c1c28', border: '1px solid rgba(124,109,248,0.2)', borderRadius: '8px', color: '#e8e8f0' }} />
                      <Bar dataKey="count" fill="#7c6df8" radius={[0, 6, 6, 0]} name="Enrollments" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Quick Links */}
      <div style={{
        background: 'var(--admin-card)',
        border: '1px solid var(--admin-border)',
        borderRadius: '16px',
        padding: '1.5rem',
      }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: '600', color: '#e8e8f0', marginBottom: '1.25rem' }}>
          ⚡ Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {QUICK_LINKS.map((ql) => (
            <Link
              key={ql.href}
              href={ql.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: `${ql.color}0d`,
                border: `1px solid ${ql.color}22`,
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = `${ql.color}18`;
                (e.currentTarget as HTMLAnchorElement).style.borderColor = `${ql.color}44`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = `${ql.color}0d`;
                (e.currentTarget as HTMLAnchorElement).style.borderColor = `${ql.color}22`;
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{ql.icon}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#e8e8f0' }}>{ql.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
