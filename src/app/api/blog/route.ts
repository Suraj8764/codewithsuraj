import { NextRequest, NextResponse } from 'next/server';
import { revalidateBlog } from '@/lib/revalidate';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const isAdmin = !!getAdminFromRequest(req);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const query: Record<string, unknown> = {};
    if (!isAdmin) query.status = 'published';
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [blogs, total] = await Promise.all([
      Blog.find(query).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Blog.countDocuments(query),
    ]);

    return NextResponse.json({ success: true, blogs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
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
    if (body.status === 'published' && !body.publishedAt) {
      body.publishedAt = new Date();
    }
    const blog = await Blog.create(body);

    // Revalidate blog pages
    revalidateBlog();

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
