import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import '@/models/Trainer';
import CourseDetailClient from './CourseDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCourse(slug: string) {
  try {
    await dbConnect();
    const course = await Course.findOne({ slug, status: 'published' })
      .populate('trainers', 'name photo designation bio experience skills linkedin github portfolio')
      .lean();
    return course;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: 'Course Not Found' };
  return {
    title: (course as Record<string, unknown>).seoTitle as string || (course as Record<string, unknown>).name as string,
    description: (course as Record<string, unknown>).seoDescription as string || (course as Record<string, unknown>).shortDescription as string,
    keywords: (course as Record<string, unknown>).seoKeywords as string[] || (course as Record<string, unknown>).technologies as string[],
    openGraph: {
      title: (course as Record<string, unknown>).name as string,
      description: (course as Record<string, unknown>).shortDescription as string,
      images: ((course as Record<string, unknown>).heroImage || (course as Record<string, unknown>).thumbnail) 
        ? [{ url: ((course as Record<string, unknown>).heroImage || (course as Record<string, unknown>).thumbnail) as string }] 
        : [],
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  // Serialize the lean Mongoose document to a plain object for the client
  const plainCourse = JSON.parse(JSON.stringify(course));
  return <CourseDetailClient course={plainCourse} />;
}
