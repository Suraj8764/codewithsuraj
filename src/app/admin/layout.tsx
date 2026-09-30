import type { Metadata } from 'next';
import '../globals.css';
import AdminLayoutClient from './AdminLayoutClient';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'Admin — CodeWithSuraj',
    template: '%s | Admin CMS',
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#0d0d14' }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c1c28',
              color: '#e8e8f0',
              border: '1px solid rgba(124, 109, 248, 0.2)',
              borderRadius: '12px',
            },
          }}
        />
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </body>
    </html>
  );
}
