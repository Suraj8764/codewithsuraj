import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FAQ from '@/models/FAQ';
import { getAdminFromRequest } from '@/lib/auth';
import { revalidateFAQs } from '@/lib/revalidate';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const faq = await FAQ.findById(id).lean();
    if (!faq) return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    return NextResponse.json({ success: true, faq });
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

    const faq = await FAQ.findByIdAndUpdate(id, body, { new: true });
    if (!faq) return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });

    revalidateFAQs();
    return NextResponse.json({ success: true, faq });
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
    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });

    revalidateFAQs();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
