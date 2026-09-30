'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

export default function AdminTestimonialsPage() {
  const { token } = useAdmin();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', designation: '', company: '', review: '', rating: 5, photo: '', isPublished: false });

  function fetchTestimonials() {
    fetch('/api/testimonials', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.success) setTestimonials(d.testimonials); }).finally(() => setLoading(false));
  }

  useEffect(() => { if (token) fetchTestimonials(); }, [token]);

  async function addTestimonial(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) { toast.success('Testimonial added!'); setShowForm(false); fetchTestimonials(); }
    else toast.error('Failed to add');
  }

  async function togglePublish(id: string, current: boolean) {
    await fetch(`/api/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isPublished: !current }),
    });
    fetchTestimonials();
  }

  async function deleteTestimonial(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchTestimonials();
    toast.success('Deleted');
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', marginBottom: '0.25rem' }}>Testimonials</h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>{testimonials.length} testimonials</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
          {showForm ? '✕ Cancel' : '➕ Add Testimonial'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', marginBottom: '1.25rem' }}>Add Testimonial</h2>
          <form onSubmit={addTestimonial} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { key: 'name', label: 'Student Name', ph: 'Aditya Sharma' },
              { key: 'designation', label: 'Designation', ph: 'Software Engineer' },
              { key: 'company', label: 'Company', ph: 'TCS' },
              { key: 'photo', label: 'Photo URL', ph: 'https://...' },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input type="text" placeholder={f.ph} value={form[f.key as keyof typeof form] as string}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="form-input" style={{ background: 'rgba(13,13,20,0.8)' }} />
              </div>
            ))}
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Review *</label>
              <textarea placeholder="Write the testimonial review..." value={form.review}
                onChange={e => setForm({ ...form, review: e.target.value })}
                className="form-input form-textarea" style={{ background: 'rgba(13,13,20,0.8)', minHeight: '100px' }} required />
            </div>
            <div className="form-group">
              <label className="form-label">Rating (1-5)</label>
              <input type="number" min={1} max={5} value={form.rating}
                onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
                className="form-input" style={{ background: 'rgba(13,13,20,0.8)' }} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
              <input type="checkbox" id="t-publish" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} style={{ accentColor: '#7c6df8' }} />
              <label htmlFor="t-publish" style={{ fontSize: '0.875rem', color: '#a8a8c0', cursor: 'pointer' }}>Publish immediately</label>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
                💾 Save Testimonial
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: '#6b6b8a' }}>Loading...</div> :
          testimonials.length === 0 ? <div style={{ textAlign: 'center', padding: '4rem', color: '#6b6b8a' }}><div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⭐</div><p>No testimonials yet.</p></div> :
            testimonials.map(t => (
              <div key={t._id} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#e8e8f0', fontSize: '0.9rem' }}>{t.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#6b6b8a' }}>{t.designation} @ {t.company}</span>
                    <span style={{ color: '#ffb800', fontSize: '0.8rem' }}>{'★'.repeat(t.rating)}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#a8a8c0', lineHeight: 1.6 }}>"{t.review}"</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button onClick={() => togglePublish(t._id, t.isPublished)}
                    style={{ padding: '0.3rem 0.6rem', background: t.isPublished ? 'rgba(0,200,150,0.1)' : 'rgba(255,184,0,0.1)', border: '1px solid', borderColor: t.isPublished ? 'rgba(0,200,150,0.3)' : 'rgba(255,184,0,0.3)', borderRadius: '6px', color: t.isPublished ? '#00c896' : '#ffb800', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}>
                    {t.isPublished ? '✅ Published' : '⏸ Draft'}
                  </button>
                  <button onClick={() => deleteTestimonial(t._id)}
                    style={{ padding: '0.3rem 0.5rem', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '6px', color: '#ff4444', fontSize: '0.78rem', cursor: 'pointer' }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
