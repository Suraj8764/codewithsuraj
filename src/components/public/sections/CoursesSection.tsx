'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

export default function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');  // '' = All

  // Fetch available categories from DB
  useEffect(() => {
    fetch('/api/courses/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCategories(data.categories as string[]);
      })
      .catch(() => {/* ignore */});
  }, []);

  // Fetch courses when activeCategory changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('status', 'published');
    params.set('limit', '8');
    if (activeCategory) params.set('category', activeCategory);

    fetch(`/api/courses?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCourses(data.courses as Course[]);
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <section className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">📚 Our Courses</span>
          <h2 className="section-title">
            Level Up Your{' '}
            <span className="text-gradient">Tech Career</span>
          </h2>
          <p className="section-desc">
            Industry-designed curricula with real-world projects. Learn from experts who build production systems.
          </p>
        </div>

        {/* Category Filter — dynamic from DB */}
        {categories.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '3rem',
          }}>
            <button
              onClick={() => setActiveCategory('')}
              style={filterBtnStyle(activeCategory === '')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={filterBtnStyle(activeCategory === cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Courses Grid */}
        {loading ? (
          <div className="grid-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            {activeCategory
              ? `No published courses in "${activeCategory}" yet.`
              : 'No courses available yet. Check back soon!'}
          </div>
        ) : (
          <div className="grid-auto">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/courses" className="btn btn-secondary btn-lg" id="view-all-courses">
            View All Courses →
          </Link>
        </div>
      </div>
    </section>
  );
}

function filterBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '0.5rem 1.25rem',
    borderRadius: '100px',
    border: '1px solid',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: active ? 'var(--color-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    borderColor: active ? 'var(--color-primary)' : 'var(--border-subtle)',
  };
}
