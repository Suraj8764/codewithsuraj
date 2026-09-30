import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Promotion from '@/models/Promotion';
import { getAdminFromRequest } from '@/lib/auth';
import { revalidatePromotions } from '@/lib/revalidate';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const promotion = await Promotion.findById(id).lean();
    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, promotion });
  } catch (error) {
    console.error('Promotion GET error:', error);
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

    const promotion = await Promotion.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    revalidatePromotions();

    return NextResponse.json({ success: true, promotion });
  } catch (error) {
    console.error('Promotion PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const promotion = await Promotion.findByIdAndDelete(id);

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    revalidatePromotions();

    return NextResponse.json({ success: true, message: 'Promotion deleted' });
  } catch (error) {
    console.error('Promotion DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
