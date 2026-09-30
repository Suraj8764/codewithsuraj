'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

interface Trainer {
  _id: string;
  name: string;
  designation: string;
  bio: string;
  experience: number;
  skills: string[];
  photo: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  youtube?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const EMPTY_FORM = {
  name: '', designation: '', bio: '', experience: 0,
  skills: '', photo: '', linkedin: '', github: '', portfolio: '',
  twitter: '', youtube: '', isActive: true, order: 0,
};

export default function AdminTrainersPage() {
  const { token } = useAdmin();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function fetchTrainers() {
    fetch('/api/trainers', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setTrainers(d.trainers); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { if (token) fetchTrainers(); }, [token]);

  function openAdd() {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(t: Trainer) {
    setForm({
      name: t.name, designation: t.designation, bio: t.bio,
      experience: t.experience, skills: t.skills.join(', '),
      photo: t.photo || '', linkedin: t.linkedin || '',
      github: t.github || '', portfolio: t.portfolio || '',
      twitter: t.twitter || '', youtube: t.youtube || '',
      isActive: t.isActive, order: t.order,
    });
    setEditId(t._id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
    };
    const url = editId ? `/api/trainers/${editId}` : '/api/trainers';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(editId ? 'Trainer updated!' : 'Trainer added!');
      setShowForm(false);
      fetchTrainers();
    } else toast.error('Failed to save');
    setSaving(false);
  }

  async function toggleActive(t: Trainer) {
    await fetch(`/api/trainers/${t._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !t.isActive }),
    });
    fetchTrainers();
  }

  async function deleteTrainer(id: string) {
    if (!confirm('Delete this trainer?')) return;
    await fetch(`/api/trainers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast.success('Trainer deleted');
    fetchTrainers();
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.875rem',
    background: 'rgba(13,13,20,0.8)',
    border: '1px solid rgba(124,109,248,0.15)',
    borderRadius: '8px', color: '#e8e8f0',
    fontSize: '0.875rem', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', marginBottom: '0.25rem' }}>
            Trainers
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>{trainers.length} trainer{trainers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={openAdd} style={{
          padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #7c6df8, #00d4ff)',
          border: 'none', borderRadius: '10px', color: '#fff',
          fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
        }}>
          ➕ Add Trainer
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', marginBottom: '1.5rem' }}>
            {editId ? '✏️ Edit Trainer' : '➕ Add New Trainer'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { key: 'name', label: 'Full Name *', ph: 'Suraj Sahoo' },
              { key: 'designation', label: 'Designation *', ph: 'Senior Software Engineer' },
              { key: 'photo', label: 'Photo URL', ph: 'https://...' },
              { key: 'linkedin', label: 'LinkedIn URL', ph: 'https://linkedin.com/in/...' },
              { key: 'github', label: 'GitHub URL', ph: 'https://github.com/...' },
              { key: 'portfolio', label: 'Portfolio URL', ph: 'https://...' },
              { key: 'twitter', label: 'Twitter / X URL', ph: 'https://twitter.com/...' },
              { key: 'youtube', label: 'YouTube URL', ph: 'https://youtube.com/@...' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#a8a8c0', marginBottom: '0.4rem', fontWeight: '500' }}>{f.label}</label>
                <input
                  type="text" placeholder={f.ph}
                  value={form[f.key as keyof typeof form] as string}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  required={f.key === 'name' || f.key === 'designation'}
                  style={inputStyle}
                />
              </div>
            ))}

            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#a8a8c0', marginBottom: '0.4rem', fontWeight: '500' }}>Bio *</label>
              <textarea
                placeholder="Short bio about the trainer..."
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                required
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#a8a8c0', marginBottom: '0.4rem', fontWeight: '500' }}>Skills (comma-separated)</label>
              <input
                type="text" placeholder="React, Node.js, MongoDB, AWS..."
                value={form.skills}
                onChange={e => setForm({ ...form, skills: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#a8a8c0', marginBottom: '0.4rem', fontWeight: '500' }}>Years of Experience</label>
              <input
                type="number" min={0} max={50}
                value={form.experience}
                onChange={e => setForm({ ...form, experience: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#a8a8c0', marginBottom: '0.4rem', fontWeight: '500' }}>Display Order</label>
              <input
                type="number" min={0}
                value={form.order}
                onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox" id="t-active"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                style={{ accentColor: '#7c6df8', width: '16px', height: '16px' }}
              />
              <label htmlFor="t-active" style={{ fontSize: '0.875rem', color: '#a8a8c0', cursor: 'pointer' }}>Active (visible on website)</label>
            </div>

            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} style={{
                padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg, #7c6df8, #00d4ff)',
                border: 'none', borderRadius: '8px', color: '#fff',
                fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
              }}>
                {saving ? '⏳ Saving...' : '💾 Save Trainer'}
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

      {/* Trainers Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: '220px', background: 'rgba(124,109,248,0.04)', border: '1px solid var(--admin-border)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : trainers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b6b8a' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🏫</div>
          <h3 style={{ color: '#a8a8c0', marginBottom: '0.5rem' }}>No Trainers Yet</h3>
          <p style={{ fontSize: '0.875rem' }}>Add your first trainer to get started</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {trainers.map(t => (
            <div key={t._id} style={{
              background: 'var(--admin-card)', border: '1px solid var(--admin-border)',
              borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,109,248,0.3)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--admin-border)'}
            >
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    width: '56px', height: '56px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #7c6df8, #00d4ff)',
                    borderRadius: '12px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: '700', color: '#fff',
                  }}>
                    {t.photo ? <img src={t.photo} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : t.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: '#e8e8f0', fontSize: '1rem', marginBottom: '0.2rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#7c6df8', fontWeight: '600', marginBottom: '0.2rem' }}>{t.designation}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b6b8a' }}>{t.experience} yr{t.experience !== 1 ? 's' : ''} exp</div>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.6rem', borderRadius: '6px',
                    fontSize: '0.72rem', fontWeight: '700',
                    background: t.isActive ? 'rgba(0,200,150,0.1)' : 'rgba(255,68,68,0.1)',
                    color: t.isActive ? '#00c896' : '#ff4444',
                  }}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#a8a8c0', lineHeight: '1.5', marginBottom: '1rem',
                  display: expandedId === t._id ? 'block' : '-webkit-box',
                  WebkitLineClamp: expandedId === t._id ? undefined : 2,
                  WebkitBoxOrient: 'vertical', overflow: expandedId === t._id ? 'visible' : 'hidden',
                }}>
                  {t.bio}
                </p>

                {t.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                    {t.skills.slice(0, 4).map(s => (
                      <span key={s} style={{ padding: '0.2rem 0.5rem', background: 'rgba(124,109,248,0.1)', border: '1px solid rgba(124,109,248,0.2)', borderRadius: '4px', fontSize: '0.7rem', color: '#9b8dfb' }}>{s}</span>
                    ))}
                    {t.skills.length > 4 && <span style={{ fontSize: '0.7rem', color: '#6b6b8a', alignSelf: 'center' }}>+{t.skills.length - 4} more</span>}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => openEdit(t)} style={{
                    padding: '0.35rem 0.75rem', background: 'rgba(124,109,248,0.1)',
                    border: '1px solid rgba(124,109,248,0.2)', borderRadius: '6px',
                    color: '#9b8dfb', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                  }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => toggleActive(t)} style={{
                    padding: '0.35rem 0.75rem',
                    background: t.isActive ? 'rgba(255,68,68,0.08)' : 'rgba(0,200,150,0.08)',
                    border: `1px solid ${t.isActive ? 'rgba(255,68,68,0.2)' : 'rgba(0,200,150,0.2)'}`,
                    borderRadius: '6px',
                    color: t.isActive ? '#ff4444' : '#00c896',
                    fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                  }}>
                    {t.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                  </button>
                  <button onClick={() => deleteTrainer(t._id)} style={{
                    padding: '0.35rem 0.75rem', background: 'rgba(255,68,68,0.08)',
                    border: '1px solid rgba(255,68,68,0.15)', borderRadius: '6px',
                    color: '#ff4444', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                  }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
