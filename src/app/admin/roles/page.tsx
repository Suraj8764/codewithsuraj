'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

interface AdminAccount {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'course_manager' | 'enrollment_manager' | 'content_manager';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

const ROLES_INFO = {
  super_admin: {
    label: 'Super Admin',
    color: '#9b8dfb',
    bg: 'rgba(124,109,248,0.15)',
    border: 'rgba(124,109,248,0.3)',
    desc: 'Unrestricted control over system settings, financials, course catalogs, team roles, and content.',
  },
  course_manager: {
    label: 'Course Manager',
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.15)',
    border: 'rgba(0,212,255,0.3)',
    desc: 'Manage courses, modules, lessons, batch schedules, and trainer profiles.',
  },
  enrollment_manager: {
    label: 'Enrollment Manager',
    color: '#00c896',
    bg: 'rgba(0,200,150,0.15)',
    border: 'rgba(0,200,150,0.3)',
    desc: 'Review candidate applications, verify manual UPI & Razorpay payments, approve student access.',
  },
  content_manager: {
    label: 'Content Manager',
    color: '#ffb800',
    bg: 'rgba(255,184,0,0.15)',
    border: 'rgba(255,184,0,0.3)',
    desc: 'Publish blog articles, manage testimonials, FAQs, promotional banners, and website copy.',
  },
};

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'content_manager' as keyof typeof ROLES_INFO,
  isActive: true,
};

export default function AdminRolesPage() {
  const { user, token } = useAdmin();
  const [users, setUsers] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<AdminAccount | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Password reset modal state
  const [passwordModalUser, setPasswordModalUser] = useState<AdminAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  const fetchUsers = useCallback(() => {
    if (!token) return;
    fetch('/api/admin/roles', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUsers(data.users || []);
        else if (data.error) toast.error(data.error);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function openAdd() {
    setEditUser(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  }

  function openEdit(u: AdminAccount) {
    setEditUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      isActive: u.isActive,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    if (!editUser && (!form.password || form.password.length < 6)) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      const url = editUser ? `/api/admin/roles/${editUser._id}` : '/api/admin/roles';
      const method = editUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editUser ? 'Admin updated!' : 'New admin created!');
        setShowModal(false);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to save admin user');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordModalUser) return;
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/roles/${passwordModalUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Password updated for ${passwordModalUser.name}`);
        setPasswordModalUser(null);
        setNewPassword('');
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setResettingPassword(false);
    }
  }

  async function toggleStatus(u: AdminAccount) {
    if (user?.id === u._id) {
      toast.error('You cannot deactivate your own account');
      return;
    }

    try {
      const res = await fetch(`/api/admin/roles/${u._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !u.isActive }),
      });

      if (res.ok) {
        toast.success(`Account ${!u.isActive ? 'activated' : 'deactivated'}`);
        fetchUsers();
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to change status');
      }
    } catch {
      toast.error('An error occurred');
    }
  }

  async function handleDelete(u: AdminAccount) {
    if (user?.id === u._id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete admin account "${u.name}" (${u.email})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/roles/${u._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Admin user removed');
        fetchUsers();
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to delete');
      }
    } catch {
      toast.error('An error occurred');
    }
  }

  if (user && user.role !== 'super_admin') {
    return (
      <div style={{
        background: 'var(--admin-card)',
        border: '1px solid rgba(255,68,68,0.2)',
        borderRadius: '16px',
        padding: '3rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
        <h2 style={{ color: '#ff4444', marginBottom: '0.5rem' }}>Access Restricted</h2>
        <p style={{ color: '#a8a8c0', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
          Admin Role & User Management is restricted to <strong>Super Admins</strong> only.
        </p>
      </div>
    );
  }

  const inputStyle = { background: 'rgba(13,13,20,0.8)' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', margin: 0 }}>
            Admin Roles & Team
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage staff accounts, assign granular role permissions, and track active sessions
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}
        >
          ➕ Add Admin User
        </button>
      </div>

      {/* Role Breakdown Reference Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {Object.entries(ROLES_INFO).map(([key, info]) => {
          const count = users.filter((u) => u.role === key).length;
          return (
            <div
              key={key}
              style={{
                background: 'var(--admin-card)',
                border: `1px solid ${info.border}`,
                borderRadius: '14px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  background: info.bg,
                  color: info.color,
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}>
                  {info.label}
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: info.color }}>
                  {count}
                </span>
              </div>
              <p style={{ color: '#6b6b8a', fontSize: '0.75rem', lineHeight: 1.4, margin: 0 }}>
                {info.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Admin Accounts Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b6b8a' }}>Loading team accounts...</div>
      ) : (
        <div style={{
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', color: '#e8e8f0' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--admin-border)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0' }}>User</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0' }}>Assigned Role</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0' }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0' }}>Last Login</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0' }}>Created</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const roleMeta = ROLES_INFO[u.role] || ROLES_INFO.content_manager;
                  const isCurrent = user?.id === u._id;
                  return (
                    <tr
                      key={u._id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124,109,248,0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: roleMeta.bg,
                            border: `1px solid ${roleMeta.border}`,
                            color: roleMeta.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.875rem',
                          }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#e8e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {u.name}
                              {isCurrent && (
                                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(124,109,248,0.2)', color: '#9b8dfb' }}>
                                  You
                                </span>
                              )}
                            </div>
                            <div style={{ color: '#6b6b8a', fontSize: '0.75rem' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          background: roleMeta.bg,
                          color: roleMeta.color,
                          border: `1px solid ${roleMeta.border}`,
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}>
                          {roleMeta.label}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          background: u.isActive ? 'rgba(0,200,150,0.15)' : 'rgba(255,68,68,0.15)',
                          color: u.isActive ? '#00c896' : '#ff4444',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b6b8a', fontSize: '0.8rem' }}>
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-IN') : 'Never'}
                      </td>
                      <td style={{ padding: '1rem', color: '#6b6b8a', fontSize: '0.8rem' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => { setPasswordModalUser(u); setNewPassword(''); }}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: '#ffb800' }}
                            title="Reset Password"
                          >
                            🔑
                          </button>
                          <button
                            onClick={() => openEdit(u)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: '#00d4ff' }}
                            title="Edit Role / Name"
                          >
                            ✏️
                          </button>
                          {!isCurrent && (
                            <>
                              <button
                                onClick={() => toggleStatus(u)}
                                className="btn btn-secondary"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: u.isActive ? '#ff4444' : '#00c896' }}
                                title={u.isActive ? 'Disable User' : 'Enable User'}
                              >
                                {u.isActive ? '⏸️' : '▶️'}
                              </button>
                              <button
                                onClick={() => handleDelete(u)}
                                className="btn btn-danger"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                                title="Delete User"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Admin Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--admin-card)',
            border: '1px solid var(--admin-border)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: '#e8e8f0', margin: 0 }}>
                {editUser ? '✏️ Edit Admin User' : '➕ Add New Admin User'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#6b6b8a', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-input"
                  style={inputStyle}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  placeholder="rahul@codewithsuraj.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-input"
                  style={inputStyle}
                  required
                />
              </div>

              {!editUser && (
                <div className="form-group">
                  <label className="form-label">Initial Password * (minimum 6 characters)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="form-input"
                    style={inputStyle}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Role & Permissions Level</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as keyof typeof ROLES_INFO })}
                  className="form-input"
                  style={inputStyle}
                >
                  <option value="content_manager">Content Manager (Blog, Testimonials, FAQs, Content)</option>
                  <option value="course_manager">Course Manager (Courses, Curriculums, Trainers)</option>
                  <option value="enrollment_manager">Enrollment Manager (Candidates, Payments verification)</option>
                  <option value="super_admin">Super Admin (All permissions & Team management)</option>
                </select>
                <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#6b6b8a' }}>
                  {ROLES_INFO[form.role]?.desc}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="userActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#7c6df8' }}
                />
                <label htmlFor="userActive" style={{ color: '#e8e8f0', fontSize: '0.875rem', cursor: 'pointer' }}>
                  Account is Active
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)', minWidth: '130px' }}
                >
                  {saving ? 'Saving...' : editUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {passwordModalUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--admin-card)',
            border: '1px solid var(--admin-border)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '450px',
            padding: '2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', color: '#e8e8f0', margin: 0 }}>
                🔑 Reset Password
              </h2>
              <button
                onClick={() => setPasswordModalUser(null)}
                style={{ background: 'transparent', border: 'none', color: '#6b6b8a', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#a8a8c0', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Enter a new secure password for <strong>{passwordModalUser.name}</strong> ({passwordModalUser.email}).
            </p>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">New Password (min 6 characters)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #ffb800, #ff8c00)', color: '#000', fontWeight: '700' }}
                >
                  {resettingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
