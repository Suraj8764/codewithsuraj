import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Course.distinct('category', { status: 'published' });
    const sorted = (categories as string[])
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ success: true, categories: sorted });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
