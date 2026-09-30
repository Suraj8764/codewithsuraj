import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { getAdminFromRequest } from '@/lib/auth';
import { revalidateHomepage } from '@/lib/revalidate';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const settings = await SiteSettings.findOne({ section: 'homepage' }).lean();
    return NextResponse.json({ success: true, settings: settings?.data || {} });
  } catch (error) {
    console.error('Homepage settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const data = await req.json();

    const settings = await SiteSettings.findOneAndUpdate(
      { section: 'homepage' },
      { section: 'homepage', data },
      { upsert: true, new: true }
    );

    // Revalidate homepage
    revalidateHomepage();

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Homepage settings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
