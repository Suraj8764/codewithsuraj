import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Trainer from '@/models/Trainer';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get('all') === 'true' || !!getAdminFromRequest(req);
    const filter = showAll ? {} : { isActive: true };
    const trainers = await Trainer.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, trainers });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const trainer = await Trainer.create(body);

    // Revalidate courses and trainer-related pages
    revalidatePath('/');
    revalidatePath('/courses');
    revalidateTag('trainers', 'max');
    revalidateTag('courses', 'max');

    return NextResponse.json({ success: true, trainer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
