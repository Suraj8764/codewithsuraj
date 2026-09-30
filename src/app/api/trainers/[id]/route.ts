import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Trainer from '@/models/Trainer';
import { getAdminFromRequest } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const trainer = await Trainer.findById(id).lean();
    if (!trainer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, trainer });
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
    const trainer = await Trainer.findByIdAndUpdate(id, body, { new: true });
    if (!trainer) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Revalidate courses and trainer-related pages
    revalidatePath('/');
    revalidatePath('/courses');
    revalidateTag('trainers', 'max');
    revalidateTag('courses', 'max');

    return NextResponse.json({ success: true, trainer });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const { id } = await params;
    await Trainer.findByIdAndDelete(id);

    // Revalidate courses and trainer-related pages
    revalidatePath('/');
    revalidatePath('/courses');
    revalidateTag('trainers', 'max');
    revalidateTag('courses', 'max');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
