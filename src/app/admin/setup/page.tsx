'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ setupSecret: '', name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setDone(true);
      toast.success('Super admin created! Please login.');
    } else {
      toast.error(data.error || 'Setup failed');
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#e8e8f0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1rem' }}>Setup Complete!</h2>
          <button onClick={() => router.push('/admin/login')} className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0d14, #1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'rgba(28,28,40,0.9)', border: '1px solid rgba(124,109,248,0.15)', borderRadius: '24px', padding: '3rem', width: '100%', maxWidth: '440px', backdropFilter: 'blur(20px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔐</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '700', color: '#e8e8f0', marginBottom: '0.25rem' }}>
            Initial Setup
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>Create your super admin account</p>
        </div>

        <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            { key: 'setupSecret', label: 'Setup Secret Key', type: 'password', ph: 'From your .env.local' },
            { key: 'name', label: 'Your Name', type: 'text', ph: 'Suraj' },
            { key: 'email', label: 'Email', type: 'email', ph: 'admin@codewithsuraj.com' },
            { key: 'password', label: 'Password', type: 'password', ph: 'Strong password (min 8 chars)' },
          ].map((f) => (
            <div key={f.key} className="form-group">
              <label className="form-label" htmlFor={`setup-${f.key}`} style={{ color: '#a8a8c0' }}>{f.label}</label>
              <input id={`setup-${f.key}`} type={f.type} placeholder={f.ph}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="form-input" required
                style={{ background: 'rgba(13,13,20,0.8)' }} />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
            {loading ? '⏳ Creating...' : '✅ Create Super Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
