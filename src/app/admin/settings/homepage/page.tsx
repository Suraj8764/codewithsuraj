'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

interface HomepageSettings {
  hero?: {
    headline?: string;
    subheadline?: string;
    description?: string;
    badge?: string;
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

export default function HomepageSettingsPage() {
  const { token } = useAdmin();
  const [settings, setSettings] = useState<HomepageSettings>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  useEffect(() => {
    fetch('/api/settings/homepage')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/settings/homepage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      toast.success('Homepage settings saved');
    } else {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  }

  const tabs = [
    { id: 'hero', label: '🎯 Hero Section' },
    { id: 'stats', label: '📊 Stats Section' },
    { id: 'features', label: '✨ Features Section' },
    { id: 'cta', label: '🚀 CTA Section' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', marginBottom: '0.25rem' }}>
            Homepage Settings
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>Customize homepage content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}
        >
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1rem',
                background: activeTab === tab.id ? 'rgba(124,109,248,0.1)' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'rgba(124,109,248,0.25)' : 'transparent'}`,
                borderRadius: '10px',
                color: activeTab === tab.id ? '#9b8dfb' : '#a8a8c0',
                fontWeight: activeTab === tab.id ? '600' : '400',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
          borderRadius: '16px',
          padding: '2rem',
        }}>
          {activeTab === 'hero' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '600', color: '#e8e8f0' }}>
                Hero Section
              </h2>
              <div className="form-group">
                <label className="form-label">Badge Text</label>
                <input
                  type="text"
                  value={settings.hero?.badge || ''}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, badge: e.target.value } })}
                  className="form-input"
                  style={{ background: 'rgba(13,13,20,0.8)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Headline</label>
                <input
                  type="text"
                  value={settings.hero?.headline || ''}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, headline: e.target.value } })}
                  className="form-input"
                  style={{ background: 'rgba(13,13,20,0.8)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subheadline</label>
                <input
                  type="text"
                  value={settings.hero?.subheadline || ''}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, subheadline: e.target.value } })}
                  className="form-input"
                  style={{ background: 'rgba(13,13,20,0.8)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={settings.hero?.description || ''}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, description: e.target.value } })}
                  className="form-input form-textarea"
                  style={{ background: 'rgba(13,13,20,0.8)', minHeight: '100px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Primary CTA</label>
                  <input
                    type="text"
                    value={settings.hero?.ctaPrimary || ''}
                    onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, ctaPrimary: e.target.value } })}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Secondary CTA</label>
                  <input
                    type="text"
                    value={settings.hero?.ctaSecondary || ''}
                    onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, ctaSecondary: e.target.value } })}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '600', color: '#e8e8f0' }}>
                Stats Section
              </h2>
              <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>Add up to 6 stats (value, label, icon, color)</p>
              {(settings.stats || []).map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(26,26,38,0.5)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                  gap: '0.75rem',
                }}>
                  <input
                    type="text"
                    placeholder="Value (e.g., 500+)"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...(settings.stats || [])];
                      newStats[i] = { ...stat, value: e.target.value };
                      setSettings({ ...settings, stats: newStats });
                    }}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  />
                  <input
                    type="text"
                    placeholder="Label"
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...(settings.stats || [])];
                      newStats[i] = { ...stat, label: e.target.value };
                      setSettings({ ...settings, stats: newStats });
                    }}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  />
                  <input
                    type="text"
                    placeholder="Icon (emoji)"
                    value={stat.icon}
                    onChange={(e) => {
                      const newStats = [...(settings.stats || [])];
                      newStats[i] = { ...stat, icon: e.target.value };
                      setSettings({ ...settings, stats: newStats });
                    }}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  />
                  <input
                    type="text"
                    placeholder="Color (hex)"
                    value={stat.color}
                    onChange={(e) => {
                      const newStats = [...(settings.stats || [])];
                      newStats[i] = { ...stat, color: e.target.value };
                      setSettings({ ...settings, stats: newStats });
                    }}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  />
                  <button
                    onClick={() => {
                      const newStats = (settings.stats || []).filter((_, idx) => idx !== i);
                      setSettings({ ...settings, stats: newStats });
                    }}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(255,68,68,0.1)',
                      border: '1px solid rgba(255,68,68,0.2)',
                      borderRadius: '8px',
                      color: '#ff4444',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {(settings.stats || []).length < 6 && (
                <button
                  onClick={() => {
                    setSettings({
                      ...settings,
                      stats: [...(settings.stats || []), { value: '', label: '', icon: '', color: '#6c63ff' }],
                    });
                  }}
                  className="btn btn-ghost"
                  style={{ border: '1px solid var(--admin-border)', color: '#e8e8f0' }}
                >
                  + Add Stat
                </button>
              )}
            </div>
          )}

          {activeTab === 'features' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '600', color: '#e8e8f0' }}>
                Features Section
              </h2>
              <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>Add features (icon, title, description, color)</p>
              {(settings.features || []).map((feature, i) => (
                <div key={i} style={{
                  background: 'rgba(26,26,38,0.5)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 2fr 100px auto',
                  gap: '0.75rem',
                }}>
                  <input
                    type="text"
                    placeholder="Icon"
                    value={feature.icon}
                    onChange={(e) => {
                      const newFeatures = [...(settings.features || [])];
                      newFeatures[i] = { ...feature, icon: e.target.value };
                      setSettings({ ...settings, features: newFeatures });
                    }}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  />
                  <input
                    type="text"
                    placeholder="Title"
                    value={feature.title}
                    onChange={(e) => {
                      const newFeatures = [...(settings.features || [])];
                      newFeatures[i] = { ...feature, title: e.target.value };
                      setSettings({ ...settings, features: newFeatures });
                    }}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={feature.description}
                    onChange={(e) => {
                      const newFeatures = [...(settings.features || [])];
                      newFeatures[i] = { ...feature, description: e.target.value };
                      setSettings({ ...settings, features: newFeatures });
                    }}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  />
                  <input
                    type="text"
                    placeholder="Color"
                    value={feature.color}
                    onChange={(e) => {
                      const newFeatures = [...(settings.features || [])];
                      newFeatures[i] = { ...feature, color: e.target.value };
                      setSettings({ ...settings, features: newFeatures });
                    }}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)' }}
                  />
                  <button
                    onClick={() => {
                      const newFeatures = (settings.features || []).filter((_, idx) => idx !== i);
                      setSettings({ ...settings, features: newFeatures });
                    }}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(255,68,68,0.1)',
                      border: '1px solid rgba(255,68,68,0.2)',
                      borderRadius: '8px',
                      color: '#ff4444',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setSettings({
                    ...settings,
                    features: [...(settings.features || []), { icon: '', title: '', description: '', color: '#6c63ff' }],
                  });
                }}
                className="btn btn-ghost"
                style={{ border: '1px solid var(--admin-border)', color: '#e8e8f0' }}
              >
                + Add Feature
              </button>
            </div>
          )}

          {activeTab === 'cta' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '600', color: '#e8e8f0' }}>
                CTA Section
              </h2>
              <div className="form-group">
                <label className="form-label">Badge Text</label>
                <input
                  type="text"
                  value={settings.cta?.badge || ''}
                  onChange={(e) => setSettings({ ...settings, cta: { ...settings.cta, badge: e.target.value } })}
                  className="form-input"
                  style={{ background: 'rgba(13,13,20,0.8)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Headline</label>
                <input
                  type="text"
                  value={settings.cta?.headline || ''}
                  onChange={(e) => setSettings({ ...settings, cta: { ...settings.cta, headline: e.target.value } })}
                  className="form-input"
                  style={{ background: 'rgba(13,13,20,0.8)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={settings.cta?.description || ''}
                  onChange={(e) => setSettings({ ...settings, cta: { ...settings.cta, description: e.target.value } })}
                  className="form-input form-textarea"
                  style={{ background: 'rgba(13,13,20,0.8)', minHeight: '100px' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
