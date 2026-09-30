import type { Metadata } from 'next';
import '../globals.css';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import PromoBanner from '@/components/public/PromoBanner';
import SmoothScroll from '@/components/SmoothScroll';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'CodeWithSuraj — Learn. Build. Excel.',
    template: '%s | CodeWithSuraj',
  },
  description: 'Master modern tech skills with expert-led courses in MERN Stack, Full Stack .NET, Python, React, Node.js, AI & more.',
  keywords: ['coding courses', 'full stack development', 'MERN stack', 'python', 'react', 'node.js', 'online training', 'web development'],
  openGraph: {
    siteName: 'CodeWithSuraj',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a26',
              color: '#e8e8f0',
              border: '1px solid rgba(108, 99, 255, 0.2)',
              borderRadius: '12px',
            },
          }}
        />
        <PromoBanner />
        <PublicNavbar />
        <main>{children}</main>
        <PublicFooter />
      </body>
    </html>
  );
}
