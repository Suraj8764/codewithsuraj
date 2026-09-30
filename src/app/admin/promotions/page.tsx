'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

interface Promotion {
  _id: string;
  title: string;
  description: string;
  cta: string;
  ctaUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  type: 'banner' | 'popup' | 'topbar';
  backgroundColor: string;
  textColor: string;
  createdAt: string;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  cta: '',
  ctaUrl: '',
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  isActive: true,
  type: 'topbar' as 'banner' | 'popup' | 'topbar',
  backgroundColor: '#7c6df8',
  textColor: '#ffffff',
};

export default function AdminPromotionsPage() {
  const { token } = useAdmin();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const fetchPromotions = useCallback(() => {
    if (!token) return;
    fetch('/api/promotions', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPromotions(data.promotions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  function openAdd() {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setShowModal(true);
  }

  function openEdit(promo: Promotion) {
    setForm({
      title: promo.title,
      description: promo.description || '',
      cta: promo.cta || '',
      ctaUrl: promo.ctaUrl || '',
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().slice(0, 16) : EMPTY_FORM.startDate,
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().slice(0, 16) : EMPTY_FORM.endDate,
      isActive: promo.isActive,
      type: promo.type || 'topbar',
      backgroundColor: promo.backgroundColor || '#7c6df8',
      textColor: promo.textColor || '#ffffff',
    });
    setEditId(promo._id);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const url = editId ? `/api/promotions/${editId}` : '/api/promotions';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editId ? 'Promotion updated!' : 'Promotion created!');
        setShowModal(false);
        fetchPromotions();
      } else {
        toast.error(data.error || 'Failed to save promotion');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(promo: Promotion) {
    try {
      const res = await fetch(`/api/promotions/${promo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      if (res.ok) {
        toast.success(`Promotion ${!promo.isActive ? 'activated' : 'deactivated'}`);
        fetchPromotions();
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('An error occurred');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Promotion deleted');
        fetchPromotions();
      } else {
        toast.error('Failed to delete promotion');
      }
    } catch {
      toast.error('An error occurred');
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', margin: 0 }}>
            Promotions & Announcements
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage promotional topbars, hero banners, and popup offers
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}
        >
          ➕ Add Promotion
        </button>
      </div>

      {/* Grid of Promotions */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b6b8a' }}>Loading promotions...</div>
      ) : promotions.length === 0 ? (
        <div style={{
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📣</div>
          <h3 style={{ color: '#e8e8f0', marginBottom: '0.5rem' }}>No promotions yet</h3>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Create announcement banners or offer topbars to show across your site.
          </p>
          <button onClick={openAdd} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
            ➕ Create First Promotion
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {promotions.map((promo) => {
            const isExpired = new Date(promo.endDate) < new Date();
            return (
              <div
                key={promo._id}
                style={{
                  background: 'var(--admin-card)',
                  border: `1px solid ${promo.isActive ? 'rgba(124,109,248,0.3)' : 'var(--admin-border)'}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Live Preview Strip */}
                <div
                  style={{
                    background: promo.backgroundColor,
                    color: promo.textColor,
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                    {promo.title}
                  </span>
                  {promo.cta && (
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '20px',
                        background: 'rgba(255,255,255,0.25)',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {promo.cta} →
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.06)',
                      color: '#a8a8c0',
                    }}>
                      {promo.type}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      background: promo.isActive && !isExpired ? 'rgba(0,200,150,0.15)' : 'rgba(255,68,68,0.15)',
                      color: promo.isActive && !isExpired ? '#00c896' : '#ff4444',
                    }}>
                      {isExpired ? 'EXPIRED' : promo.isActive ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>

                  {promo.description && (
                    <p style={{ color: '#a8a8c0', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                      {promo.description}
                    </p>
                  )}

                  <div style={{ fontSize: '0.8rem', color: '#6b6b8a', marginBottom: '1.25rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>🔗 URL: <span style={{ color: '#9b8dfb' }}>{promo.ctaUrl || 'None'}</span></div>
                    <div>📅 Valid: {new Date(promo.startDate).toLocaleDateString('en-IN')} – {new Date(promo.endDate).toLocaleDateString('en-IN')}</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--admin-border)', paddingTop: '1rem' }}>
                    <button
                      onClick={() => toggleStatus(promo)}
                      className="btn btn-secondary"
                      style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}
                    >
                      {promo.isActive ? '⏸️ Pause' : '▶️ Activate'}
                    </button>
                    <button
                      onClick={() => openEdit(promo)}
                      className="btn btn-secondary"
                      style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', color: '#00d4ff' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(promo._id)}
                      className="btn btn-danger"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Drawer for Add/Edit */}
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: '#e8e8f0', margin: 0 }}>
                {editId ? '✏️ Edit Promotion' : '➕ Create New Promotion'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#6b6b8a', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Live Preview Inside Modal */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Real-time Preview</label>
              <div style={{
                background: form.backgroundColor,
                color: form.textColor,
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                  {form.title || 'Special Promotion Headline Here'}
                </div>
                {form.cta && (
                  <span style={{
                    padding: '0.3rem 0.8rem',
                    background: 'rgba(255,255,255,0.25)',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                  }}>
                    {form.cta} →
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Promotion Title *</label>
                <input
                  type="text"
                  placeholder="e.g. 🎉 Diwali Flash Sale: 40% OFF all batches!"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="form-input"
                  style={{ background: 'rgba(13,13,20,0.8)' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional offer details or promo codes..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="form-input form-textarea"
                  style={{ background: 'rgba(13,13,20,0.8)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">CTA Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Claim Offer"
                    value={form.cta}
                    onChange={(e) => setForm({ ...form, cta: e.target.value })}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target URL</label>
                  <input
                    type="text"
                    placeholder="e.g. /courses or #enroll"
                    value={form.ctaUrl}
                    onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Banner Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'banner' | 'popup' | 'topbar' })}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  >
                    <option value="topbar">Top Bar</option>
                    <option value="banner">Hero Banner</option>
                    <option value="popup">Popup Modal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Background Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={form.backgroundColor}
                      onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                      style={{ width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'none' }}
                    />
                    <input
                      type="text"
                      value={form.backgroundColor}
                      onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                      className="form-input"
                      style={{ background: 'rgba(13,13,20,0.8)', flex: 1 }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Text Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={form.textColor}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      style={{ width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'none' }}
                    />
                    <input
                      type="text"
                      value={form.textColor}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      className="form-input"
                      style={{ background: 'rgba(13,13,20,0.8)', flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#7c6df8' }}
                />
                <label htmlFor="isActive" style={{ color: '#e8e8f0', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Set Active immediately upon saving
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
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
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
