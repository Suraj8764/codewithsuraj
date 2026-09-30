'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  author: string;
  authorImage?: string;
  category: string;
  tags: string[];
  views: number;
  publishedAt?: string;
  createdAt: string;
}

export default function BlogListingPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetch('/api/blog?limit=50')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.blogs) {
          setBlogs(data.blogs);
        }
      })
      .catch((err) => console.error('Error fetching blogs:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ['All', ...Array.from(set)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCat = selectedCategory === 'All' || b.category === selectedCategory;
      const matchSearch =
        !search.trim() ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
        b.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [blogs, selectedCategory, search]);

  const featuredPost = filteredBlogs[0];
  const restPosts = filteredBlogs.slice(1);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '5rem', paddingBottom: '6rem' }}>
      {/* Background Glows */}
      <div
        className="vengeance-glow-orb"
        style={{ width: '500px', height: '500px', background: '#6c63ff', top: '-120px', left: '-100px' }}
      />
      <div
        className="vengeance-glow-orb"
        style={{ width: '450px', height: '450px', background: '#00d4ff', top: '40%', right: '-150px' }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="vengeance-badge vengeance-badge-glow" style={{ marginBottom: '1.25rem' }}>
            ✦ ENGINEERING ARTICLES & TUTORIALS
          </span>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '900',
              lineHeight: 1.15,
              marginBottom: '1rem',
            }}
          >
            Insights for Modern <span className="text-gradient">Developers</span>
          </h1>
          <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Deep-dive tutorials, system design breakdowns, modern frameworks, and career strategies written by practitioners.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div
          className="vengeance-card"
          style={{
            padding: '1.25rem',
            marginBottom: '3rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Search articles by topic, keyword, or framework..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{
                  background: 'rgba(10, 10, 15, 0.7)',
                  paddingLeft: '1.25rem',
                  fontSize: '0.95rem',
                  height: '48px',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    padding: '4px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: active ? '600' : '500',
                    background: active ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'rgba(255, 255, 255, 0.05)',
                    color: active ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'transparent' : 'var(--border-subtle)'}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="skeleton" style={{ height: '380px', borderRadius: '20px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: '340px', borderRadius: '16px' }} />
              ))}
            </div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div
            className="vengeance-card"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Articles Found</h3>
            <p style={{ maxWidth: '450px', margin: '0 auto 1.5rem', color: 'var(--text-secondary)' }}>
              No blog posts match your current search or category filter.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
              className="btn btn-secondary btn-sm"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured Post Banner */}
            {featuredPost && (
              <div style={{ marginBottom: '3rem' }}>
                <Link href={`/blog/${featuredPost.slug}`}>
                  <div
                    className="vengeance-card vengeance-card-glow featured-post-card"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.1fr 1fr',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ position: 'relative', minHeight: '320px', background: '#12121a' }}>
                      <img
                        src={featuredPost.coverImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80'}
                        alt={featuredPost.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          left: '1rem',
                          background: 'rgba(10, 10, 15, 0.85)',
                          backdropFilter: 'blur(8px)',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#00d4ff',
                          border: '1px solid rgba(0, 212, 255, 0.3)',
                        }}
                      >
                        ✦ FEATURED ARTICLE
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '2.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'var(--color-primary-light)',
                            background: 'rgba(108, 99, 255, 0.12)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                          }}
                        >
                          {featuredPost.category}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {featuredPost.publishedAt
                            ? new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recent'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• 5 min read</span>
                      </div>

                      <h2
                        style={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
                          fontWeight: '800',
                          color: '#fff',
                          lineHeight: 1.3,
                          marginBottom: '1rem',
                        }}
                      >
                        {featuredPost.title}
                      </h2>

                      <p
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.95rem',
                          lineHeight: 1.6,
                          marginBottom: '1.5rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {featuredPost.excerpt}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <img
                            src={featuredPost.authorImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={featuredPost.author}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#fff' }}>
                            {featuredPost.author}
                          </span>
                        </div>
                        <span style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
                          Read Article →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Grid of Remaining Posts */}
            {restPosts.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '2rem',
                  marginBottom: '4rem',
                }}
              >
                {restPosts.map((post) => (
                  <Link key={post._id} href={`/blog/${post.slug}`}>
                    <div
                      className="vengeance-card"
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                      }}
                    >
                      {/* Cover */}
                      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                        <img
                          src={post.coverImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'}
                          alt={post.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            top: '0.75rem',
                            left: '0.75rem',
                            background: 'rgba(10, 10, 15, 0.85)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: '#8b85ff',
                            border: '1px solid rgba(108, 99, 255, 0.3)',
                          }}
                        >
                          {post.category}
                        </div>
                      </div>

                      {/* Content */}
                      <div
                        style={{
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span>
                            {post.publishedAt
                              ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Recent'}
                          </span>
                          <span>•</span>
                          <span>4 min read</span>
                        </div>

                        <h3
                          style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '1.15rem',
                            fontWeight: '700',
                            color: '#fff',
                            lineHeight: 1.35,
                            marginBottom: '0.75rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {post.title}
                        </h3>

                        <p
                          style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            lineHeight: 1.6,
                            marginBottom: '1.25rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {post.excerpt}
                        </p>

                        {/* Author */}
                        <div
                          style={{
                            marginTop: 'auto',
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img
                              src={post.authorImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                              alt={post.author}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                              {post.author}
                            </span>
                          </div>
                          <span style={{ color: 'var(--color-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                            Read →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Newsletter Subscription Card */}
        <div
          className="vengeance-card vengeance-card-glow"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.12) 0%, rgba(0, 212, 255, 0.08) 100%)',
          }}
        >
          <span className="vengeance-badge" style={{ marginBottom: '1rem' }}>
            📬 WEEKLY ARCHITECTURE DIGEST
          </span>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: '800',
              color: '#fff',
              marginBottom: '0.75rem',
            }}
          >
            Level Up Your Engineering Every Tuesday
          </h2>
          <p
            style={{
              maxWidth: '550px',
              margin: '0 auto 2rem',
              color: 'var(--text-secondary)',
              fontSize: '1rem',
            }}
          >
            Join 25,000+ developers receiving our curated breakdown of system design patterns, React performance tricks, and backend scalability lessons.
          </p>

          {subscribed ? (
            <div
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'rgba(0, 200, 150, 0.15)',
                border: '1px solid rgba(0, 200, 150, 0.35)',
                borderRadius: '12px',
                color: '#00c896',
                fontWeight: '600',
              }}
            >
              🎉 You are subscribed! Check your inbox for the welcome edition.
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              style={{
                display: 'flex',
                gap: '0.75rem',
                maxWidth: '480px',
                margin: '0 auto',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <input
                type="email"
                placeholder="Enter your email address..."
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="form-input"
                style={{ flex: '1', minWidth: '220px', background: 'rgba(10, 10, 15, 0.8)' }}
              />
              <button type="submit" className="btn btn-primary">
                ✦ Subscribe Free
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .featured-post-card {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
