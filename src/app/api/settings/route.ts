import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');

    if (section) {
      const settings = await SiteSettings.findOne({ section }).lean();
      return NextResponse.json({ success: true, settings: settings?.data || {} });
    }

    const allSettings = await SiteSettings.find().lean();
    const settingsMap = allSettings.reduce(
      (acc, s) => ({ ...acc, [s.section]: s.data }),
      {} as Record<string, unknown>
    );

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { section, data } = await req.json();

    if (!section || !data) {
      return NextResponse.json({ error: 'Section and data are required' }, { status: 400 });
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { section },
      { section, data },
      { upsert: true, new: true }
    );

    // Revalidate based on section type
    revalidatePath('/');
    revalidateTag('settings', 'max');

    // Section-specific revalidation
    if (section === 'homepage') {
      revalidateTag('homepage', 'max');
    }
    if (section === 'contact') {
      revalidateTag('contact', 'max');
    }
    if (section === 'seo') {
      revalidateTag('seo', 'max');
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
