import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import PaymentAttempt from '@/models/PaymentAttempt';
import Course from '@/models/Course';
import AuditLog from '@/models/AuditLog';
import { getAdminFromRequest } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

// Generate sequential enrollment/receipt numbers
async function generateNumber(prefix: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await Enrollment.countDocuments({
    enrollmentNumber: { $regex: `^${prefix}-${year}-` },
  });
  const seq = String(count + 1).padStart(6, '0');
  return `${prefix}-${year}-${seq}`;
}

// GET: List all pending UPI payment attempts (admin only)
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const query: Record<string, unknown> = {};
    if (status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { candidateName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { utr: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [attempts, total] = await Promise.all([
      PaymentAttempt.find(query)
        .populate('enrollmentId', 'candidateName email phone enrollmentNumber paymentStatus enrollmentStatus')
        .populate('courseId', 'name slug price discountPrice')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaymentAttempt.countDocuments(query),
    ]);

    // Stats for dashboard cards
    const [pendingCount, verifiedCount, rejectedCount, totalCount] = await Promise.all([
      PaymentAttempt.countDocuments({ status: 'pending' }),
      PaymentAttempt.countDocuments({ status: 'verified' }),
      PaymentAttempt.countDocuments({ status: 'rejected' }),
      PaymentAttempt.countDocuments({}),
    ]);

    return NextResponse.json({
      success: true,
      attempts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: { pending: pendingCount, verified: verifiedCount, rejected: rejectedCount, total: totalCount },
    });
  } catch (error) {
    console.error('GET /api/admin/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Admin approves or rejects a payment attempt
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { action, attemptId, rejectionReason } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject".' }, { status: 400 });
    }

    if (!attemptId) {
      return NextResponse.json({ error: 'attemptId is required' }, { status: 400 });
    }

    const attempt = await PaymentAttempt.findById(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: 'Payment attempt not found' }, { status: 404 });
    }

    if (attempt.status !== 'pending') {
      return NextResponse.json({ error: 'This payment attempt has already been reviewed.' }, { status: 409 });
    }

    if (action === 'reject') {
      if (!rejectionReason || rejectionReason.trim().length < 5) {
        return NextResponse.json({ error: 'Rejection reason is required.' }, { status: 400 });
      }

      // Reject the payment attempt
      await PaymentAttempt.findByIdAndUpdate(attemptId, {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        reviewedBy: admin.userId,
        reviewedAt: new Date(),
      });

      // Update enrollment
      await Enrollment.findByIdAndUpdate(attempt.enrollmentId, {
        paymentStatus: 'rejected',
        enrollmentStatus: 'rejected',
        courseAccess: false,
        rejectionReason: rejectionReason.trim(),
        verifiedBy: admin.userId,
        verifiedByName: admin.email,
        verifiedAt: new Date(),
      });

      await AuditLog.create({
        action: 'payment_rejected',
        performedBy: admin.userId,
        performedByName: admin.email,
        enrollmentId: attempt.enrollmentId,
        paymentAttemptId: attemptId,
        metadata: { rejectionReason: rejectionReason.trim(), utr: attempt.utr },
        timestamp: new Date(),
      });

      return NextResponse.json({ success: true, action: 'rejected' });
    }

    // APPROVE flow
    const enrollment = await Enrollment.findById(attempt.enrollmentId);
    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Generate enrollment and receipt numbers
    const enrollmentNumber = await generateNumber('ENR');
    const receiptNumber = await generateNumber('REC');

    // Mark attempt as verified
    await PaymentAttempt.findByIdAndUpdate(attemptId, {
      status: 'verified',
      reviewedBy: admin.userId,
      reviewedAt: new Date(),
    });

    // Approve enrollment — grant course access
    await Enrollment.findByIdAndUpdate(attempt.enrollmentId, {
      paymentStatus: 'verified',
      enrollmentStatus: 'active',
      courseAccess: true,
      status: 'active',
      enrollmentNumber,
      receiptNumber,
      verifiedBy: admin.userId,
      verifiedByName: admin.email,
      verifiedAt: new Date(),
      rejectionReason: undefined,
    });

    // Decrement available seats
    const course = await Course.findByIdAndUpdate(attempt.courseId, {
      $inc: { availableSeats: -1, enrollmentCount: 1 },
    });

    // Audit log
    await AuditLog.create({
      action: 'payment_approved',
      performedBy: admin.userId,
      performedByName: admin.email,
      enrollmentId: attempt.enrollmentId,
      paymentAttemptId: attemptId,
      metadata: {
        enrollmentNumber,
        receiptNumber,
        utr: attempt.utr,
        amount: attempt.amount,
      },
      timestamp: new Date(),
    });

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/courses');
    if (course?.slug) revalidatePath(`/courses/${course.slug}`);
    revalidateTag('courses', 'max');

    return NextResponse.json({
      success: true,
      action: 'approved',
      enrollmentNumber,
      receiptNumber,
    });
  } catch (error) {
    console.error('POST /api/admin/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
