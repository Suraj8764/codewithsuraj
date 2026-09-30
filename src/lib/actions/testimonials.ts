'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Testimonial from '@/models/Testimonial';
import { getAdminFromToken } from '@/lib/auth';

export async function createTestimonial(formData: FormData) {
  try {
    const token = formData.get('token') as string;
    const admin = getAdminFromToken(token);
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();

    const data = {
      name: formData.get('name') as string,
      photo: formData.get('photo') as string,
      designation: formData.get('designation') as string,
      company: formData.get('company') as string,
      review: formData.get('review') as string,
      rating: Number(formData.get('rating')),
      courseId: formData.get('courseId') as string || undefined,
      isPublished: formData.get('isPublished') === 'true',
      order: Number(formData.get('order') || 0),
    };

    const testimonial = await Testimonial.create(data);

    // Revalidate homepage and testimonials section
    revalidatePath('/');
    revalidateTag('testimonials', 'max');

    return { success: true, testimonial };
  } catch (error) {
    console.error('Create testimonial error:', error);
    return { success: false, error: 'Failed to create testimonial' };
  }
}

export async function updateTestimonial(id: string, formData: FormData) {
  try {
    const token = formData.get('token') as string;
    const admin = getAdminFromToken(token);
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();

    const data: Record<string, unknown> = {};
    const fields = ['name', 'photo', 'designation', 'company', 'review', 'courseId', 'isPublished', 'order'];

    for (const field of fields) {
      const value = formData.get(field);
      if (value !== null) {
        if (field === 'rating' || field === 'order') {
          data[field] = Number(value);
        } else if (field === 'isPublished') {
          data[field] = value === 'true';
        } else {
          data[field] = value;
        }
      }
    }

    const testimonial = await Testimonial.findByIdAndUpdate(id, data, { new: true });
    if (!testimonial) {
      return { success: false, error: 'Testimonial not found' };
    }

    // Revalidate homepage and testimonials section
    revalidatePath('/');
    revalidateTag('testimonials', 'max');

    return { success: true, testimonial };
  } catch (error) {
    console.error('Update testimonial error:', error);
    return { success: false, error: 'Failed to update testimonial' };
  }
}

export async function deleteTestimonial(id: string, token: string) {
  try {
    const admin = getAdminFromToken(token);
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();
    await Testimonial.findByIdAndDelete(id);

    // Revalidate homepage and testimonials section
    revalidatePath('/');
    revalidateTag('testimonials', 'max');

    return { success: true, message: 'Testimonial deleted' };
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return { success: false, error: 'Failed to delete testimonial' };
  }
}

export async function publishTestimonial(id: string, token: string) {
  try {
    const admin = getAdminFromToken(token);
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();
    const testimonial = await Testimonial.findByIdAndUpdate(id, { isPublished: true }, { new: true });
    if (!testimonial) {
      return { success: false, error: 'Testimonial not found' };
    }

    // Revalidate homepage and testimonials section
    revalidatePath('/');
    revalidateTag('testimonials', 'max');

    return { success: true, testimonial };
  } catch (error) {
    console.error('Publish testimonial error:', error);
    return { success: false, error: 'Failed to publish testimonial' };
  }
}
