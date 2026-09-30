'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
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
  views: number;
  publishedAt?: string;
  createdAt: string;
}

interface RelatedBlog {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  author: string;
  publishedAt?: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<RelatedBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.blog) {
          setBlog(data.blog);
          if (data.relatedBlogs) setRelated(data.relatedBlogs);
        }
      })
      .catch((err) => console.error('Error fetching blog post:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function copyToClipboard() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem', maxWidth: '840px' }}>
        <div className="skeleton" style={{ height: '36px', width: '200px', marginBottom: '1.5rem', borderRadius: '8px' }} />
        <div className="skeleton" style={{ height: '54px', width: '90%', marginBottom: '1.5rem', borderRadius: '8px' }} />
        <div className="skeleton" style={{ height: '400px', width: '100%', marginBottom: '2rem', borderRadius: '16px' }} />
        <div className="skeleton" style={{ height: '200px', width: '100%', borderRadius: '12px' }} />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', color: '#fff', marginBottom: '1rem' }}>
          Article Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The article you are looking for may have been moved or unpublished.
        </p>
        <Link href="/blog" className="btn btn-primary">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  // Parse markdown content into structured blocks
  const renderContent = (content: string) => {
    const lines = content.trim().split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLanguage = '';

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div
              key={`code-${index}`}
              style={{
                background: '#0d0d14',
                border: '1px solid rgba(108, 99, 255, 0.25)',
                borderRadius: '12px',
                padding: '1.25rem',
                margin: '1.5rem 0',
                overflowX: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                color: '#00d4ff',
                lineHeight: 1.6,
              }}
            >
              <pre>{codeContent.join('\n')}</pre>
            </div>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLanguage = line.replace('```', '').trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: '800', color: '#fff', margin: '2rem 0 1rem' }}>
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: '700', color: '#8b85ff', margin: '2rem 0 0.75rem' }}>
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.65rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem' }}>
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={index} style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginLeft: '1.5rem', marginBottom: '0.5rem' }}>
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.startsWith('---')) {
        elements.push(
          <div key={index} style={{ height: '1px', background: 'var(--border-subtle)', margin: '2rem 0' }} />
        );
      } else if (line.trim().length > 0) {
        elements.push(
          <p key={index} style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '4.5rem', paddingBottom: '6rem' }}>
      {/* Reading Progress Indicator */}
      <div
        style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          height: '3px',
          background: 'transparent',
          zIndex: 999,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${scrollProgress}%`,
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.7)',
            transition: 'width 0.1s ease',
          }}
        />
      </div>

      <div className="container" style={{ maxWidth: '860px', position: 'relative', zIndex: 1 }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', fontSize: '0.875rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>
            Home
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <Link href="/blog" style={{ color: 'var(--text-muted)' }}>
            Blog
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--color-primary-light)', fontWeight: '500' }}>{blog.category}</span>
        </div>

        {/* Category & Meta */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: 'var(--color-secondary)',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
            }}
          >
            {blog.category}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {blog.publishedAt
              ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent'}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• 5 min read</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• 👁️ {blog.views || 1} views</span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            fontWeight: '900',
            lineHeight: 1.2,
            color: '#fff',
            marginBottom: '1.5rem',
          }}
        >
          {blog.title}
        </h1>

        {/* Author & Share Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 0',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={blog.authorImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
              alt={blog.author}
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem' }}>{blog.author}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Lead Instructor & Engineer</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={copyToClipboard}
              style={{
                padding: '0.45rem 0.9rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              🔗 Share
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {blog.coverImage && (
          <div
            style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '3rem',
              border: '1px solid rgba(108, 99, 255, 0.2)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
            }}
          >
            <img
              src={blog.coverImage}
              alt={blog.title}
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Article Body */}
        <article style={{ marginBottom: '4rem' }}>
          {renderContent(blog.content)}
        </article>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            {blog.tags.map((t, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.3rem 0.8rem',
                  background: 'rgba(108, 99, 255, 0.1)',
                  borderRadius: '6px',
                  color: 'var(--color-primary-light)',
                  border: '1px solid rgba(108, 99, 255, 0.2)',
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio Box */}
        <div
          className="vengeance-card"
          style={{
            padding: '2rem',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            marginBottom: '4rem',
          }}
        >
          <img
            src={blog.authorImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={blog.author}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
              Written by {blog.author}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Mentor & Full Stack Architect at CodeWithSuraj. Passionate about distributed systems, modern React paradigms, and high-performance engineering.
            </p>
          </div>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div>
            <h3
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.5rem',
                fontWeight: '800',
                color: '#fff',
                marginBottom: '1.5rem',
              }}
            >
              Related Articles
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {related.map((r) => (
                <Link key={r._id} href={`/blog/${r.slug}`}>
                  <div className="vengeance-card" style={{ height: '100%', padding: '1.25rem' }}>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                      {r.title}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                      {r.excerpt?.slice(0, 90)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back button */}
        <div style={{ marginTop: '3.5rem', textAlign: 'center' }}>
          <Link href="/blog" className="btn btn-secondary">
            ← Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
