'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

const CATEGORIES = ['Full Stack', 'Frontend', 'Backend', 'Database', 'AI & ML', 'Python', 'Interview Prep', 'Custom Training'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const CLASS_MODES = ['Online', 'Offline', 'Hybrid'];
const ENROLLMENT_STATUSES = ['open', 'closed', 'coming_soon'];

interface Trainer {
  _id: string;
  name: string;
  designation: string;
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const router = useRouter();
  const { token, user } = useAdmin();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [trainersList, setTrainersList] = useState<Trainer[]>([]);

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
    trainers: [] as string[],
  });

  useEffect(() => {
    if (!token) return;

    // Fetch trainers
    fetch('/api/trainers', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTrainersList(d.trainers);
      })
      .catch(() => {});

    // Fetch course data
    fetch(`/api/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.course) {
          const c = data.course;
          setForm({
            name: c.name || '',
            slug: c.slug || '',
            shortDescription: c.shortDescription || '',
            fullDescription: c.fullDescription || '',
            category: c.category || 'Full Stack',
            level: c.level || 'All Levels',
            duration: c.duration || '',
            price: c.price || 0,
            discountPrice: c.discountPrice || 0,
            currency: c.currency || 'INR',
            thumbnail: c.thumbnail || '',
            heroImage: c.heroImage || '',
            technologies: Array.isArray(c.technologies) ? c.technologies.join('\n') : '',
            skillsCovered: Array.isArray(c.skillsCovered) ? c.skillsCovered.join('\n') : '',
            learningOutcomes: Array.isArray(c.learningOutcomes) ? c.learningOutcomes.join('\n') : '',
            requirements: Array.isArray(c.requirements) ? c.requirements.join('\n') : '',
            whoIsThisFor: Array.isArray(c.whoIsThisFor) ? c.whoIsThisFor.join('\n') : '',
            classMode: c.classMode || 'Online',
            classTimings: c.classTimings || '',
            numberOfSessions: c.numberOfSessions || 0,
            enrollmentStatus: c.enrollmentStatus || 'coming_soon',
            maxSeats: c.maxSeats || 30,
            isFeatured: Boolean(c.isFeatured),
            status: c.status || 'draft',
            seoTitle: c.seoTitle || '',
            seoDescription: c.seoDescription || '',
            seoKeywords: Array.isArray(c.seoKeywords) ? c.seoKeywords.join(', ') : '',
            trainers: Array.isArray(c.trainers)
              ? c.trainers.map((t: unknown) => (typeof t === 'object' && t !== null && '_id' in t ? (t as { _id: string })._id : String(t)))
              : [],
          });
        } else {
          toast.error(data.error || 'Course not found');
          router.push('/admin/courses');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load course details');
      })
      .finally(() => setLoading(false));
  }, [courseId, token, router]);

  async function handleSave(newStatus?: string) {
    if (!form.name || !form.slug || !form.shortDescription) {
      toast.error('Name, slug and short description are required');
      return;
    }
    setSaving(true);

    const body = {
      ...form,
      status: newStatus || form.status,
      technologies: form.technologies.split('\n').map((s) => s.trim()).filter(Boolean),
      skillsCovered: form.skillsCovered.split('\n').map((s) => s.trim()).filter(Boolean),
      learningOutcomes: form.learningOutcomes.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
      whoIsThisFor: form.whoIsThisFor.split('\n').map((s) => s.trim()).filter(Boolean),
      seoKeywords: form.seoKeywords.split(',').map((s) => s.trim()).filter(Boolean),
      price: Number(form.price),
      discountPrice: Number(form.discountPrice),
      maxSeats: Number(form.maxSeats),
      numberOfSessions: Number(form.numberOfSessions),
    };

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Course updated successfully!');
        if (newStatus) setForm((p) => ({ ...p, status: newStatus }));
      } else {
        toast.error(data.error || 'Failed to update course');
      }
    } catch {
      toast.error('Error saving course');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Course deleted');
        router.push('/admin/courses');
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to delete course');
      }
    } catch {
      toast.error('Error deleting course');
    } finally {
      setDeleting(false);
    }
  }

  function update(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTrainer(trainerId: string) {
    setForm((prev) => {
      const exists = prev.trainers.includes(trainerId);
      return {
        ...prev,
        trainers: exists ? prev.trainers.filter((id) => id !== trainerId) : [...prev.trainers, trainerId],
      };
    });
  }

  const sections = [
    { id: 'basic', label: '📝 Basic Info' },
    { id: 'description', label: '📄 Description' },
    { id: 'pricing', label: '💰 Pricing' },
    { id: 'curriculum', label: '📚 Curriculum & Lists' },
    { id: 'enrollment', label: '📅 Enrollment & Batches' },
    { id: 'trainers', label: '👨‍🏫 Trainers' },
    { id: 'seo', label: '🔍 SEO & Meta' },
  ];

  const inputStyle = { background: 'rgba(13,13,20,0.8)' };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#6b6b8a' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
        <p>Loading course information...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Link href="/admin/courses" style={{ color: '#7c6df8', textDecoration: 'none', fontSize: '0.875rem' }}>
              ← Back to Courses
            </Link>
            <span style={{ color: '#444' }}>|</span>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              background: form.status === 'published' ? 'rgba(0,200,150,0.15)' : 'rgba(255,184,0,0.15)',
              color: form.status === 'published' ? '#00c896' : '#ffb800',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              {form.status}
            </span>
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', margin: 0 }}>
            {form.name || 'Edit Course'}
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            ID: <span style={{ fontFamily: 'monospace', color: '#a8a8c0' }}>{courseId}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            href={`/courses/${form.slug}`}
            target="_blank"
            className="btn btn-secondary"
            style={{ fontSize: '0.875rem', padding: '0.6rem 1rem' }}
          >
            👁️ View Public Page
          </Link>
          <Link
            href={`/admin/courses/${courseId}/curriculum`}
            className="btn btn-secondary"
            style={{ fontSize: '0.875rem', padding: '0.6rem 1rem', borderColor: 'rgba(0,212,255,0.3)', color: '#00d4ff' }}
          >
            📖 Curriculum Topics
          </Link>
          {form.status !== 'published' ? (
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #00c896, #00a876)', fontSize: '0.875rem', padding: '0.6rem 1.25rem' }}
            >
              🚀 Publish Now
            </button>
          ) : (
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.6rem 1rem', color: '#ffb800' }}
            >
              📥 Unpublish (Draft)
            </button>
          )}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)', fontSize: '0.875rem', padding: '0.6rem 1.5rem' }}
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
          {user?.role === 'super_admin' && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-danger"
              style={{ fontSize: '0.875rem', padding: '0.6rem 1rem' }}
            >
              {deleting ? 'Deleting...' : '🗑️ Delete'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.75rem' }}>
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              background: activeSection === s.id ? 'rgba(124,109,248,0.2)' : 'transparent',
              border: `1px solid ${activeSection === s.id ? 'rgba(124,109,248,0.4)' : 'transparent'}`,
              color: activeSection === s.id ? '#9b8dfb' : '#a8a8c0',
              fontWeight: activeSection === s.id ? '600' : '400',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Form Container */}
      <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '2rem' }}>
        {/* Basic Section */}
        {activeSection === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', margin: 0 }}>Basic Course Info</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Course Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => update('slug', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Level</label>
                <select
                  value={form.level}
                  onChange={(e) => update('level', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 12 Weeks / 80 Hours"
                  value={form.duration}
                  onChange={(e) => update('duration', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Thumbnail Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={form.thumbnail}
                  onChange={(e) => update('thumbnail', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hero / Cover Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={form.heroImage}
                  onChange={(e) => update('heroImage', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', color: '#e8e8f0', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => update('isFeatured', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#7c6df8' }}
                />
                ⭐ Feature this course on Homepage
              </label>
            </div>
          </div>
        )}

        {/* Description Section */}
        {activeSection === 'description' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', margin: 0 }}>Course Descriptions</h2>

            <div className="form-group">
              <label className="form-label">Short Description * (shown on course cards)</label>
              <textarea
                rows={3}
                value={form.shortDescription}
                onChange={(e) => update('shortDescription', e.target.value)}
                className="form-input form-textarea"
                style={inputStyle}
                placeholder="Brief summary of the course..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Detailed Description (supports Markdown formatting)</label>
              <textarea
                rows={10}
                value={form.fullDescription}
                onChange={(e) => update('fullDescription', e.target.value)}
                className="form-input form-textarea"
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.875rem' }}
                placeholder="Comprehensive breakdown of the curriculum, objectives, and journey..."
              />
            </div>
          </div>
        )}

        {/* Pricing Section */}
        {activeSection === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', margin: 0 }}>Pricing & Discount</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Original Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => update('price', Number(e.target.value))}
                  className="form-input"
                  style={inputStyle}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Discounted / Offer Price (₹)</label>
                <input
                  type="number"
                  value={form.discountPrice}
                  onChange={(e) => update('discountPrice', Number(e.target.value))}
                  className="form-input"
                  style={inputStyle}
                />
                <span style={{ fontSize: '0.75rem', color: '#00c896', marginTop: '0.3rem', display: 'block' }}>
                  {form.price > 0 && form.discountPrice > 0 && form.price > form.discountPrice
                    ? `${Math.round(((form.price - form.discountPrice) / form.price) * 100)}% OFF`
                    : 'Set lower than original price for discount tag'}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Currency</label>
                <input
                  type="text"
                  value={form.currency}
                  onChange={(e) => update('currency', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* Curriculum & Lists Section */}
        {activeSection === 'curriculum' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', margin: 0 }}>
                Skills, Technologies & Outcomes
              </h2>
              <Link
                href={`/admin/courses/${courseId}/curriculum`}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', color: '#7c6df8', borderColor: 'rgba(124,109,248,0.3)' }}
              >
                Go to Modules & Topics Editor →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Technologies (one per line)</label>
                <textarea
                  rows={5}
                  value={form.technologies}
                  onChange={(e) => update('technologies', e.target.value)}
                  className="form-input form-textarea"
                  style={inputStyle}
                  placeholder={'React\nNode.js\nMongoDB\nTypeScript'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills Covered (one per line)</label>
                <textarea
                  rows={5}
                  value={form.skillsCovered}
                  onChange={(e) => update('skillsCovered', e.target.value)}
                  className="form-input form-textarea"
                  style={inputStyle}
                  placeholder={'REST API Design\nState Management\nAuthentication'}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Learning Outcomes (one per line)</label>
                <textarea
                  rows={4}
                  value={form.learningOutcomes}
                  onChange={(e) => update('learningOutcomes', e.target.value)}
                  className="form-input form-textarea"
                  style={inputStyle}
                  placeholder={'Build 5 production-ready fullstack apps\nMaster async architecture'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Requirements / Prerequisites (one per line)</label>
                <textarea
                  rows={4}
                  value={form.requirements}
                  onChange={(e) => update('requirements', e.target.value)}
                  className="form-input form-textarea"
                  style={inputStyle}
                  placeholder={'Basic JavaScript knowledge\nA laptop with internet'}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Who Is This Course For? (one per line)</label>
              <textarea
                rows={3}
                value={form.whoIsThisFor}
                onChange={(e) => update('whoIsThisFor', e.target.value)}
                className="form-input form-textarea"
                style={inputStyle}
                placeholder={'Aspiring full-stack developers\nFrontend devs wanting backend knowledge'}
              />
            </div>
          </div>
        )}

        {/* Enrollment & Batches */}
        {activeSection === 'enrollment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', margin: 0 }}>Enrollment & Schedule</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Enrollment Status</label>
                <select
                  value={form.enrollmentStatus}
                  onChange={(e) => update('enrollmentStatus', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                >
                  {ENROLLMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Class Mode</label>
                <select
                  value={form.classMode}
                  onChange={(e) => update('classMode', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                >
                  {CLASS_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Max Seats per Batch</label>
                <input
                  type="number"
                  value={form.maxSeats}
                  onChange={(e) => update('maxSeats', Number(e.target.value))}
                  className="form-input"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Class Timings</label>
                <input
                  type="text"
                  placeholder="e.g. Mon-Fri, 7:00 PM - 9:00 PM IST"
                  value={form.classTimings}
                  onChange={(e) => update('classTimings', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Sessions / Classes</label>
                <input
                  type="number"
                  placeholder="e.g. 45"
                  value={form.numberOfSessions}
                  onChange={(e) => update('numberOfSessions', Number(e.target.value))}
                  className="form-input"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* Trainers Section */}
        {activeSection === 'trainers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', margin: 0 }}>Assign Trainers</h2>
                <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>Select which trainers teach this course</p>
              </div>
              <Link href="/admin/trainers" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                Manage All Trainers →
              </Link>
            </div>

            {trainersList.length === 0 ? (
              <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>No trainers found. Add trainers in the Trainers page first.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {trainersList.map((t) => {
                  const selected = form.trainers.includes(t._id);
                  return (
                    <div
                      key={t._id}
                      onClick={() => toggleTrainer(t._id)}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        background: selected ? 'rgba(124,109,248,0.15)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${selected ? '#7c6df8' : 'var(--admin-border)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {}}
                        style={{ accentColor: '#7c6df8', width: '18px', height: '18px' }}
                      />
                      <div>
                        <div style={{ color: selected ? '#fff' : '#e8e8f0', fontWeight: '600', fontSize: '0.9rem' }}>{t.name}</div>
                        <div style={{ color: '#6b6b8a', fontSize: '0.75rem' }}>{t.designation}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SEO Section */}
        {activeSection === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#e8e8f0', margin: 0 }}>SEO Metadata</h2>

            <div className="form-group">
              <label className="form-label">SEO Meta Title</label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => update('seoTitle', e.target.value)}
                className="form-input"
                style={inputStyle}
                placeholder="Default will use Course Name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">SEO Meta Description</label>
              <textarea
                rows={3}
                value={form.seoDescription}
                onChange={(e) => update('seoDescription', e.target.value)}
                className="form-input form-textarea"
                style={inputStyle}
                placeholder="Catchy description for Google Search results..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">SEO Keywords (comma separated)</label>
              <input
                type="text"
                value={form.seoKeywords}
                onChange={(e) => update('seoKeywords', e.target.value)}
                className="form-input"
                style={inputStyle}
                placeholder="mern course, react training, full stack developer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div style={{
        marginTop: '1.5rem',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#a8a8c0', fontSize: '0.875rem' }}>
            Current Status: <strong style={{ color: form.status === 'published' ? '#00c896' : '#ffb800' }}>{form.status.toUpperCase()}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin/courses" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)', minWidth: '140px' }}
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
