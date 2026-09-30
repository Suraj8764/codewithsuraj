import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import '@/models/Trainer';
import { getAdminFromRequest } from '@/lib/auth';
import { revalidateCourses, revalidateCourse } from '@/lib/revalidate';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const isAdmin = !!getAdminFromRequest(req);

    // Can query by ID or slug
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    if (!isAdmin) (query as Record<string, unknown>).status = 'published';

    const course = await Course.findOne(query)
      .populate('trainers', 'name photo designation bio experience skills linkedin github portfolio')
      .lean();

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error('Course GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    // Get the old course to have the slug for revalidation
    const oldCourse = await Course.findById(id);
    const course = await Course.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    // Revalidate course pages
    revalidateCourses();
    if (course.slug) revalidateCourse(course.slug);

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error('Course PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin || admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    // Revalidate course pages
    revalidateCourses();
    if (course.slug) revalidateCourse(course.slug);

    return NextResponse.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    console.error('Course DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
