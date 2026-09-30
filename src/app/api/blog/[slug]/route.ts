import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { getAdminFromRequest } from '@/lib/auth';
import { revalidateBlog } from '@/lib/revalidate';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { slug } = await params;
    const isAdmin = !!getAdminFromRequest(req);

    const query: Record<string, unknown> = slug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: slug }
      : { slug };

    if (!isAdmin) {
      query.status = 'published';
    }

    const blog = await Blog.findOneAndUpdate(
      query,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Also fetch related blogs from same category
    const relatedBlogs = await Blog.find({
      category: blog.category,
      _id: { $ne: blog._id },
      status: 'published',
    })
      .limit(3)
      .select('title slug coverImage excerpt publishedAt author')
      .lean();

    return NextResponse.json({ success: true, blog, relatedBlogs });
  } catch (error) {
    console.error('Blog slug GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { slug } = await params;
    const body = await req.json();

    const query: Record<string, unknown> = slug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: slug }
      : { slug };

    if (body.status === 'published' && !body.publishedAt) {
      body.publishedAt = new Date();
    }

    const blog = await Blog.findOneAndUpdate(query, body, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    revalidateBlog();

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error('Blog PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { slug } = await params;

    const query: Record<string, unknown> = slug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: slug }
      : { slug };

    const blog = await Blog.findOneAndDelete(query);

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    revalidateBlog();

    return NextResponse.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
