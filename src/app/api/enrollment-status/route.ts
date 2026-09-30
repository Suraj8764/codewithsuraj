import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import PaymentAttempt from '@/models/PaymentAttempt';
import AuditLog from '@/models/AuditLog';

// GET: Candidate checks their enrollment status by email + enrollmentId
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id') || searchParams.get('enrollmentId');
    const email = searchParams.get('email');

    if (!email && !id) {
      return NextResponse.json({ error: 'Email or Enrollment ID is required' }, { status: 400 });
    }

    const query: Record<string, unknown> = {};
    if (email) query.email = email.toLowerCase();
    if (id) query._id = id;

    const enrollments = await Enrollment.find(query)
      .populate('courseId', 'name slug thumbnail price discountPrice currency')
      .populate('latestPaymentAttemptId')
      .sort({ createdAt: -1 })
      .lean();

    // For each enrollment, get all payment attempts + audit trail
    const enriched = await Promise.all(
      enrollments.map(async (enrollment) => {
        const [attempts, auditLogs] = await Promise.all([
          PaymentAttempt.find({ enrollmentId: enrollment._id })
            .sort({ submittedAt: 1 })
            .lean(),
          AuditLog.find({ enrollmentId: enrollment._id })
            .sort({ timestamp: 1 })
            .lean(),
        ]);
        return { ...enrollment, paymentAttempts: attempts, auditLogs };
      })
    );

    return NextResponse.json({ success: true, enrollments: enriched });
  } catch (error) {
    console.error('GET enrollment-status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
