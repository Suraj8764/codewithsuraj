'use client';

import { useState, useEffect, useCallback } from 'react';
import CourseCard from '@/components/public/CourseCard';

interface Course {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  thumbnail: string;
  price: number;
  discountPrice: number;
  currency: string;
  level: string;
  duration: string;
  technologies: string[];
  enrollmentStatus: string;
  enrollmentCount: number;
  category: string;
}

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export default function CoursesPage() {
  // ── Data State ──────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // ── Filter State ─────────────────────────────────────────────────────────────
  // '' means "no filter applied" for category and level
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');   // '' = All Categories
  const [level, setLevel] = useState('');          // '' = All Levels
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);

  const hasActiveFilters = !!(search || category || level || sort !== 'default');

  // ── Fetch categories once on mount ───────────────────────────────────────────
  useEffect(() => {
    fetch('/api/courses/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCategories(data.categories as string[]);
      })
      .catch(() => {/* silently ignore; dropdown just shows none */});
  }, []);

  // ── Debounce search input ────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Fetch courses whenever filters/page change ───────────────────────────────
  const fetchCourses = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('status', 'published');
    params.set('page', page.toString());
    params.set('limit', '12');
    if (search)   params.set('search', search);
    if (category) params.set('category', category);
    if (level)    params.set('level', level);

    fetch(`/api/courses?${params.toString()}`, {
      cache: 'no-store'
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          let sorted = [...(data.courses as Course[])];
          if (sort === 'price_asc')  sorted.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
          if (sort === 'price_desc') sorted.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
          if (sort === 'popular')    sorted.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
          setCourses(sorted);
          setTotalPages(data.pagination?.pages || 1);
          setTotalCourses(data.pagination?.total || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [search, category, level, sort, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  // ── Clear all filters ────────────────────────────────────────────────────────
  function clearFilters() {
    setSearchInput('');
    setSearch('');
    setCategory('');
    setLevel('');
    setSort('default');
    setPage(1);
  }

  // ── Empty state: distinguish "no DB courses" vs "filters returned nothing" ──
  const isFiltered = !!(search || category || level);

  return (
    <>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a1628 100%)',
        paddingTop: '120px',
        paddingBottom: '3rem',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid texture */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '30%',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(108,99,255,0.08) 0%, transparent 70%)',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <span className="section-tag">📚 All Courses</span>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            marginTop: '0.75rem',
            marginBottom: '0.5rem',
          }}>
            Find Your Perfect <span className="text-gradient">Course</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            {!loading && totalCourses > 0
              ? `${totalCourses} course${totalCourses !== 1 ? 's' : ''} available`
              : 'Explore our curriculum'}
          </p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '3rem 0', background: 'var(--bg-primary)', minHeight: '60vh' }}>
        <div className="container">

          {/* ── Filter Bar ─────────────────────────────────────────────────── */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '0.875rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <span style={{
                position: 'absolute', left: '1rem', top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search courses, technologies, category..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                id="courses-search"
              />
            </div>

            {/* Category — built from DB */}
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="form-input form-select"
              style={{ width: 'auto', minWidth: '160px' }}
              id="courses-filter-category"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Level */}
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value); setPage(1); }}
              className="form-input form-select"
              style={{ width: 'auto', minWidth: '140px' }}
              id="courses-filter-level"
            >
              <option value="">All Levels</option>
              {LEVELS.filter((l) => l !== 'All Levels').map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="form-input form-select"
              style={{ width: 'auto', minWidth: '170px' }}
              id="courses-sort"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {/* Clear Filters — only shown when active */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '0.6rem 1rem',
                  background: 'rgba(255,107,107,0.1)',
                  border: '1px solid rgba(255,107,107,0.25)',
                  borderRadius: '10px',
                  color: '#ff6b6b',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,107,107,0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,107,107,0.1)';
                }}
                id="courses-clear-filters"
              >
                ✕ Clear Filters
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {search && (
                <span style={chipStyle}>🔍 &quot;{search}&quot;</span>
              )}
              {category && (
                <span style={chipStyle}>📂 {category}</span>
              )}
              {level && (
                <span style={chipStyle}>🎓 {level}</span>
              )}
              {sort !== 'default' && (
                <span style={chipStyle}>↕ {SORT_OPTIONS.find((s) => s.value === sort)?.label}</span>
              )}
            </div>
          )}

          {/* ── Results ──────────────────────────────────────────────────────── */}
          {loading ? (
            // Skeleton
            <div className="grid-auto">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '16px' }} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            // Empty state
            <div style={{
              textAlign: 'center',
              padding: '6rem 2rem',
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.25rem' }}>
                {isFiltered ? '🔍' : '📚'}
              </div>
              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.3rem',
                fontWeight: '700',
                marginBottom: '0.6rem',
                color: 'var(--text-secondary)',
              }}>
                {isFiltered ? 'No courses found' : 'No courses available yet'}
              </h3>
              <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                {isFiltered
                  ? 'Try adjusting your search or filters.'
                  : 'Check back soon — new courses are on the way!'}
              </p>
              {isFiltered && (
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '0.6rem 1.5rem',
                    background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                    border: 'none',
                    borderRadius: '100px',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid-auto">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '3rem',
                  flexWrap: 'wrap',
                }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={pageBtnStyle(false, page === 1)}
                  >
                    ←
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      style={pageBtnStyle(page === i + 1, false)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={pageBtnStyle(false, page === totalPages)}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.3rem 0.75rem',
  background: 'rgba(108,99,255,0.1)',
  border: '1px solid rgba(108,99,255,0.2)',
  borderRadius: '100px',
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#9b8dfb',
};

function pageBtnStyle(active: boolean, disabled: boolean): React.CSSProperties {
  return {
    minWidth: '40px',
    height: '40px',
    padding: '0 0.75rem',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: active ? 'var(--color-primary)' : 'var(--border-subtle)',
    background: active ? 'rgba(108,99,255,0.15)' : 'transparent',
    color: active ? 'var(--color-primary-light)' : disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 0.2s ease',
  };
}
