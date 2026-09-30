import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import { getAdminFromRequest } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const { id } = await params;
    const enrollment = await Enrollment.findById(id)
      .populate('courseId', 'name slug price')
      .populate('paymentId')
      .lean();
    if (!enrollment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, enrollment });
  } catch {
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

    // Admin can update enrollment status but NOT payment status
    const allowedFields = ['status', 'notes', 'startDate'];
    const update: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    const enrollment = await Enrollment.findByIdAndUpdate(id, update, { new: true });
    if (!enrollment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Revalidate course page if enrollment status changed
    if (enrollment.courseId) {
      revalidatePath('/');
      revalidatePath('/courses');
      revalidateTag('courses', 'max');
    }

    return NextResponse.json({ success: true, enrollment });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
