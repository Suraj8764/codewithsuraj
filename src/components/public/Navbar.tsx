'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/enrollment-status', label: 'Status' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'all 0.3s ease',
          background: scrolled
            ? 'rgba(10, 10, 15, 0.95)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(108, 99, 255, 0.15)' : '1px solid transparent',
        }}
      >
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
          }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: '800',
                color: '#fff',
                boxShadow: '0 0 20px rgba(108, 99, 255, 0.4)',
              }}>
                C
              </div>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: '800',
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #e8e8f0, #8b85ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                CodeWithSuraj
              </span>
            </Link>

            {/* Desktop Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    color: pathname === link.href ? '#8b85ff' : '#a8a8c0',
                    background: pathname === link.href ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                href="/courses"
                className="btn btn-primary btn-sm"
                style={{ display: 'flex' }}
              >
                ✦ Enroll Now
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  display: 'none',
                  flexDirection: 'column',
                  gap: '5px',
                  padding: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                className="hamburger-btn"
                aria-label="Toggle menu"
              >
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    display: 'block',
                    width: '20px',
                    height: '2px',
                    background: '#e8e8f0',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease',
                  }} />
                ))}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div ref={menuRef} style={{
            background: 'rgba(18, 18, 26, 0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(108, 99, 255, 0.15)',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease',
          }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: pathname === link.href ? '#8b85ff' : '#a8a8c0',
                  background: pathname === link.href ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                  marginBottom: '0.25rem',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/courses"
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              ✦ Enroll Now
            </Link>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
