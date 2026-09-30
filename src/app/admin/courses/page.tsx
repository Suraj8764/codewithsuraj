'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  name: string;
  slug: string;
  category: string;
  level: string;
  price: number;
  discountPrice: number;
  currency: string;
  status: 'draft' | 'published' | 'archived';
  enrollmentStatus: 'open' | 'closed' | 'coming_soon';
  enrollmentCount: number;
  isFeatured: boolean;
  createdAt: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  published: { bg: 'rgba(0,200,150,0.1)', color: '#00c896' },
  draft: { bg: 'rgba(255,184,0,0.1)', color: '#ffb800' },
  archived: { bg: 'rgba(107,107,138,0.1)', color: '#6b6b8a' },
};

const ENROLL_STYLES: Record<string, { bg: string; color: string }> = {
  open: { bg: 'rgba(0,200,150,0.1)', color: '#00c896' },
  closed: { bg: 'rgba(255,68,68,0.1)', color: '#ff4444' },
  coming_soon: { bg: 'rgba(255,184,0,0.1)', color: '#ffb800' },
};

export default function AdminCoursesPage() {
  const { token } = useAdmin();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  function fetchCourses() {
    if (!token) return;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    fetch(`/api/courses?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (data.success) setCourses(data.courses); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchCourses(); }, [token, search, statusFilter]);

  async function handleStatusChange(id: string, status: string) {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Course ${status}`);
      fetchCourses();
    } else {
      toast.error('Failed to update status');
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      toast.success('Course deleted');
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } else {
      toast.error('Failed to delete');
    }
    setDeleting(null);
  }

  async function handleDuplicate(course: Course) {
    const newCourse = {
      ...course,
      name: `${course.name} (Copy)`,
      slug: `${course.slug}-copy-${Date.now()}`,
      status: 'draft',
      enrollmentStatus: 'coming_soon',
      enrollmentCount: 0,
    };
    delete (newCourse as { _id?: string })._id;

    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newCourse),
    });
    if (res.ok) {
      toast.success('Course duplicated as draft');
      fetchCourses();
    } else {
      toast.error('Failed to duplicate');
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', marginBottom: '0.25rem' }}>
            Courses
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>{courses.length} courses total</p>
        </div>
        <Link href="/admin/courses/new" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
          ➕ New Course
        </Link>
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--admin-card)',
        border: '1px solid var(--admin-border)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#6b6b8a' }}>🔍</span>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.25rem', background: 'var(--admin-bg)' }}
            id="admin-courses-search"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input form-select"
          style={{ width: 'auto', minWidth: '140px', background: 'var(--admin-bg)' }}
          id="admin-courses-filter-status"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--admin-card)',
        border: '1px solid var(--admin-border)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b6b8a' }}>
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <p style={{ color: '#6b6b8a', marginBottom: '1rem' }}>No courses found. Create your first course!</p>
            <Link href="/admin/courses/new" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
              Create Course
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                {['Course', 'Category', 'Price', 'Status', 'Enrollment', 'Students', 'Actions'].map((h) => (
                  <th key={h} style={{
                    padding: '1rem 1.25rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#6b6b8a',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map((course, i) => (
                <tr
                  key={course._id}
                  style={{
                    borderBottom: i < courses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(124,109,248,0.03)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#e8e8f0', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        {course.name}
                        {course.isFeatured && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#ffb800' }}>⭐ Featured</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b6b8a' }}>/courses/{course.slug}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.825rem', color: '#a8a8c0' }}>{course.category}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#00c896', fontSize: '0.9rem' }}>
                        {course.currency === 'INR' ? '₹' : ''}{(course.discountPrice || course.price).toLocaleString('en-IN')}
                      </div>
                      {course.discountPrice > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#6b6b8a', textDecoration: 'line-through' }}>
                          ₹{course.price.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <select
                      value={course.status}
                      onChange={(e) => handleStatusChange(course._id, e.target.value)}
                      style={{
                        background: STATUS_STYLES[course.status]?.bg,
                        color: STATUS_STYLES[course.status]?.color,
                        border: `1px solid ${STATUS_STYLES[course.status]?.color}44`,
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        appearance: 'none',
                      }}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      background: ENROLL_STYLES[course.enrollmentStatus]?.bg,
                      color: ENROLL_STYLES[course.enrollmentStatus]?.color,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                    }}>
                      {course.enrollmentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ color: '#a8a8c0', fontSize: '0.875rem', fontWeight: '600' }}>
                      {course.enrollmentCount}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Link
                        href={`/admin/courses/${course._id}/edit`}
                        style={{
                          padding: '0.3rem 0.6rem',
                          background: 'rgba(124,109,248,0.1)',
                          border: '1px solid rgba(124,109,248,0.2)',
                          borderRadius: '6px',
                          color: '#9b8dfb',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                        }}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/courses/${course._id}/curriculum`}
                        style={{
                          padding: '0.3rem 0.6rem',
                          background: 'rgba(0,212,255,0.1)',
                          border: '1px solid rgba(0,212,255,0.2)',
                          borderRadius: '6px',
                          color: '#00d4ff',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                        }}
                      >
                        Curriculum
                      </Link>
                      <button
                        onClick={() => handleDuplicate(course)}
                        style={{
                          padding: '0.3rem 0.6rem',
                          background: 'rgba(255,184,0,0.1)',
                          border: '1px solid rgba(255,184,0,0.2)',
                          borderRadius: '6px',
                          color: '#ffb800',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleDelete(course._id, course.name)}
                        disabled={deleting === course._id}
                        style={{
                          padding: '0.3rem 0.6rem',
                          background: 'rgba(255,68,68,0.1)',
                          border: '1px solid rgba(255,68,68,0.2)',
                          borderRadius: '6px',
                          color: '#ff4444',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        {deleting === course._id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
