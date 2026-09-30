import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Payment from '@/models/Payment';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const [
      totalCourses,
      activeCourses,
      totalEnrollments,
      paidEnrollments,
      pendingPayments,
      activeStudents,
      revenueData,
      enrollmentTrend,
      courseWiseEnrollments,
      paymentStatusData,
    ] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ status: 'published' }),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: { $in: ['paid', 'confirmed', 'active', 'completed'] } }),
      Enrollment.countDocuments({ status: 'pending' }),
      Enrollment.countDocuments({ status: 'active' }),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Last 30 days enrollment trend
      Enrollment.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Course-wise enrollment count
      Enrollment.aggregate([
        { $group: { _id: '$courseId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: '_id',
            as: 'course',
          },
        },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        { $project: { courseName: '$course.name', count: 1 } },
      ]),
      // Payment status distribution
      Payment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalCourses,
        activeCourses,
        totalEnrollments,
        paidEnrollments,
        pendingPayments,
        activeStudents,
        totalRevenue,
      },
      charts: {
        enrollmentTrend,
        courseWiseEnrollments,
        paymentStatusData,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
