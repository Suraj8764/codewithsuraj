'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push('/admin/dashboard');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d0d14 0%, #1a0a2e 50%, #0a1628 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '20%', left: '10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(124,109,248,0.1) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <div style={{
        background: 'rgba(28,28,40,0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(124,109,248,0.15)',
        borderRadius: '24px',
        padding: '3rem',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #7c6df8, #00d4ff)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: '800', color: '#fff',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 30px rgba(124,109,248,0.3)',
          }}>
            C
          </div>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#e8e8f0',
            marginBottom: '0.4rem',
          }}>
            Admin Login
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>CodeWithSuraj CMS</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,68,68,0.1)',
            border: '1px solid rgba(255,68,68,0.25)',
            borderRadius: '10px',
            padding: '0.875rem 1rem',
            marginBottom: '1.5rem',
            color: '#ff6b6b',
            fontSize: '0.875rem',
            display: 'flex',
            gap: '0.5rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email" style={{ color: '#a8a8c0' }}>Email Address</label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@codewithsuraj.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="form-input"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password" style={{ color: '#a8a8c0' }}>Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="form-input"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.875rem',
              fontSize: '1rem',
              marginTop: '0.5rem',
              background: 'linear-gradient(135deg, #7c6df8, #00d4ff)',
            }}
            id="admin-login-btn"
          >
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(124,109,248,0.05)',
          border: '1px solid rgba(124,109,248,0.1)',
          borderRadius: '10px',
          fontSize: '0.78rem',
          color: '#6b6b8a',
          textAlign: 'center',
        }}>
          First time? Use the{' '}
          <Link href="/admin/setup" style={{ color: '#9b8dfb' }}>Setup Page</Link>
          {' '}to create your super admin account.
        </div>
      </div>
    </div>
  );
}
