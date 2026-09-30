import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FAQ from '@/models/FAQ';
import { getAdminFromRequest } from '@/lib/auth';
import { revalidateFAQs } from '@/lib/revalidate';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const isGlobal = searchParams.get('isGlobal');
    const showAll = searchParams.get('all') === 'true' || !!getAdminFromRequest(req);

    const query: Record<string, unknown> = {};
    if (!showAll) query.isActive = true;
    if (courseId) query.courseId = courseId;
    if (isGlobal === 'true') query.isGlobal = true;

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, faqs });
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
    const faq = await FAQ.create(body);

    // Revalidate homepage and FAQ section
    revalidateFAQs();

    return NextResponse.json({ success: true, faq }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
