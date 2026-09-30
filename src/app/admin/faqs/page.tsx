'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  isGlobal: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const EMPTY_FORM = { question: '', answer: '', isGlobal: true, isActive: true, order: 0 };

export default function AdminFAQsPage() {
  const { token } = useAdmin();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFaqs = useCallback(() => {
    if (!token) return;
    fetch('/api/faqs', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setFaqs(d.faqs); })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  function openAdd() {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(f: FAQ) {
    setForm({ question: f.question, answer: f.answer, isGlobal: f.isGlobal, isActive: f.isActive, order: f.order });
    setEditId(f._id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editId ? `/api/faqs/${editId}` : '/api/faqs';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success(editId ? 'FAQ updated!' : 'FAQ added!');
      setShowForm(false);
      fetchFaqs();
    } else toast.error('Failed to save');
    setSaving(false);
  }

  async function toggleActive(faq: FAQ) {
    await fetch(`/api/faqs/${faq._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !faq.isActive }),
    });
    fetchFaqs();
  }

  async function deleteFaq(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    await fetch(`/api/faqs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast.success('FAQ deleted');
    fetchFaqs();
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.875rem',
    background: 'rgba(13,13,20,0.8)', border: '1px solid rgba(124,109,248,0.15)',
    borderRadius: '8px', color: '#e8e8f0', fontSize: '0.875rem',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', marginBottom: '0.25rem' }}>FAQs</h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>{faqs.length} question{faqs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} style={{
          padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #7c6df8, #00d4ff)',
          border: 'none', borderRadius: '10px', color: '#fff',
          fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
        }}>
          ➕ Add FAQ
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', marginBottom: '1.5rem' }}>
            {editId ? '✏️ Edit FAQ' : '➕ New FAQ'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#a8a8c0', marginBottom: '0.4rem', fontWeight: '500' }}>Question *</label>
              <input type="text" required placeholder="What is this course about?" value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#a8a8c0', marginBottom: '0.4rem', fontWeight: '500' }}>Answer *</label>
              <textarea required rows={4} placeholder="Detailed answer..." value={form.answer}
                onChange={e => setForm({ ...form, answer: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#a8a8c0', marginBottom: '0.4rem', fontWeight: '500' }}>Display Order</label>
                <input type="number" min={0} value={form.order}
                  onChange={e => setForm({ ...form, order: Number(e.target.value) })} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isGlobal} onChange={e => setForm({ ...form, isGlobal: e.target.checked })} style={{ accentColor: '#7c6df8' }} />
                  <span style={{ fontSize: '0.875rem', color: '#a8a8c0' }}>Global FAQ (show on homepage)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ accentColor: '#7c6df8' }} />
                  <span style={{ fontSize: '0.875rem', color: '#a8a8c0' }}>Active (visible)</span>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} style={{
                padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg, #7c6df8, #00d4ff)',
                border: 'none', borderRadius: '8px', color: '#fff',
                fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
              }}>
                {saving ? '⏳ Saving...' : '💾 Save FAQ'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                padding: '0.625rem 1.25rem', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                color: '#a8a8c0', fontSize: '0.875rem', cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: '80px', background: 'rgba(124,109,248,0.04)', border: '1px solid var(--admin-border)', borderRadius: '12px' }} />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b6b8a' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❓</div>
          <h3 style={{ color: '#a8a8c0', marginBottom: '0.5rem' }}>No FAQs Yet</h3>
          <p style={{ fontSize: '0.875rem' }}>Add your first FAQ to get started</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map(faq => (
            <div key={faq._id} style={{
              background: 'var(--admin-card)', border: '1px solid var(--admin-border)',
              borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s ease',
            }}>
              <div
                onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', cursor: 'pointer' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: '600', color: '#e8e8f0', fontSize: '0.9rem' }}>{faq.question}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {faq.isGlobal && <span style={{ padding: '0.15rem 0.5rem', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '4px', fontSize: '0.7rem', color: '#00d4ff' }}>Global</span>}
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600',
                      background: faq.isActive ? 'rgba(0,200,150,0.1)' : 'rgba(255,68,68,0.1)',
                      color: faq.isActive ? '#00c896' : '#ff4444',
                    }}>{faq.isActive ? 'Active' : 'Inactive'}</span>
                    <span style={{ fontSize: '0.72rem', color: '#6b6b8a' }}>Order: {faq.order}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(faq)} style={{
                    padding: '0.3rem 0.65rem', background: 'rgba(124,109,248,0.1)',
                    border: '1px solid rgba(124,109,248,0.2)', borderRadius: '6px',
                    color: '#9b8dfb', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                  }}>✏️</button>
                  <button onClick={() => toggleActive(faq)} style={{
                    padding: '0.3rem 0.65rem',
                    background: faq.isActive ? 'rgba(255,68,68,0.08)' : 'rgba(0,200,150,0.08)',
                    border: `1px solid ${faq.isActive ? 'rgba(255,68,68,0.2)' : 'rgba(0,200,150,0.2)'}`,
                    borderRadius: '6px', color: faq.isActive ? '#ff4444' : '#00c896',
                    fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                  }}>{faq.isActive ? '🔴' : '🟢'}</button>
                  <button onClick={() => deleteFaq(faq._id)} style={{
                    padding: '0.3rem 0.65rem', background: 'rgba(255,68,68,0.08)',
                    border: '1px solid rgba(255,68,68,0.15)', borderRadius: '6px',
                    color: '#ff4444', fontSize: '0.78rem', cursor: 'pointer',
                  }}>🗑️</button>
                </div>
                <span style={{ color: '#6b6b8a', fontSize: '0.8rem', flexShrink: 0 }}>{expandedId === faq._id ? '▲' : '▼'}</span>
              </div>
              {expandedId === faq._id && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--admin-border)' }}>
                  <p style={{ color: '#a8a8c0', fontSize: '0.875rem', lineHeight: '1.6', marginTop: '1rem' }}>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
