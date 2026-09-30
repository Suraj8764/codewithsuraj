import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Revalidate all course-related pages
 */
export function revalidateCourses() {
  revalidatePath('/');
  revalidatePath('/courses');
  revalidateTag('courses', 'max');
  revalidateTag('categories', 'max');
}

/**
 * Revalidate a specific course page
 */
export function revalidateCourse(slug: string) {
  revalidatePath('/');
  revalidatePath('/courses');
  revalidatePath(`/courses/${slug}`);
  revalidateTag('courses', 'max');
  revalidateTag(`course-${slug}`, 'max');
}

/**
 * Revalidate homepage
 */
export function revalidateHomepage() {
  revalidatePath('/');
  revalidateTag('homepage', 'max');
}

/**
 * Revalidate testimonials
 */
export function revalidateTestimonials() {
  revalidatePath('/');
  revalidateTag('testimonials', 'max');
}

/**
 * Revalidate FAQs
 */
export function revalidateFAQs() {
  revalidatePath('/');
  revalidateTag('faqs', 'max');
}

/**
 * Revalidate trainers
 */
export function revalidateTrainers() {
  revalidatePath('/');
  revalidatePath('/courses');
  revalidateTag('trainers', 'max');
  revalidateTag('courses', 'max');
}

/**
 * Revalidate promotions
 */
export function revalidatePromotions() {
  revalidatePath('/');
  revalidatePath('/courses');
  revalidateTag('promotions', 'max');
}

/**
 * Revalidate blog
 */
export function revalidateBlog() {
  revalidatePath('/');
  revalidatePath('/blog');
  revalidateTag('blog', 'max');
}

/**
 * Revalidate settings
 */
export function revalidateSettings(section?: string) {
  revalidatePath('/');
  revalidateTag('settings', 'max');
  if (section) {
    revalidateTag(section, 'max');
  }
}

/**
 * Revalidate everything (use sparingly)
 */
export function revalidateAll() {
  revalidatePath('/');
  revalidatePath('/courses');
  revalidatePath('/blog');
  revalidateTag('courses', 'max');
  revalidateTag('categories', 'max');
  revalidateTag('testimonials', 'max');
  revalidateTag('faqs', 'max');
  revalidateTag('trainers', 'max');
  revalidateTag('promotions', 'max');
  revalidateTag('blog', 'max');
  revalidateTag('homepage', 'max');
  revalidateTag('settings', 'max');
}
