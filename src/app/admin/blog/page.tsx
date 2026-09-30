'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  content: string;
  author: string;
  authorImage?: string;
  category: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  status: 'draft' | 'published';
  publishedAt?: string;
  views: number;
  createdAt: string;
}

const CATEGORIES = [
  'Full Stack Development',
  'Frontend & React',
  'Backend & Architecture',
  'AI & Machine Learning',
  'Career & Interview Prep',
  'Tutorials & Guides',
  'Industry Insights',
];

const EMPTY_FORM = {
  title: '',
  slug: '',
  coverImage: '',
  excerpt: '',
  content: '',
  author: 'Suraj Sahoo',
  authorImage: '',
  category: 'Full Stack Development',
  tags: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  status: 'draft' as 'draft' | 'published',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminBlogPage() {
  const { token } = useAdmin();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');

  const fetchBlogs = useCallback(() => {
    if (!token) return;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);
    params.set('limit', '50');

    fetch(`/api/blog?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          let list: BlogPost[] = data.blogs || [];
          if (statusFilter) {
            list = list.filter((b) => b.status === statusFilter);
          }
          setBlogs(list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  function openAdd() {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setActiveTab('content');
    setShowDrawer(true);
  }

  function openEdit(b: BlogPost) {
    setForm({
      title: b.title,
      slug: b.slug,
      coverImage: b.coverImage || '',
      excerpt: b.excerpt || '',
      content: b.content,
      author: b.author || 'Suraj Sahoo',
      authorImage: b.authorImage || '',
      category: b.category || 'Full Stack Development',
      tags: Array.isArray(b.tags) ? b.tags.join(', ') : '',
      seoTitle: b.seoTitle || '',
      seoDescription: b.seoDescription || '',
      seoKeywords: Array.isArray(b.seoKeywords) ? b.seoKeywords.join(', ') : '',
      status: b.status,
    });
    setEditId(b._id);
    setActiveTab('content');
    setShowDrawer(true);
  }

  function handleTitleChange(val: string) {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: !editId ? slugify(val) : prev.slug,
    }));
  }

  async function handleSave(forcedStatus?: 'draft' | 'published') {
    if (!form.title || !form.slug || !form.content) {
      toast.error('Title, slug and content are required');
      return;
    }

    setSaving(true);
    const targetStatus = forcedStatus || form.status;

    const payload = {
      ...form,
      status: targetStatus,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      seoKeywords: form.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean),
    };

    try {
      const url = editId ? `/api/blog/${editId}` : '/api/blog';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          targetStatus === 'published' ? 'Article published successfully!' : 'Article saved as draft'
        );
        setShowDrawer(false);
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to save blog post');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(blog: BlogPost) {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/blog/${blog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Post ${newStatus === 'published' ? 'published' : 'moved to draft'}`);
        fetchBlogs();
      } else {
        toast.error('Failed to change status');
      }
    } catch {
      toast.error('An error occurred');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Blog post deleted');
        fetchBlogs();
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('An error occurred');
    }
  }

  const inputStyle = { background: 'rgba(13,13,20,0.8)' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', margin: 0 }}>
            Blog Articles
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Publish tutorials, technology insights, and student success stories
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            href="/blog"
            target="_blank"
            className="btn btn-secondary"
            style={{ fontSize: '0.875rem' }}
          >
            👁️ View Public Blog
          </Link>
          <button
            onClick={openAdd}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}
          >
            ✍️ Write Article
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
        background: 'var(--admin-card)',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid var(--admin-border)',
      }}>
        <input
          type="text"
          placeholder="🔍 Search articles by title or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={inputStyle}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="form-input"
          style={inputStyle}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input"
          style={inputStyle}
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table / List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b6b8a' }}>Loading articles...</div>
      ) : blogs.length === 0 ? (
        <div style={{
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ color: '#e8e8f0', marginBottom: '0.5rem' }}>No articles found</h3>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Write and publish technical articles to attract organic learners.
          </p>
          <button onClick={openAdd} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
            ✍️ Write First Article
          </button>
        </div>
      ) : (
        <div style={{
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', color: '#e8e8f0' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--admin-border)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0' }}>Article</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0' }}>Category</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0' }}>Author</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0' }}>Views</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0' }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0' }}>Date</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#a8a8c0', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr
                    key={b._id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124,109,248,0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {b.coverImage ? (
                          <img
                            src={b.coverImage}
                            alt=""
                            style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        ) : (
                          <div style={{
                            width: '48px',
                            height: '36px',
                            borderRadius: '6px',
                            background: 'rgba(124,109,248,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                          }}>
                            📄
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '600', color: '#e8e8f0', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b6b8a', fontFamily: 'monospace' }}>
                            /{b.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        background: 'rgba(124,109,248,0.1)',
                        color: '#9b8dfb',
                        fontSize: '0.75rem',
                      }}>
                        {b.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#a8a8c0' }}>{b.author}</td>
                    <td style={{ padding: '1rem', color: '#00d4ff', fontWeight: '600' }}>
                      👁️ {b.views || 0}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        background: b.status === 'published' ? 'rgba(0,200,150,0.15)' : 'rgba(255,184,0,0.15)',
                        color: b.status === 'published' ? '#00c896' : '#ffb800',
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#6b6b8a', fontSize: '0.8rem' }}>
                      {new Date(b.publishedAt || b.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Link
                          href={`/blog/${b.slug}`}
                          target="_blank"
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                          title="View on site"
                        >
                          👁️
                        </Link>
                        <button
                          onClick={() => toggleStatus(b)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: b.status === 'published' ? '#ffb800' : '#00c896' }}
                          title={b.status === 'published' ? 'Draft' : 'Publish'}
                        >
                          {b.status === 'published' ? '📥' : '🚀'}
                        </button>
                        <button
                          onClick={() => openEdit(b)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: '#00d4ff' }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Write / Edit Modal */}
      {showDrawer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--admin-card)',
            border: '1px solid var(--admin-border)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 2rem',
              borderBottom: '1px solid var(--admin-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', color: '#e8e8f0', margin: 0 }}>
                  {editId ? '✏️ Edit Article' : '✍️ Write New Article'}
                </h2>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('content')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: activeTab === 'content' ? '#9b8dfb' : '#6b6b8a',
                      fontWeight: activeTab === 'content' ? '600' : '400',
                      borderBottom: activeTab === 'content' ? '2px solid #7c6df8' : 'none',
                      paddingBottom: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    📝 Content & Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('seo')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: activeTab === 'seo' ? '#9b8dfb' : '#6b6b8a',
                      fontWeight: activeTab === 'seo' ? '600' : '400',
                      borderBottom: activeTab === 'seo' ? '2px solid #7c6df8' : 'none',
                      paddingBottom: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    🔍 SEO & Metadata
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#6b6b8a', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {activeTab === 'content' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Master React 19 Server Components from Scratch"
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="form-input"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">URL Slug *</label>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="form-input"
                        style={inputStyle}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="form-input"
                        style={inputStyle}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Author Name</label>
                      <input
                        type="text"
                        value={form.author}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                        className="form-input"
                        style={inputStyle}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cover Image URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={form.coverImage}
                        onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                        className="form-input"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Excerpt (Brief overview for cards)</label>
                    <textarea
                      rows={2}
                      placeholder="A short punchy summary..."
                      value={form.excerpt}
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                      className="form-input form-textarea"
                      style={inputStyle}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Article Content (Markdown supported) *</label>
                    <textarea
                      rows={12}
                      placeholder="Write your article in markdown..."
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      className="form-input form-textarea"
                      style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.875rem' }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="React, Next.js, Frontend, TypeScript"
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      className="form-input"
                      style={inputStyle}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">SEO Title</label>
                    <input
                      type="text"
                      placeholder="Default will use article title"
                      value={form.seoTitle}
                      onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                      className="form-input"
                      style={inputStyle}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SEO Description</label>
                    <textarea
                      rows={4}
                      placeholder="Search engine meta description..."
                      value={form.seoDescription}
                      onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                      className="form-input form-textarea"
                      style={inputStyle}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SEO Keywords (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="react 19 guide, web development tutorial"
                      value={form.seoKeywords}
                      onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                      className="form-input"
                      style={inputStyle}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1.25rem 2rem',
              borderTop: '1px solid var(--admin-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#a8a8c0' }}>
                  Status:{' '}
                  <strong style={{ color: form.status === 'published' ? '#00c896' : '#ffb800' }}>
                    {form.status.toUpperCase()}
                  </strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="btn btn-secondary"
                  style={{ color: '#ffb800' }}
                >
                  📥 Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #00c896, #00a876)', minWidth: '130px' }}
                >
                  {saving ? 'Publishing...' : '🚀 Publish Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
