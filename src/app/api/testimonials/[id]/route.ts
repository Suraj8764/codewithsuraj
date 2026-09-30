import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Testimonial from '@/models/Testimonial';
import { getAdminFromRequest } from '@/lib/auth';
import { revalidateTestimonials } from '@/lib/revalidate';

interface RouteParams { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const t = await Testimonial.findByIdAndUpdate(id, body, { new: true });
    if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Revalidate homepage and testimonials section
    revalidateTestimonials();

    return NextResponse.json({ success: true, testimonial: t });
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
    await Testimonial.findByIdAndDelete(id);

    // Revalidate homepage and testimonials section
    revalidateTestimonials();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
