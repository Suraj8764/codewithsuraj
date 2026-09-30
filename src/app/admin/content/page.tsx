'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

interface HomepageSettings {
  hero?: {
    badge?: string;
    headline?: string;
    subheadline?: string;
    description?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
  };
  stats?: Array<{
    value: string;
    label: string;
    icon: string;
    color: string;
  }>;
  features?: Array<{
    icon: string;
    title: string;
    description: string;
    color: string;
  }>;
  cta?: {
    badge?: string;
    headline?: string;
    description?: string;
  };
}

const DEFAULT_HERO = {
  badge: 'Enrollments Open — Limited Seats Available',
  headline: 'Master Full Stack Development',
  subheadline: 'with Expert Mentorship',
  description: 'Learn MERN Stack, Full Stack .NET, Python, React, Node.js & AI from real-world industry experts. Build projects that get you hired.',
  ctaPrimary: '🚀 Explore Courses',
  ctaSecondary: 'Meet the Trainer',
};

const DEFAULT_STATS = [
  { value: '10,000+', label: 'Active Learners', icon: '👨‍🎓', color: '#7c6df8' },
  { value: '95%', label: 'Placement Rate', icon: '💼', color: '#00c896' },
  { value: '4.9/5', label: 'Average Rating', icon: '⭐', color: '#ffb800' },
  { value: '50+', label: 'Production Projects', icon: '🚀', color: '#00d4ff' },
];

const DEFAULT_FEATURES = [
  { icon: '🎯', title: '1-on-1 Mentorship', description: 'Personalized code reviews and interview prep from veteran developers.', color: '#7c6df8' },
  { icon: '💻', title: 'Real Industry Projects', description: 'Build scalable fullstack SaaS applications with production deployment.', color: '#00c896' },
  { icon: '🚀', title: 'Placement Assistance', description: 'Resume crafting, mock technical interviews, and hiring partner connections.', color: '#00d4ff' },
  { icon: '♾️', title: 'Lifetime Access', description: 'Continuous access to updated curriculum, recorded sessions, and community.', color: '#ffb800' },
];

const DEFAULT_CTA = {
  badge: 'Start Your Journey Today',
  headline: 'Ready to Level Up Your Tech Career?',
  description: 'Join hundreds of successful developers working at top tech firms. Limited batch size ensures personalized attention.',
};

export default function AdminContentPage() {
  const { token } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'features' | 'cta' | 'hub'>('hero');

  const [hero, setHero] = useState(DEFAULT_HERO);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [cta, setCta] = useState(DEFAULT_CTA);

  useEffect(() => {
    if (!token) return;
    fetch('/api/settings/homepage')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.hero) setHero({ ...DEFAULT_HERO, ...s.hero });
          if (Array.isArray(s.stats) && s.stats.length > 0) setStats(s.stats);
          if (Array.isArray(s.features) && s.features.length > 0) setFeatures(s.features);
          if (s.cta) setCta({ ...DEFAULT_CTA, ...s.cta });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave() {
    setSaving(true);
    const payload = {
      hero,
      stats,
      features,
      cta,
    };

    try {
      const res = await fetch('/api/settings/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Website content saved & published!');
      } else {
        toast.error('Failed to save content');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  }

  function updateStat(index: number, key: string, value: string) {
    setStats((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  }

  function addStat() {
    setStats((prev) => [...prev, { value: '100+', label: 'New Metric', icon: '✨', color: '#7c6df8' }]);
  }

  function removeStat(index: number) {
    setStats((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFeature(index: number, key: string, value: string) {
    setFeatures((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  }

  function addFeature() {
    setFeatures((prev) => [
      ...prev,
      { icon: '⭐', title: 'New Feature', description: 'Description of key benefit.', color: '#00c896' },
    ]);
  }

  function removeFeature(index: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  }

  const inputStyle = { background: 'rgba(13,13,20,0.8)' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', margin: 0 }}>
            Content Management
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Customize homepage hero, stats, features, banners, and navigate all content modules
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/" target="_blank" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
            👁️ Live Website
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)', minWidth: '140px' }}
          >
            {saving ? 'Saving...' : '💾 Save & Publish'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'hero', label: '🚀 Hero Section' },
          { id: 'stats', label: '📊 Key Numbers' },
          { id: 'features', label: '✨ Feature Highlights' },
          { id: 'cta', label: '📣 Bottom CTA' },
          { id: 'hub', label: '🗂️ Content Directory' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              background: activeTab === tab.id ? 'rgba(124,109,248,0.2)' : 'transparent',
              border: `1px solid ${activeTab === tab.id ? 'rgba(124,109,248,0.4)' : 'transparent'}`,
              color: activeTab === tab.id ? '#9b8dfb' : '#a8a8c0',
              fontWeight: activeTab === tab.id ? '600' : '400',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b6b8a' }}>Loading content settings...</div>
      ) : (
        <div>
          {/* Hero Tab */}
          {activeTab === 'hero' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
              {/* Form Controls */}
              <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', color: '#e8e8f0', margin: 0 }}>
                  Homepage Hero Banner
                </h2>

                <div className="form-group">
                  <label className="form-label">Top Badge / Announcement Tag</label>
                  <input
                    type="text"
                    value={hero.badge}
                    onChange={(e) => setHero({ ...hero, badge: e.target.value })}
                    className="form-input"
                    style={inputStyle}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Main Headline</label>
                  <input
                    type="text"
                    value={hero.headline}
                    onChange={(e) => setHero({ ...hero, headline: e.target.value })}
                    className="form-input"
                    style={inputStyle}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subheadline (Gradient Highlight)</label>
                  <input
                    type="text"
                    value={hero.subheadline}
                    onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
                    className="form-input"
                    style={inputStyle}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Lead Description</label>
                  <textarea
                    rows={3}
                    value={hero.description}
                    onChange={(e) => setHero({ ...hero, description: e.target.value })}
                    className="form-input form-textarea"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Primary CTA Button</label>
                    <input
                      type="text"
                      value={hero.ctaPrimary}
                      onChange={(e) => setHero({ ...hero, ctaPrimary: e.target.value })}
                      className="form-input"
                      style={inputStyle}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Secondary CTA Button</label>
                    <input
                      type="text"
                      value={hero.ctaSecondary}
                      onChange={(e) => setHero({ ...hero, ctaSecondary: e.target.value })}
                      className="form-input"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Preview */}
              <div style={{ background: '#0a0a10', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 12, right: 16, fontSize: '0.75rem', color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Live Preview
                </div>
                <div style={{ display: 'inline-flex', padding: '0.3rem 0.8rem', borderRadius: '20px', background: 'rgba(124,109,248,0.15)', border: '1px solid rgba(124,109,248,0.3)', color: '#9b8dfb', fontSize: '0.75rem', fontWeight: '600', width: 'fit-content', marginBottom: '1.25rem' }}>
                  {hero.badge || 'Announcement'}
                </div>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: '800', color: '#fff', lineHeight: 1.2, margin: '0 0 0.5rem 0' }}>
                  {hero.headline}
                </h1>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: '800', background: 'linear-gradient(135deg, #7c6df8, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1rem 0' }}>
                  {hero.subheadline}
                </h2>
                <p style={{ color: '#a8a8c0', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {hero.description}
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)', padding: '0.6rem 1.25rem' }}>
                    {hero.ctaPrimary}
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem' }}>
                    {hero.ctaSecondary}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', color: '#e8e8f0', margin: 0 }}>
                    Homepage Metric Counters
                  </h2>
                  <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Numbers displayed immediately below the hero section
                  </p>
                </div>
                <button onClick={addStat} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
                  ➕ Add Stat
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(13,13,20,0.8)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6b6b8a', fontWeight: '600' }}>#{idx + 1}</span>
                      <button
                        onClick={() => removeStat(idx)}
                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '0.5rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Icon</label>
                        <input
                          type="text"
                          value={stat.icon}
                          onChange={(e) => updateStat(idx, 'icon', e.target.value)}
                          className="form-input"
                          style={{ textAlign: 'center' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Value (e.g. 10k+)</label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => updateStat(idx, 'value', e.target.value)}
                          className="form-input"
                          style={{ fontWeight: '700', color: stat.color }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Label Title</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStat(idx, 'label', e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Accent Color</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={stat.color}
                          onChange={(e) => updateStat(idx, 'color', e.target.value)}
                          style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', background: 'none', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          value={stat.color}
                          onChange={(e) => updateStat(idx, 'color', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', color: '#e8e8f0', margin: 0 }}>
                    Why Choose Us / Feature Highlights
                  </h2>
                  <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Value proposition cards showcasing key platform differentiators
                  </p>
                </div>
                <button onClick={addFeature} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
                  ➕ Add Feature
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(13,13,20,0.8)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{feat.icon}</span>
                        <span style={{ fontWeight: '600', color: feat.color, fontSize: '0.9rem' }}>{feat.title}</span>
                      </div>
                      <button
                        onClick={() => removeFeature(idx)}
                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '0.5rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Icon</label>
                        <input
                          type="text"
                          value={feat.icon}
                          onChange={(e) => updateFeature(idx, 'icon', e.target.value)}
                          className="form-input"
                          style={{ textAlign: 'center' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Title</label>
                        <input
                          type="text"
                          value={feat.title}
                          onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Description</label>
                      <textarea
                        rows={2}
                        value={feat.description}
                        onChange={(e) => updateFeature(idx, 'description', e.target.value)}
                        className="form-input form-textarea"
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Accent Color</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={feat.color}
                          onChange={(e) => updateFeature(idx, 'color', e.target.value)}
                          style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', background: 'none', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          value={feat.color}
                          onChange={(e) => updateFeature(idx, 'color', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Tab */}
          {activeTab === 'cta' && (
            <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '2rem', maxWidth: '700px' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', color: '#e8e8f0', marginBottom: '1.5rem' }}>
                Bottom Call to Action Banner
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Badge Tag</label>
                  <input
                    type="text"
                    value={cta.badge}
                    onChange={(e) => setCta({ ...cta, badge: e.target.value })}
                    className="form-input"
                    style={inputStyle}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Headline</label>
                  <input
                    type="text"
                    value={cta.headline}
                    onChange={(e) => setCta({ ...cta, headline: e.target.value })}
                    className="form-input"
                    style={inputStyle}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description Text</label>
                  <textarea
                    rows={3}
                    value={cta.description}
                    onChange={(e) => setCta({ ...cta, description: e.target.value })}
                    className="form-input form-textarea"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Content Directory / Quick Hub */}
          {activeTab === 'hub' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[
                { title: '⭐ Testimonials', desc: 'Manage student reviews, star ratings, and company tags', href: '/admin/testimonials', color: '#ffb800' },
                { title: '❓ FAQs', desc: 'Add frequently asked questions and category answers', href: '/admin/faqs', color: '#00d4ff' },
                { title: '📝 Blog Articles', desc: 'Publish technical tutorials, industry guides, and news', href: '/admin/blog', color: '#7c6df8' },
                { title: '📣 Promotions & Banners', desc: 'Manage flash sales, coupon banners, and sticky topbars', href: '/admin/promotions', color: '#ff4444' },
                { title: '👨‍🏫 Trainers & Faculty', desc: 'Update mentor bios, credentials, and social links', href: '/admin/trainers', color: '#00c896' },
                { title: '⚙️ Global Site Settings', desc: 'Configure site logo, SEO metadata, contact info, and socials', href: '/admin/settings', color: '#a8a8c0' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    background: 'var(--admin-card)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '16px',
                    padding: '1.75rem',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.color;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--admin-border)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', color: '#e8e8f0', margin: '0 0 0.5rem 0' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#6b6b8a', fontSize: '0.875rem', margin: '0 0 1rem 0', lineHeight: 1.5, flex: 1 }}>
                    {item.desc}
                  </p>
                  <span style={{ color: item.color, fontSize: '0.85rem', fontWeight: '600' }}>
                    Open Manager →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Save Sticky Bar */}
      {activeTab !== 'hub' && (
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem 2rem',
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <span style={{ color: '#a8a8c0', fontSize: '0.875rem' }}>
            Remember to save changes to make them live on the public website.
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)', minWidth: '150px' }}
          >
            {saving ? 'Saving...' : '💾 Save & Publish'}
          </button>
        </div>
      )}
    </div>
  );
}
