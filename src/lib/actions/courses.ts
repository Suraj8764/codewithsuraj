'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { getAdminFromToken } from '@/lib/auth';

export async function createCourse(formData: FormData) {
  try {
    const token = formData.get('token') as string;
    const admin = getAdminFromToken(token);
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();

    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      shortDescription: formData.get('shortDescription') as string,
      fullDescription: formData.get('fullDescription') as string,
      category: formData.get('category') as string,
      level: formData.get('level') as string,
      duration: formData.get('duration') as string,
      price: Number(formData.get('price')),
      discountPrice: Number(formData.get('discountPrice')),
      currency: formData.get('currency') as string,
      thumbnail: formData.get('thumbnail') as string,
      heroImage: formData.get('heroImage') as string,
      technologies: JSON.parse(formData.get('technologies') as string || '[]'),
      skillsCovered: JSON.parse(formData.get('skillsCovered') as string || '[]'),
      learningOutcomes: JSON.parse(formData.get('learningOutcomes') as string || '[]'),
      requirements: JSON.parse(formData.get('requirements') as string || '[]'),
      whoIsThisFor: JSON.parse(formData.get('whoIsThisFor') as string || '[]'),
      classMode: formData.get('classMode') as string,
      classTimings: formData.get('classTimings') as string,
      numberOfSessions: Number(formData.get('numberOfSessions')),
      enrollmentStatus: formData.get('enrollmentStatus') as string,
      maxSeats: Number(formData.get('maxSeats')),
      isFeatured: formData.get('isFeatured') === 'true',
      status: formData.get('status') as string,
      seoTitle: formData.get('seoTitle') as string,
      seoDescription: formData.get('seoDescription') as string,
      seoKeywords: JSON.parse(formData.get('seoKeywords') as string || '[]'),
    };

    const course = await Course.create(data);

    // Revalidate all course-related pages
    revalidatePath('/');
    revalidatePath('/courses');
    revalidateTag('courses', 'max');
    revalidateTag('categories', 'max');

    return { success: true, course };
  } catch (error: unknown) {
    console.error('Create course error:', error);
    if ((error as { code?: number }).code === 11000) {
      return { success: false, error: 'A course with this slug already exists' };
    }
    return { success: false, error: 'Failed to create course' };
  }
}

export async function updateCourse(id: string, formData: FormData) {
  try {
    const token = formData.get('token') as string;
    const admin = getAdminFromToken(token);
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();

    // Get old course for revalidation
    const oldCourse = await Course.findById(id);

    const data: Record<string, unknown> = {};
    const fields = [
      'name', 'slug', 'shortDescription', 'fullDescription', 'category', 'level',
      'duration', 'price', 'discountPrice', 'currency', 'thumbnail', 'heroImage',
      'classMode', 'classTimings', 'numberOfSessions', 'enrollmentStatus',
      'maxSeats', 'isFeatured', 'status', 'seoTitle', 'seoDescription'
    ];

    for (const field of fields) {
      const value = formData.get(field);
      if (value !== null) {
        if (field === 'price' || field === 'discountPrice' || field === 'numberOfSessions' || field === 'maxSeats') {
          data[field] = Number(value);
        } else if (field === 'isFeatured') {
          data[field] = value === 'true';
        } else {
          data[field] = value;
        }
      }
    }

    // Handle array fields
    const arrayFields = ['technologies', 'skillsCovered', 'learningOutcomes', 'requirements', 'whoIsThisFor', 'seoKeywords'];
    for (const field of arrayFields) {
      const value = formData.get(field);
      if (value) {
        data[field] = JSON.parse(value as string);
      }
    }

    const course = await Course.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!course) {
      return { success: false, error: 'Course not found' };
    }

    // Revalidate all course-related pages
    revalidatePath('/');
    revalidatePath('/courses');
    if (oldCourse?.slug) revalidatePath(`/courses/${oldCourse.slug}`);
    if (course.slug) revalidatePath(`/courses/${course.slug}`);
    revalidateTag('courses', 'max');
    revalidateTag('categories', 'max');

    return { success: true, course };
  } catch (error) {
    console.error('Update course error:', error);
    return { success: false, error: 'Failed to update course' };
  }
}

export async function deleteCourse(id: string, token: string) {
  try {
    const admin = getAdminFromToken(token);
    if (!admin || admin.role !== 'super_admin') {
      return { success: false, error: 'Forbidden' };
    }

    await dbConnect();
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return { success: false, error: 'Course not found' };
    }

    // Revalidate all course-related pages
    revalidatePath('/');
    revalidatePath('/courses');
    if (course.slug) revalidatePath(`/courses/${course.slug}`);
    revalidateTag('courses', 'max');
    revalidateTag('categories', 'max');

    return { success: true, message: 'Course deleted' };
  } catch (error) {
    console.error('Delete course error:', error);
    return { success: false, error: 'Failed to delete course' };
  }
}

export async function publishCourse(id: string, token: string) {
  try {
    const admin = getAdminFromToken(token);
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();
    const course = await Course.findByIdAndUpdate(id, { status: 'published' }, { new: true });
    if (!course) {
      return { success: false, error: 'Course not found' };
    }

    // Revalidate all course-related pages
    revalidatePath('/');
    revalidatePath('/courses');
    if (course.slug) revalidatePath(`/courses/${course.slug}`);
    revalidateTag('courses', 'max');
    revalidateTag('categories', 'max');

    return { success: true, course };
  } catch (error) {
    console.error('Publish course error:', error);
    return { success: false, error: 'Failed to publish course' };
  }
}

export async function unpublishCourse(id: string, token: string) {
  try {
    const admin = getAdminFromToken(token);
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();
    const course = await Course.findByIdAndUpdate(id, { status: 'draft' }, { new: true });
    if (!course) {
      return { success: false, error: 'Course not found' };
    }

    // Revalidate all course-related pages
    revalidatePath('/');
    revalidatePath('/courses');
    if (course.slug) revalidatePath(`/courses/${course.slug}`);
    revalidateTag('courses', 'max');
    revalidateTag('categories', 'max');

    return { success: true, course };
  } catch (error) {
    console.error('Unpublish course error:', error);
    return { success: false, error: 'Failed to unpublish course' };
  }
}
