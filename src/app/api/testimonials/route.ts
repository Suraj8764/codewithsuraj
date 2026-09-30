import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Testimonial from '@/models/Testimonial';
import { getAdminFromRequest } from '@/lib/auth';
import { revalidateTestimonials } from '@/lib/revalidate';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const isAdmin = !!getAdminFromRequest(req);
    const courseId = searchParams.get('courseId');

    const query: Record<string, unknown> = {};
    if (!isAdmin) query.isPublished = true;
    if (courseId) query.courseId = courseId;

    const testimonials = await Testimonial.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, testimonials });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const body = await req.json();
    const testimonial = await Testimonial.create(body);

    // Revalidate homepage and testimonials section
    revalidateTestimonials();

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
