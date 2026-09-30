'use client';

import Link from 'next/link';

const FOOTER_LINKS = {
  Courses: [
    { label: 'MERN Stack', href: '/courses/mern-stack-development' },
    { label: 'Full Stack .NET', href: '/courses/full-stack-dotnet' },
    { label: 'Python Full Stack', href: '/courses/python-full-stack' },
    { label: 'React.js', href: '/courses/reactjs' },
    { label: 'Node.js', href: '/courses/nodejs' },
    { label: 'All Courses', href: '/courses' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  Support: [
    { label: 'FAQs', href: '/faqs' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export default function PublicFooter() {
  return (
    <footer style={{
      background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: '4rem',
    }}>
      {/* Gradient line */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--color-primary), var(--color-secondary), transparent)',
        marginBottom: '4rem',
      }} />

      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '3rem',
          marginBottom: '4rem',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                color: '#fff',
                fontSize: '1.1rem',
              }}>C</div>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: '800',
                fontSize: '1.15rem',
                background: 'linear-gradient(135deg, #e8e8f0, #8b85ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>CodeWithSuraj</span>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Master modern technology with industry-expert trainers. Real projects, real skills, real career growth.
            </p>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[
                { icon: '💼', label: 'LinkedIn', href: '#' },
                { icon: '🐙', label: 'GitHub', href: '#' },
                { icon: '📸', label: 'Instagram', href: '#' },
                { icon: '▶️', label: 'YouTube', href: '#' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(108, 99, 255, 0.15)';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(108, 99, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem',
              }}>
                {category}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-light)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          marginBottom: '3rem',
        }}>
          {[
            { icon: '📧', text: 'hello@codewithsuraj.com' },
            { icon: '📱', text: '+91 98765 43210' },
            { icon: '💬', text: 'WhatsApp Us' },
          ].map((item) => (
            <div key={item.text} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          paddingBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} CodeWithSuraj. All rights reserved.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Crafted with ❤️ for aspiring developers
          </p>
        </div>
      </div>
    </footer>
  );
}
