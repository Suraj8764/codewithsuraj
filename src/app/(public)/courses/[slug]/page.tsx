import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CourseDetailClient from './CourseDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCourse(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/courses/${slug}`, {
      next: { revalidate: 60, tags: ['courses', `course-${slug}`] }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.course;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: 'Course Not Found' };
  return {
    title: course.seoTitle || course.name,
    description: course.seoDescription || course.shortDescription,
    keywords: course.seoKeywords || course.technologies,
    openGraph: {
      title: course.name,
      description: course.shortDescription,
      images: course.heroImage || course.thumbnail ? [{ url: course.heroImage || course.thumbnail }] : [],
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  return <CourseDetailClient course={course} />;
}
