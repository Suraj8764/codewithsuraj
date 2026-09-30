'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

const CATEGORIES = ['Full Stack', 'Frontend', 'Backend', 'Database', 'AI & ML', 'Python', 'Interview Prep', 'Custom Training'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const CLASS_MODES = ['Online', 'Offline', 'Hybrid'];
const ENROLLMENT_STATUSES = ['open', 'closed', 'coming_soon'];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function NewCoursePage() {
  const router = useRouter();
  const { token } = useAdmin();
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    category: 'Full Stack',
    level: 'All Levels',
    duration: '',
    price: 0,
    discountPrice: 0,
    currency: 'INR',
    thumbnail: '',
    heroImage: '',
    technologies: '',
    skillsCovered: '',
    learningOutcomes: '',
    requirements: '',
    whoIsThisFor: '',
    classMode: 'Online',
    classTimings: '',
    numberOfSessions: 0,
    enrollmentStatus: 'coming_soon',
    maxSeats: 30,
    isFeatured: false,
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  const sections = [
    { id: 'basic', label: '📝 Basic Info' },
    { id: 'description', label: '📄 Description' },
    { id: 'pricing', label: '💰 Pricing' },
    { id: 'curriculum', label: '📚 Details' },
    { id: 'enrollment', label: '📅 Enrollment' },
    { id: 'seo', label: '🔍 SEO' },
  ];

  async function handleSave(status = 'draft') {
    if (!form.name || !form.slug || !form.shortDescription) {
      toast.error('Name, slug and short description are required');
      return;
    }
    setSaving(true);

    const body = {
      ...form,
      status,
      technologies: form.technologies.split('\n').map((s) => s.trim()).filter(Boolean),
      skillsCovered: form.skillsCovered.split('\n').map((s) => s.trim()).filter(Boolean),
      learningOutcomes: form.learningOutcomes.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
      whoIsThisFor: form.whoIsThisFor.split('\n').map((s) => s.trim()).filter(Boolean),
      seoKeywords: form.seoKeywords.split(',').map((s) => s.trim()).filter(Boolean),
    };

    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(status === 'published' ? 'Course published!' : 'Course saved as draft');
      router.push(`/admin/courses/${data.course._id}/edit`);
    } else {
      toast.error(data.error || 'Failed to save course');
      setSaving(false);
    }
  }

  function update(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'name' && !form.slug) {
      setForm((prev) => ({ ...prev, name: value as string, slug: slugify(value as string) }));
    }
  }

  const inputStyle = { background: 'rgba(13,13,20,0.8)' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', marginBottom: '0.25rem' }}>
            New Course
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>Create a new course for your platform</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: '10px', border: '1px solid var(--admin-border)', color: '#e8e8f0' }}
          >
            💾 Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="btn btn-primary btn-sm"
            style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)', borderRadius: '10px' }}
          >
            🚀 Publish
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
        {/* Left Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                padding: '0.75rem 1rem',
                background: activeSection === s.id ? 'rgba(124,109,248,0.1)' : 'transparent',
                border: `1px solid ${activeSection === s.id ? 'rgba(124,109,248,0.25)' : 'transparent'}`,
                borderRadius: '10px',
                color: activeSection === s.id ? '#9b8dfb' : '#a8a8c0',
                fontWeight: activeSection === s.id ? '600' : '400',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s ease',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div style={{
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
          borderRadius: '16px',
          padding: '2rem',
        }}>
          {/* BASIC */}
          {activeSection === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '600', color: '#e8e8f0', marginBottom: '0.5rem' }}>
                Basic Information
              </h2>

              <div className="form-group">
                <label className="form-label" htmlFor="course-name">Course Name *</label>
                <input id="course-name" type="text" placeholder="e.g. MERN Stack Development" value={form.name}
                  onChange={(e) => { update('name', e.target.value); update('slug', slugify(e.target.value)); }}
                  className="form-input" style={inputStyle} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="course-slug">URL Slug *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                    color: '#6b6b8a', fontSize: '0.85rem',
                  }}>/courses/</span>
                  <input id="course-slug" type="text" placeholder="mern-stack-development" value={form.slug}
                    onChange={(e) => update('slug', slugify(e.target.value))}
                    className="form-input" style={{ ...inputStyle, paddingLeft: '6rem' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="course-short-desc">Short Description *</label>
                <textarea id="course-short-desc" placeholder="One-line description shown on course cards..."
                  value={form.shortDescription} onChange={(e) => update('shortDescription', e.target.value)}
                  className="form-input form-textarea" style={{ ...inputStyle, minHeight: '80px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={form.category} onChange={(e) => update('category', e.target.value)}
                    className="form-input form-select" style={inputStyle}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select value={form.level} onChange={(e) => update('level', e.target.value)}
                    className="form-input form-select" style={inputStyle}>
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input type="text" placeholder="e.g. 3 Months" value={form.duration}
                    onChange={(e) => update('duration', e.target.value)}
                    className="form-input" style={inputStyle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Class Mode</label>
                  <select value={form.classMode} onChange={(e) => update('classMode', e.target.value)}
                    className="form-input form-select" style={inputStyle}>
                    {CLASS_MODES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Thumbnail URL</label>
                  <input type="url" placeholder="https://..." value={form.thumbnail}
                    onChange={(e) => update('thumbnail', e.target.value)}
                    className="form-input" style={inputStyle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hero Image URL</label>
                  <input type="url" placeholder="https://..." value={form.heroImage}
                    onChange={(e) => update('heroImage', e.target.value)}
                    className="form-input" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="checkbox" id="is-featured" checked={form.isFeatured}
                  onChange={(e) => update('isFeatured', e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#7c6df8' }} />
                <label htmlFor="is-featured" style={{ fontSize: '0.875rem', color: '#a8a8c0', cursor: 'pointer' }}>
                  ⭐ Feature this course on homepage
                </label>
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          {activeSection === 'description' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '600', color: '#e8e8f0' }}>
                Detailed Content
              </h2>
              <div className="form-group">
                <label className="form-label">Full Description</label>
                <textarea placeholder="Comprehensive course overview..."
                  value={form.fullDescription} onChange={(e) => update('fullDescription', e.target.value)}
                  className="form-input form-textarea" style={{ ...inputStyle, minHeight: '150px' }} />
              </div>
              {[
                { key: 'technologies', label: 'Technologies (one per line)', ph: 'React.js\nNode.js\nMongoDB' },
                { key: 'skillsCovered', label: 'Skills Covered (one per line)', ph: 'API Development\nState Management' },
                { key: 'learningOutcomes', label: 'Learning Outcomes (one per line)', ph: 'Build full-stack apps\nDeploy to cloud' },
                { key: 'requirements', label: 'Requirements (one per line)', ph: 'Basic JavaScript\nComputer with internet' },
                { key: 'whoIsThisFor', label: 'Who Is This For? (one per line)', ph: 'Beginners in web development\nCareer switchers' },
              ].map(({ key, label, ph }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <textarea placeholder={ph}
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => update(key, e.target.value)}
                    className="form-input form-textarea" style={{ ...inputStyle, minHeight: '100px' }} />
                </div>
              ))}
            </div>
          )}

          {/* PRICING */}
          {activeSection === 'pricing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '600', color: '#e8e8f0' }}>
                Pricing Configuration
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Regular Price</label>
                  <input type="number" placeholder="25000" value={form.price}
                    onChange={(e) => update('price', Number(e.target.value))}
                    className="form-input" style={inputStyle} min={0} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price (0 = no discount)</label>
                  <input type="number" placeholder="18999" value={form.discountPrice}
                    onChange={(e) => update('discountPrice', Number(e.target.value))}
                    className="form-input" style={inputStyle} min={0} />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select value={form.currency} onChange={(e) => update('currency', e.target.value)}
                    className="form-input form-select" style={inputStyle}>
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                  </select>
                </div>
              </div>
              {form.price > 0 && form.discountPrice > 0 && (
                <div style={{
                  background: 'rgba(0,200,150,0.08)',
                  border: '1px solid rgba(0,200,150,0.2)',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  color: '#00c896',
                }}>
                  💰 Discount: {Math.round(((form.price - form.discountPrice) / form.price) * 100)}% off —
                  Student saves {form.currency === 'INR' ? '₹' : '$'}{(form.price - form.discountPrice).toLocaleString('en-IN')}
                </div>
              )}
            </div>
          )}

          {/* CURRICULUM / DETAILS */}
          {activeSection === 'curriculum' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '600', color: '#e8e8f0' }}>
                Class Details
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Class Timings</label>
                  <input type="text" placeholder="e.g. Mon-Fri, 7-9 PM IST" value={form.classTimings}
                    onChange={(e) => update('classTimings', e.target.value)}
                    className="form-input" style={inputStyle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Sessions</label>
                  <input type="number" placeholder="60" value={form.numberOfSessions}
                    onChange={(e) => update('numberOfSessions', Number(e.target.value))}
                    className="form-input" style={inputStyle} min={0} />
                </div>
              </div>
              <div style={{
                background: 'rgba(124,109,248,0.06)',
                border: '1px solid rgba(124,109,248,0.15)',
                borderRadius: '10px',
                padding: '1rem',
                fontSize: '0.875rem',
                color: '#9b8dfb',
              }}>
                💡 After saving the course, go to the Curriculum tab to add modules and topics.
              </div>
            </div>
          )}

          {/* ENROLLMENT */}
          {activeSection === 'enrollment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '600', color: '#e8e8f0' }}>
                Enrollment Settings
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Enrollment Status</label>
                  <select value={form.enrollmentStatus} onChange={(e) => update('enrollmentStatus', e.target.value)}
                    className="form-input form-select" style={inputStyle}>
                    {ENROLLMENT_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Max Seats</label>
                  <input type="number" value={form.maxSeats}
                    onChange={(e) => update('maxSeats', Number(e.target.value))}
                    className="form-input" style={inputStyle} min={1} />
                </div>
              </div>
            </div>
          )}

          {/* SEO */}
          {activeSection === 'seo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '600', color: '#e8e8f0' }}>
                SEO Settings
              </h2>
              <div className="form-group">
                <label className="form-label">Meta Title</label>
                <input type="text" placeholder={form.name || 'Course name'} value={form.seoTitle}
                  onChange={(e) => update('seoTitle', e.target.value)}
                  className="form-input" style={inputStyle} />
              </div>
              <div className="form-group">
                <label className="form-label">Meta Description</label>
                <textarea placeholder="SEO description (150–160 chars)..." value={form.seoDescription}
                  onChange={(e) => update('seoDescription', e.target.value)}
                  className="form-input form-textarea" style={{ ...inputStyle, minHeight: '100px' }} />
                <span style={{ fontSize: '0.75rem', color: form.seoDescription.length > 160 ? '#ff4444' : '#6b6b8a' }}>
                  {form.seoDescription.length}/160 characters
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Keywords (comma-separated)</label>
                <input type="text" placeholder="mern stack, react, node.js..." value={form.seoKeywords}
                  onChange={(e) => update('seoKeywords', e.target.value)}
                  className="form-input" style={inputStyle} />
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--admin-border)' }}>
            <button onClick={() => handleSave('draft')} disabled={saving} className="btn btn-ghost btn-sm"
              style={{ border: '1px solid var(--admin-border)', color: '#e8e8f0' }}>
              {saving ? '⏳ Saving...' : '💾 Save Draft'}
            </button>
            <button onClick={() => handleSave('published')} disabled={saving} className="btn btn-primary btn-sm"
              style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
              🚀 Publish Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
