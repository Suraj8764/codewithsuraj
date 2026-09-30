import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import CourseModule from '@/models/CourseModule';
import CourseTopic from '@/models/CourseTopic';
import { getAdminFromRequest } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    const modules = await CourseModule.find({ courseId: id }).sort({ order: 1 }).lean();
    const topics = await CourseTopic.find({ courseId: id }).sort({ order: 1 }).lean();

    // Group topics by module
    const curriculum = modules.map((mod) => ({
      ...mod,
      topics: topics.filter((t) => t.moduleId.toString() === mod._id.toString()),
    }));

    return NextResponse.json({ success: true, curriculum });
  } catch (error) {
    console.error('Curriculum GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { action, data } = body;

    // Get course for revalidation
    const Course = (await import('@/models/Course')).default;
    const course = await Course.findById(id);

    switch (action) {
      case 'add_module': {
        const count = await CourseModule.countDocuments({ courseId: id });
        const module = await CourseModule.create({ ...data, courseId: id, order: count });

        // Revalidate course page
        if (course?.slug) {
          revalidatePath(`/courses/${course.slug}`);
          revalidateTag('courses', 'max');
        }

        return NextResponse.json({ success: true, module }, { status: 201 });
      }
      case 'update_module': {
        const module = await CourseModule.findByIdAndUpdate(data._id, data, { new: true });

        if (course?.slug) {
          revalidatePath(`/courses/${course.slug}`);
          revalidateTag('courses', 'max');
        }

        return NextResponse.json({ success: true, module });
      }
      case 'delete_module': {
        await CourseModule.findByIdAndDelete(data.moduleId);
        await CourseTopic.deleteMany({ moduleId: data.moduleId });

        if (course?.slug) {
          revalidatePath(`/courses/${course.slug}`);
          revalidateTag('courses', 'max');
        }

        return NextResponse.json({ success: true });
      }
      case 'reorder_modules': {
        const updates = data.modules.map((m: { _id: string; order: number }) =>
          CourseModule.findByIdAndUpdate(m._id, { order: m.order })
        );
        await Promise.all(updates);

        if (course?.slug) {
          revalidatePath(`/courses/${course.slug}`);
          revalidateTag('courses', 'max');
        }

        return NextResponse.json({ success: true });
      }
      case 'add_topic': {
        const count = await CourseTopic.countDocuments({ moduleId: data.moduleId });
        const topic = await CourseTopic.create({ ...data, courseId: id, order: count });

        if (course?.slug) {
          revalidatePath(`/courses/${course.slug}`);
          revalidateTag('courses', 'max');
        }

        return NextResponse.json({ success: true, topic }, { status: 201 });
      }
      case 'update_topic': {
        const topic = await CourseTopic.findByIdAndUpdate(data._id, data, { new: true });

        if (course?.slug) {
          revalidatePath(`/courses/${course.slug}`);
          revalidateTag('courses', 'max');
        }

        return NextResponse.json({ success: true, topic });
      }
      case 'delete_topic': {
        await CourseTopic.findByIdAndDelete(data.topicId);

        if (course?.slug) {
          revalidatePath(`/courses/${course.slug}`);
          revalidateTag('courses', 'max');
        }

        return NextResponse.json({ success: true });
      }
      case 'reorder_topics': {
        const updates = data.topics.map((t: { _id: string; order: number }) =>
          CourseTopic.findByIdAndUpdate(t._id, { order: t.order })
        );
        await Promise.all(updates);

        if (course?.slug) {
          revalidatePath(`/courses/${course.slug}`);
          revalidateTag('courses', 'max');
        }

        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Curriculum POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
