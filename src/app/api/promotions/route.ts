import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Promotion from '@/models/Promotion';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const isAdmin = !!getAdminFromRequest(req);
    const now = new Date();

    const query: Record<string, unknown> = {};
    if (!isAdmin) {
      query.isActive = true;
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }

    const promotions = await Promotion.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, promotions });
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
    const promotion = await Promotion.create(body);

    // Revalidate homepage and promotions
    revalidatePath('/');
    revalidatePath('/courses');
    revalidateTag('promotions', 'max');

    return NextResponse.json({ success: true, promotion }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
