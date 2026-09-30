'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { token } = useAdmin();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const [general, setGeneral] = useState({ siteName: 'CodeWithSuraj', tagline: 'Learn. Build. Excel.', logoUrl: '', faviconUrl: '', description: '' });
  const [contact, setContact] = useState({ email: '', phone: '', whatsapp: '', address: '' });
  const [social, setSocial] = useState({ linkedin: '', github: '', instagram: '', youtube: '', facebook: '' });
  const [seo, setSeo] = useState({ metaTitle: '', metaDescription: '', keywords: '', ogImage: '' });

  useEffect(() => {
    if (!token) return;
    fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const s = data.settings;
          if (s.general) setGeneral({ ...general, ...s.general });
          if (s.contact) setContact({ ...contact, ...s.contact });
          if (s.social) setSocial({ ...social, ...s.social });
          if (s.seo) setSeo({ ...seo, ...s.seo });
        }
      });
  }, [token]);

  async function saveSection(section: string, data: Record<string, unknown>) {
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ section, data }),
    });
    if (res.ok) toast.success('Settings saved!');
    else toast.error('Failed to save');
    setSaving(false);
  }

  const tabs = [
    { id: 'general', label: '🌐 General' },
    { id: 'contact', label: '📞 Contact' },
    { id: 'social', label: '📱 Social' },
    { id: 'seo', label: '🔍 SEO' },
    { id: 'homepage', label: '🏠 Homepage' },
    { id: 'payment', label: '💳 Payment' },
  ];

  const inputStyle = { background: 'rgba(13,13,20,0.8)' };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', marginBottom: '0.25rem' }}>
          Site Settings
        </h1>
        <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>Manage global website configuration</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: '10px',
              background: activeTab === t.id ? 'rgba(124,109,248,0.15)' : 'transparent',
              border: `1px solid ${activeTab === t.id ? 'rgba(124,109,248,0.35)' : 'var(--admin-border)'}`,
              color: activeTab === t.id ? '#9b8dfb' : '#a8a8c0',
              fontWeight: activeTab === t.id ? '600' : '400',
              fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '2rem' }}>

        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', marginBottom: '0.5rem' }}>General Settings</h2>
            {[
              { label: 'Website Name', key: 'siteName', type: 'text', ph: 'CodeWithSuraj' },
              { label: 'Tagline', key: 'tagline', type: 'text', ph: 'Learn. Build. Excel.' },
              { label: 'Logo URL', key: 'logoUrl', type: 'url', ph: 'https://...' },
              { label: 'Favicon URL', key: 'faviconUrl', type: 'url', ph: 'https://...' },
              { label: 'Site Description', key: 'description', type: 'textarea', ph: 'What your platform does...' },
            ].map((f) => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea placeholder={f.ph} value={general[f.key as keyof typeof general]}
                    onChange={(e) => setGeneral({ ...general, [f.key]: e.target.value })}
                    className="form-input form-textarea" style={{ ...inputStyle, minHeight: '80px' }} />
                ) : (
                  <input type={f.type} placeholder={f.ph} value={general[f.key as keyof typeof general]}
                    onChange={(e) => setGeneral({ ...general, [f.key]: e.target.value })}
                    className="form-input" style={inputStyle} />
                )}
              </div>
            ))}
            <button onClick={() => saveSection('general', general)} disabled={saving} className="btn btn-primary"
              style={{ width: 'fit-content', background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
              {saving ? 'Saving...' : '💾 Save General Settings'}
            </button>
          </div>
        )}

        {activeTab === 'contact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', marginBottom: '0.5rem' }}>Contact Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: '📧 Email', key: 'email', ph: 'hello@codewithsuraj.com' },
                { label: '📱 Phone', key: 'phone', ph: '+91 98765 43210' },
                { label: '💬 WhatsApp', key: 'whatsapp', ph: '+91 98765 43210' },
              ].map((f) => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input type="text" placeholder={f.ph} value={contact[f.key as keyof typeof contact]}
                    onChange={(e) => setContact({ ...contact, [f.key]: e.target.value })}
                    className="form-input" style={inputStyle} />
                </div>
              ))}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">🏢 Address</label>
                <textarea placeholder="Your office address..." value={contact.address}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  className="form-input form-textarea" style={{ ...inputStyle, minHeight: '80px' }} />
              </div>
            </div>
            <button onClick={() => saveSection('contact', contact)} disabled={saving} className="btn btn-primary"
              style={{ width: 'fit-content', background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
              {saving ? 'Saving...' : '💾 Save Contact Info'}
            </button>
          </div>
        )}

        {activeTab === 'social' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', marginBottom: '0.5rem' }}>Social Links</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: '💼 LinkedIn', key: 'linkedin' },
                { label: '🐙 GitHub', key: 'github' },
                { label: '📸 Instagram', key: 'instagram' },
                { label: '▶️ YouTube', key: 'youtube' },
                { label: '📘 Facebook', key: 'facebook' },
              ].map((f) => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input type="url" placeholder="https://..." value={social[f.key as keyof typeof social]}
                    onChange={(e) => setSocial({ ...social, [f.key]: e.target.value })}
                    className="form-input" style={inputStyle} />
                </div>
              ))}
            </div>
            <button onClick={() => saveSection('social', social)} disabled={saving} className="btn btn-primary"
              style={{ width: 'fit-content', background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
              {saving ? 'Saving...' : '💾 Save Social Links'}
            </button>
          </div>
        )}

        {activeTab === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', marginBottom: '0.5rem' }}>SEO Settings</h2>
            {[
              { label: 'Default Meta Title', key: 'metaTitle', ph: 'CodeWithSuraj — Learn. Build. Excel.' },
              { label: 'Default Meta Description', key: 'metaDescription', ph: 'Master modern tech skills...', type: 'textarea' },
              { label: 'Keywords (comma-separated)', key: 'keywords', ph: 'coding courses, mern stack, web development' },
              { label: 'OG Image URL', key: 'ogImage', ph: 'https://...' },
            ].map((f) => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea placeholder={f.ph} value={seo[f.key as keyof typeof seo]}
                    onChange={(e) => setSeo({ ...seo, [f.key]: e.target.value })}
                    className="form-input form-textarea" style={{ ...inputStyle, minHeight: '80px' }} />
                ) : (
                  <input type="text" placeholder={f.ph} value={seo[f.key as keyof typeof seo]}
                    onChange={(e) => setSeo({ ...seo, [f.key]: e.target.value })}
                    className="form-input" style={inputStyle} />
                )}
              </div>
            ))}
            <button onClick={() => saveSection('seo', seo)} disabled={saving} className="btn btn-primary"
              style={{ width: 'fit-content', background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
              {saving ? 'Saving...' : '💾 Save SEO Settings'}
            </button>
          </div>
        )}

        {activeTab === 'payment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', marginBottom: '0.5rem' }}>Payment Configuration</h2>
            <div style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '10px', padding: '1rem', fontSize: '0.875rem', color: '#ffb800' }}>
              ⚠️ Razorpay keys are configured via environment variables (.env.local) for security. Do not store API keys in the database.
            </div>
            <div style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#a8a8c0', marginBottom: '0.75rem', fontWeight: '600' }}>Current Config (from .env.local):</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem', color: '#6b6b8a' }}>
                <div>RAZORPAY_KEY_ID: {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.slice(0, 10)}...</div>
                <div>RAZORPAY_KEY_SECRET: **** (hidden)</div>
                <div>Default Currency: INR</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'homepage' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', marginBottom: '0.5rem' }}>Homepage Content</h2>
            <div style={{ background: 'rgba(124,109,248,0.08)', border: '1px solid rgba(124,109,248,0.2)', borderRadius: '10px', padding: '1rem', fontSize: '0.875rem', color: '#9b8dfb' }}>
              ℹ️ Manage hero section, stats, features, and CTA content. Changes reflect immediately on the homepage.
            </div>
            <Link href="/admin/settings/homepage" className="btn btn-primary" style={{ width: 'fit-content', background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
              🎨 Open Homepage Editor
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
