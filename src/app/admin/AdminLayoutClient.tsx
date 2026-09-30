'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminContextType {
  user: AdminUser | null;
  token: string | null;
  logout: () => void;
}

export const AdminContext = createContext<AdminContextType>({
  user: null,
  token: null,
  logout: () => {},
});

export const useAdmin = () => useContext(AdminContext);

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', href: '/admin/dashboard', roles: ['super_admin', 'course_manager', 'enrollment_manager', 'content_manager'] },
  { icon: '📚', label: 'Courses', href: '/admin/courses', roles: ['super_admin', 'course_manager'] },
  { icon: '👨‍🏫', label: 'Trainers', href: '/admin/trainers', roles: ['super_admin', 'course_manager'] },
  { icon: '👥', label: 'Enrollments', href: '/admin/enrollments', roles: ['super_admin', 'enrollment_manager'] },
  { icon: '💳', label: 'Payments', href: '/admin/payments', roles: ['super_admin', 'enrollment_manager'] },
  { icon: '⭐', label: 'Testimonials', href: '/admin/testimonials', roles: ['super_admin', 'content_manager'] },
  { icon: '❓', label: 'FAQs', href: '/admin/faqs', roles: ['super_admin', 'content_manager'] },
  { icon: '📝', label: 'Blog', href: '/admin/blog', roles: ['super_admin', 'content_manager'] },
  { icon: '📣', label: 'Promotions', href: '/admin/promotions', roles: ['super_admin', 'content_manager'] },
  { icon: '🎨', label: 'Content', href: '/admin/content', roles: ['super_admin', 'content_manager'] },
  { icon: '⚙️', label: 'Settings', href: '/admin/settings', roles: ['super_admin'] },
  { icon: '🔐', label: 'Admin Roles', href: '/admin/roles', roles: ['super_admin'] },
];

const ADMIN_STYLES = `
  :root {
    --admin-bg: #0d0d14;
    --admin-sidebar: #111118;
    --admin-card: #1c1c28;
    --admin-card-hover: #222234;
    --admin-border: rgba(124, 109, 248, 0.1);
    --admin-border-active: rgba(124, 109, 248, 0.3);
    --admin-primary: #7c6df8;
    --admin-primary-light: #9b8dfb;
    --admin-text: #e8e8f0;
    --admin-muted: #6b6b8a;
    --admin-secondary: #a8a8c0;
  }

  @media (max-width: 768px) {
    .admin-mobile-toggle {
      display: inline-flex !important;
    }
    aside.admin-sidebar {
      transform: translateX(-100%) !important;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
      width: 260px !important;
      z-index: 9999 !important;
    }
    aside.admin-sidebar.mobile-open {
      transform: translateX(0) !important;
    }
    main.admin-main {
      margin-left: 0 !important;
    }
    .admin-topbar {
      padding: 0 1rem !important;
    }
    .admin-content-area {
      padding: 1rem !important;
    }
  }
`;

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoginPage) { setLoading(false); return; }
    const stored = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else {
      router.push('/admin/login');
    }
  }, [isLoginPage, router]);

  function logout() {
    fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
    router.push('/admin/login');
  }

  if (loading && !isLoginPage) {
    return (
      <div style={{
        height: '100vh', background: '#0d0d14',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid rgba(124,109,248,0.2)',
          borderTopColor: '#7c6df8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <span style={{ color: '#6b6b8a', fontSize: '0.9rem' }}>Loading admin...</span>
      </div>
    );
  }

  if (isLoginPage) {
    return (
      <AdminContext.Provider value={{ user, token, logout }}>
        <style>{ADMIN_STYLES}</style>
        {children}
      </AdminContext.Provider>
    );
  }

  const visibleNav = user
    ? NAV_ITEMS.filter((n) => n.roles.includes(user.role))
    : [];

  const SIDEBAR_W = sidebarCollapsed ? '72px' : '256px';

  return (
    <AdminContext.Provider value={{ user, token, logout }}>
      <style>{ADMIN_STYLES}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--admin-bg)' }}>
        {/* Sidebar */}
        <aside
          className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}
          style={{
            width: SIDEBAR_W,
            minHeight: '100vh',
            background: 'var(--admin-sidebar)',
            borderRight: '1px solid var(--admin-border)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0, left: 0, bottom: 0,
            zIndex: 200,
            transition: 'width 0.3s ease',
            overflow: 'hidden',
          }}>
          {/* Logo */}
          <div style={{
            padding: sidebarCollapsed ? '1.25rem 0' : '1.25rem 1.5rem',
            borderBottom: '1px solid var(--admin-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            gap: '0.75rem',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '32px', height: '32px', flexShrink: 0,
                background: 'linear-gradient(135deg, #7c6df8, #00d4ff)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', fontWeight: '800', color: '#fff',
              }}>C</div>
              {!sidebarCollapsed && (
                <span style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  color: 'var(--admin-text)',
                  whiteSpace: 'nowrap',
                }}>
                  CWS Admin
                </span>
              )}
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--admin-muted)',
                  cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0,
                }}
              >
                ◀
              </button>
            )}
          </div>

          {/* Collapse toggle when collapsed */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              style={{
                background: 'none', border: 'none',
                color: 'var(--admin-muted)', cursor: 'pointer',
                padding: '0.75rem 0',
                textAlign: 'center', fontSize: '0.9rem',
              }}
            >
              ▶
            </button>
          )}

          {/* Nav */}
          <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
            {visibleNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: sidebarCollapsed ? '0.75rem 0' : '0.7rem 1.25rem',
                    margin: '0.1rem 0.75rem',
                    borderRadius: '10px',
                    transition: 'all 0.15s ease',
                    background: isActive ? 'rgba(124,109,248,0.12)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(124,109,248,0.25)' : 'transparent'}`,
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(124,109,248,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? '600' : '400',
                      color: isActive ? 'var(--admin-primary-light)' : 'var(--admin-secondary)',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          {user && (
            <div style={{
              padding: sidebarCollapsed ? '1rem 0' : '1rem 1.25rem',
              borderTop: '1px solid var(--admin-border)',
            }}>
              {!sidebarCollapsed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '36px', height: '36px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #7c6df8, #00d4ff)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', fontWeight: '700', color: '#fff',
                  }}>
                    {user.name.charAt(0)}
                  </div>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontSize: '0.825rem', fontWeight: '600', color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', textTransform: 'capitalize' }}>
                      {user.role.replace('_', ' ')}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--admin-muted)', cursor: 'pointer',
                      fontSize: '1rem', flexShrink: 0,
                    }}
                    title="Logout"
                  >
                    🚪
                  </button>
                </div>
              ) : (
                <button
                  onClick={logout}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--admin-muted)', cursor: 'pointer',
                    fontSize: '1rem', width: '100%',
                  }}
                  title="Logout"
                >
                  🚪
                </button>
              )}
            </div>
          )}
        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />
        )}

        {/* Main */}
        <main
          className="admin-main"
          style={{
            flex: 1,
            marginLeft: SIDEBAR_W,
            transition: 'margin-left 0.3s ease',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top Bar */}
          <div
            className="admin-topbar"
            style={{
              height: '64px',
              background: 'var(--admin-sidebar)',
              borderBottom: '1px solid var(--admin-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2rem',
              position: 'sticky',
              top: 0,
              zIndex: 100,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="admin-mobile-toggle"
                style={{
                  display: 'none',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'var(--admin-text)',
                  fontSize: '1.1rem',
                  padding: '0.35rem 0.6rem',
                  cursor: 'pointer',
                  marginRight: '0.75rem',
                }}
                aria-label="Toggle navigation drawer"
              >
                ☰
              </button>
              <div style={{ fontSize: '0.875rem', color: 'var(--admin-muted)' }}>
                {pathname.split('/').filter(Boolean).map((seg, i, arr) => (
                  <span key={i}>
                    <span style={{ textTransform: 'capitalize', color: i === arr.length - 1 ? 'var(--admin-text)' : 'var(--admin-muted)' }}>
                      {seg}
                    </span>
                    {i < arr.length - 1 && <span style={{ margin: '0 0.4rem' }}>/</span>}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link
                href="/"
                target="_blank"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--admin-muted)',
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}
              >
                🌐 View Site
              </Link>
            </div>
          </div>

          {/* Page Content */}
          <div className="admin-content-area" style={{ flex: 1, padding: '2rem' }}>
            {children}
          </div>
        </main>
      </div>
    </AdminContext.Provider>
  );
}
