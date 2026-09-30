import Link from 'next/link';

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

function formatPrice(currency: string, amount: number) {
  if (currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`;
  return `${currency} ${amount.toLocaleString()}`;
}

function getDiscount(price: number, discountPrice: number) {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner: '#00c896',
  Intermediate: '#ffb800',
  Advanced: '#ff6b6b',
  'All Levels': '#6c63ff',
};

const ENROLLMENT_STATUS: Record<string, { label: string; color: string }> = {
  open: { label: 'Enrollment Open', color: '#00c896' },
  closed: { label: 'Seats Full', color: '#ff6b6b' },
  coming_soon: { label: 'Coming Soon', color: '#ffb800' },
};

export default function CourseCard({ course }: { course: Course }) {
  const discount = getDiscount(course.price, course.discountPrice);
  const status = ENROLLMENT_STATUS[course.enrollmentStatus] || ENROLLMENT_STATUS.coming_soon;
  const effectivePrice = course.discountPrice > 0 ? course.discountPrice : course.price;

  return (
    <article className="course-card">
      {/* Thumbnail */}
      <div className="course-card-image" style={{ position: 'relative' }}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.name} />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,255,0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
          }}>
            💻
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: '#ff6b6b',
            color: '#fff',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '700',
          }}>
            {discount}% OFF
          </div>
        )}

        {/* Level badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: `${LEVEL_COLORS[course.level]}22`,
          color: LEVEL_COLORS[course.level],
          border: `1px solid ${LEVEL_COLORS[course.level]}44`,
          padding: '0.2rem 0.6rem',
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: '700',
        }}>
          {course.level}
        </div>
      </div>

      {/* Body */}
      <div className="course-card-body">
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-primary-light)',
          }}>
            {course.category}
          </span>
        </div>

        <h3 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.1rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          lineHeight: 1.3,
        }}>
          {course.name}
        </h3>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          marginBottom: '1rem',
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {course.shortDescription}
        </p>

        {/* Technologies */}
        {course.technologies?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
            {course.technologies.slice(0, 4).map((tech) => (
              <span key={tech} style={{
                background: 'rgba(108,99,255,0.08)',
                color: 'var(--text-secondary)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: '500',
                border: '1px solid rgba(108,99,255,0.12)',
              }}>
                {tech}
              </span>
            ))}
            {course.technologies.length > 4 && (
              <span style={{
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                padding: '0.2rem 0.4rem',
              }}>
                +{course.technologies.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Meta */}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {course.duration && (
            <span>⏱ {course.duration}</span>
          )}
          {course.enrollmentCount > 0 && (
            <span>👥 {course.enrollmentCount} enrolled</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="course-card-footer">
        <div className="price-display">
          {course.price > 0 ? (
            <>
              <span className="price-current">
                {formatPrice(course.currency, effectivePrice)}
              </span>
              {discount > 0 && (
                <span className="price-original">
                  {formatPrice(course.currency, course.price)}
                </span>
              )}
            </>
          ) : (
            <span style={{ color: 'var(--color-success)', fontWeight: '700' }}>Free</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.72rem',
            color: status.color,
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: status.color, display: 'inline-block' }} />
            {status.label}
          </div>
        </div>
      </div>

      {/* Hover CTA */}
      <Link
        href={`/courses/${course.slug}`}
        style={{
          display: 'block',
          margin: '0 1.5rem 1.5rem',
          textAlign: 'center',
          padding: '0.65rem',
          background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
          color: '#fff',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '0.875rem',
          transition: 'opacity 0.2s ease',
        }}
        id={`course-cta-${course.slug}`}
      >
        View Course →
      </Link>
    </article>
  );
}
