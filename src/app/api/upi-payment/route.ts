import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import PaymentAttempt from '@/models/PaymentAttempt';
import AuditLog from '@/models/AuditLog';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST: Submit a UPI payment attempt (with screenshot upload)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const candidateName = formData.get('candidateName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const courseId = formData.get('courseId') as string;
    const utr = formData.get('utr') as string;
    const notes = formData.get('notes') as string || '';
    const paymentDate = formData.get('paymentDate') as string || '';
    const screenshotFile = formData.get('screenshot') as File | null;

    // Validate required fields
    if (!candidateName || !email || !phone || !courseId || !utr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // UTR format validation
    const cleanUtr = utr.trim().replace(/\s/g, '');
    if (cleanUtr.length < 6) {
      return NextResponse.json({ error: 'Invalid UTR number' }, { status: 400 });
    }

    // Fetch course server-side — NEVER trust client price
    const course = await Course.findOne({
      _id: courseId,
      status: 'published',
      enrollmentStatus: 'open',
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not available for enrollment' }, { status: 404 });
    }

    if (course.availableSeats <= 0) {
      return NextResponse.json({ error: 'No seats available' }, { status: 400 });
    }

    const amount = course.discountPrice > 0 ? course.discountPrice : course.price;

    // Check for duplicate UTR (prevent double submission)
    const duplicateUtr = await PaymentAttempt.findOne({ utr: cleanUtr, status: { $ne: 'rejected' } });
    if (duplicateUtr) {
      return NextResponse.json(
        { error: 'This UTR has already been submitted. Please contact support if this is an error.' },
        { status: 409 }
      );
    }

    // Upload screenshot to Cloudinary if provided
    let screenshotUrl: string | undefined;
    if (screenshotFile) {
      const arrayBuffer = await screenshotFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      screenshotUrl = await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'payment_screenshots',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          }
        );
        stream.end(buffer);
      });
    }

    // Check if enrollment already exists for this email + course
    let enrollment = await Enrollment.findOne({ email: email.toLowerCase(), courseId });

    if (enrollment) {
      // Resubmission flow — only allowed if previous attempt was rejected
      if (enrollment.paymentStatus === 'pending') {
        return NextResponse.json(
          { error: 'You already have a pending payment submission. Please wait for admin verification.' },
          { status: 409 }
        );
      }
      if (enrollment.paymentStatus === 'verified' && enrollment.courseAccess) {
        return NextResponse.json(
          { error: 'You are already enrolled in this course.' },
          { status: 409 }
        );
      }

      // Count existing attempts for this enrollment
      const existingAttempts = await PaymentAttempt.countDocuments({ enrollmentId: enrollment._id });

      // Create new payment attempt (resubmission)
      const attempt = await PaymentAttempt.create({
        enrollmentId: enrollment._id,
        courseId,
        candidateName,
        email: email.toLowerCase(),
        phone,
        paymentMethod: 'upi_manual',
        amount,
        currency: course.currency || 'INR',
        utr: cleanUtr,
        paymentScreenshot: screenshotUrl,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        notes,
        status: 'pending',
        attemptNumber: existingAttempts + 1,
        submittedAt: new Date(),
      });

      // Reset enrollment to pending
      await Enrollment.findByIdAndUpdate(enrollment._id, {
        paymentStatus: 'pending',
        enrollmentStatus: 'pending',
        courseAccess: false,
        latestPaymentAttemptId: attempt._id,
        rejectionReason: undefined,
        notes: `Resubmission #${existingAttempts + 1} | UTR: ${cleanUtr}`,
      });

      // Audit log
      await AuditLog.create({
        action: 'payment_resubmitted',
        performedBy: 'candidate',
        enrollmentId: enrollment._id,
        paymentAttemptId: attempt._id,
        metadata: { utr: cleanUtr, attemptNumber: existingAttempts + 1, candidateName, email },
        timestamp: new Date(),
      });

      return NextResponse.json({
        success: true,
        isResubmission: true,
        enrollmentId: enrollment._id,
        attemptId: attempt._id,
        courseName: course.name,
        amount,
        utr: cleanUtr,
      });
    }

    // Fresh enrollment — create enrollment record first
    enrollment = await Enrollment.create({
      candidateName,
      email: email.toLowerCase(),
      phone,
      courseId,
      paymentMethod: 'upi_manual',
      paymentStatus: 'pending',
      enrollmentStatus: 'pending',
      courseAccess: false,
      status: 'pending',
      source: 'website',
    });

    // Create first payment attempt
    const attempt = await PaymentAttempt.create({
      enrollmentId: enrollment._id,
      courseId,
      candidateName,
      email: email.toLowerCase(),
      phone,
      paymentMethod: 'upi_manual',
      amount,
      currency: course.currency || 'INR',
      utr: cleanUtr,
      paymentScreenshot: screenshotUrl,
      paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      notes,
      status: 'pending',
      attemptNumber: 1,
      submittedAt: new Date(),
    });

    // Link latest attempt to enrollment
    await Enrollment.findByIdAndUpdate(enrollment._id, {
      latestPaymentAttemptId: attempt._id,
    });

    // Audit log
    await AuditLog.create({
      action: 'payment_submitted',
      performedBy: 'candidate',
      enrollmentId: enrollment._id,
      paymentAttemptId: attempt._id,
      metadata: { utr: cleanUtr, candidateName, email, courseId, amount },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      enrollmentId: enrollment._id,
      attemptId: attempt._id,
      courseName: course.name,
      amount,
      currency: course.currency || 'INR',
      utr: cleanUtr,
    });
  } catch (error) {
    console.error('UPI submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
