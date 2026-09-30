import HeroSection from '@/components/public/sections/HeroSection';
import StatsSection from '@/components/public/sections/StatsSection';
import CoursesSection from '@/components/public/sections/CoursesSection';
import FeaturesSection from '@/components/public/sections/FeaturesSection';
import TestimonialsSection from '@/components/public/sections/TestimonialsSection';
import FAQSection from '@/components/public/sections/FAQSection';
import CTASection from '@/components/public/sections/CTASection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CodeWithSuraj — Learn. Build. Excel.',
  description: 'Master modern tech skills with expert-led courses in MERN Stack, Full Stack .NET, Python, React, Node.js, AI & more. Join thousands of developers who transformed their careers.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <CoursesSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
