import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, enrollmentId } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'failed' }
      );
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Update payment
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
      },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Update enrollment status
    await Enrollment.findByIdAndUpdate(enrollmentId || payment.enrollmentId, {
      status: 'paid',
    });

    // Decrement available seats
    const course = await Course.findByIdAndUpdate(payment.courseId, {
      $inc: { availableSeats: -1, enrollmentCount: 1 },
    });

    // Revalidate course pages to reflect updated seat availability
    if (course?.slug) {
      revalidatePath('/');
      revalidatePath('/courses');
      revalidatePath(`/courses/${course.slug}`);
      revalidateTag('courses', 'max');
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpayPaymentId || payment._id.toString(),
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
