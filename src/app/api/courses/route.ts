import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import '@/models/Trainer';
import { getAdminFromRequest } from '@/lib/auth';
import { revalidateCourses } from '@/lib/revalidate';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isAdmin = !!getAdminFromRequest(req);

    const query: Record<string, unknown> = {};

    if (!isAdmin) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    if (category) query.category = category;
    if (level) query.level = level;
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { fullDescription: { $regex: search, $options: 'i' } },
        { technologies: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('trainers', 'name photo designation')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(query),
    ]);

    const response = NextResponse.json({
      success: true,
      courses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });

    // Add cache tags for revalidation
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('x-cache-tags', 'courses,categories');

    return response;
  } catch (error) {
    console.error('Courses GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    const course = await Course.create(body);

    // Revalidate all course-related pages
    revalidateCourses();

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error: unknown) {
    console.error('Course POST error:', error);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'A course with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
