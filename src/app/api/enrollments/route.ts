import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Payment from '@/models/Payment';
import { getAdminFromRequest } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import { v4 as uuidv4 } from 'uuid';

// Create Razorpay order — server-side price verification
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { candidateName, email, phone, courseId, paymentMethod, utrNumber } = await req.json();

    if (!candidateName || !email || !phone || !courseId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Fetch price server-side — NEVER trust client price
    const course = await Course.findOne({ _id: courseId, status: 'published', enrollmentStatus: 'open' });
    if (!course) {
      return NextResponse.json({ error: 'Course not available for enrollment' }, { status: 404 });
    }

    if (course.availableSeats <= 0) {
      return NextResponse.json({ error: 'No seats available' }, { status: 400 });
    }

    const amount = course.discountPrice > 0 ? course.discountPrice : course.price;

    // Handle Direct UPI / QR Code payment
    if (paymentMethod === 'upi_qr') {
      const upiOrderId = `upi_${uuidv4().replace(/-/g, '').slice(0, 18)}`;
      const enrollment = await Enrollment.create({
        candidateName,
        email,
        phone,
        courseId,
        status: 'pending',
        source: 'upi_qr',
        notes: utrNumber
          ? `Direct UPI Payment | UTR: ${utrNumber} | Paid to: surajkumarsahoo1997@ybl`
          : 'Direct PhonePe / UPI QR Payment | Verification Pending',
      });

      const payment = await Payment.create({
        enrollmentId: enrollment._id,
        courseId,
        candidateName,
        email,
        amount,
        currency: course.currency || 'INR',
        razorpayOrderId: upiOrderId,
        razorpayPaymentId: utrNumber || 'MANUAL_UPI_QR',
        status: 'pending',
        metadata: {
          method: 'upi_qr',
          upiId: 'surajkumarsahoo1997@ybl',
          utrNumber: utrNumber || null,
        },
      });

      await Enrollment.findByIdAndUpdate(enrollment._id, {
        paymentId: payment._id,
        razorpayOrderId: upiOrderId,
      });

      return NextResponse.json({
        success: true,
        isUpi: true,
        enrollmentId: enrollment._id,
        courseName: course.name,
        amount,
        currency: course.currency || 'INR',
      });
    }

    // Create enrollment record
    const receipt = `rcpt_${uuidv4().replace(/-/g, '').slice(0, 20)}`;
    const enrollment = await Enrollment.create({
      candidateName,
      email,
      phone,
      courseId,
      status: 'pending',
    });

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amount: Math.round(amount * 100), // paise
      currency: course.currency || 'INR',
      receipt,
      notes: {
        courseId: courseId,
        enrollmentId: enrollment._id.toString(),
        candidateName,
        email,
      },
    });

    // Create payment record
    const payment = await Payment.create({
      enrollmentId: enrollment._id,
      courseId,
      candidateName,
      email,
      amount,
      currency: course.currency || 'INR',
      razorpayOrderId: order.id,
      status: 'pending',
    });

    // Link payment to enrollment
    await Enrollment.findByIdAndUpdate(enrollment._id, {
      paymentId: payment._id,
      razorpayOrderId: order.id,
    });

    // Revalidate course page to update seat availability
    revalidatePath('/');
    revalidatePath('/courses');
    if (course.slug) revalidatePath(`/courses/${course.slug}`);
    revalidateTag('courses', 'max');

    return NextResponse.json({
      success: true,
      orderId: order.id,
      enrollmentId: enrollment._id,
      amount,
      currency: course.currency || 'INR',
      courseName: course.name,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Enrollment POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Admin: Get all enrollments
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = {};
    if (courseId) query.courseId = courseId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { candidateName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [enrollments, total] = await Promise.all([
      Enrollment.find(query)
        .populate('courseId', 'name slug price')
        .populate('paymentId', 'amount status razorpayPaymentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enrollment.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      enrollments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Enrollments GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
