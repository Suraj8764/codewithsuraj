import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentAttempt from '@/models/PaymentAttempt';
import AuditLog from '@/models/AuditLog';
import { getAdminFromRequest } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Admin gets a single payment attempt with full history
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;

    const attempt = await PaymentAttempt.findById(id)
      .populate({
        path: 'enrollmentId',
        populate: { path: 'courseId', select: 'name slug price discountPrice currency thumbnail' },
      })
      .lean();

    if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Get all attempts for this enrollment (history)
    const allAttempts = await PaymentAttempt.find({
      enrollmentId: (attempt.enrollmentId as { _id: string })?._id || attempt.enrollmentId,
    })
      .sort({ submittedAt: 1 })
      .lean();

    // Get audit log
    const auditLogs = await AuditLog.find({
      enrollmentId: (attempt.enrollmentId as { _id: string })?._id || attempt.enrollmentId,
    })
      .sort({ timestamp: 1 })
      .lean();

    return NextResponse.json({ success: true, attempt, allAttempts, auditLogs });
  } catch (error) {
    console.error('GET /api/admin/payments/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
