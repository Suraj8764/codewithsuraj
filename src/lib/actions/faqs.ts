'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import FAQ from '@/models/FAQ';
import { getAdminFromToken } from '@/lib/auth';

export async function createFAQ(formData: FormData) {
  try {
    const token = formData.get('token') as string;
    const admin = getAdminFromToken(token);
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();

    const data = {
      question: formData.get('question') as string,
      answer: formData.get('answer') as string,
      courseId: formData.get('courseId') as string || undefined,
      isGlobal: formData.get('isGlobal') === 'true',
      order: Number(formData.get('order') || 0),
      isActive: formData.get('isActive') !== 'false',
    };

    const faq = await FAQ.create(data);

    // Revalidate homepage and FAQ section
    revalidatePath('/');
    revalidateTag('faqs', 'max');

    return { success: true, faq };
  } catch (error) {
    console.error('Create FAQ error:', error);
    return { success: false, error: 'Failed to create FAQ' };
  }
}

export async function updateFAQ(id: string, formData: FormData) {
  try {
    const token = formData.get('token') as string;
    const admin = getAdminFromToken(token);
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();

    const data: Record<string, unknown> = {};
    const fields = ['question', 'answer', 'courseId', 'isGlobal', 'order', 'isActive'];

    for (const field of fields) {
      const value = formData.get(field);
      if (value !== null) {
        if (field === 'order') {
          data[field] = Number(value);
        } else if (field === 'isGlobal' || field === 'isActive') {
          data[field] = value === 'true';
        } else {
          data[field] = value;
        }
      }
    }

    const faq = await FAQ.findByIdAndUpdate(id, data, { new: true });
    if (!faq) {
      return { success: false, error: 'FAQ not found' };
    }

    // Revalidate homepage and FAQ section
    revalidatePath('/');
    revalidateTag('faqs', 'max');

    return { success: true, faq };
  } catch (error) {
    console.error('Update FAQ error:', error);
    return { success: false, error: 'Failed to update FAQ' };
  }
}

export async function deleteFAQ(id: string, token: string) {
  try {
    const admin = getAdminFromToken(token);
    if (!admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();
    await FAQ.findByIdAndDelete(id);

    // Revalidate homepage and FAQ section
    revalidatePath('/');
    revalidateTag('faqs', 'max');

    return { success: true, message: 'FAQ deleted' };
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return { success: false, error: 'Failed to delete FAQ' };
  }
}
