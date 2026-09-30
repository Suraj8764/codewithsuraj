import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getAdminFromRequest, ROLE_PERMISSIONS } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (body.name) user.name = body.name;
    if (body.email) user.email = body.email.toLowerCase();
    if (body.role && body.role !== user.role) {
      user.role = body.role;
      user.permissions = ROLE_PERMISSIONS[body.role as keyof typeof ROLE_PERMISSIONS] || [];
    }
    if (body.isActive !== undefined) {
      // Prevent deactivating own account if super_admin
      if (admin.userId === id && body.isActive === false) {
        return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 });
      }
      user.isActive = body.isActive;
    }
    if (body.password && body.password.trim().length >= 6) {
      user.password = await bcrypt.hash(body.password, 12);
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({ success: true, user: userObj });
  } catch (error) {
    console.error('Admin role PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    if (admin.userId === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Check if this is the last active super_admin
    const targetUser = await User.findById(id);
    if (targetUser?.role === 'super_admin') {
      const superAdminCount = await User.countDocuments({ role: 'super_admin', isActive: true });
      if (superAdminCount <= 1) {
        return NextResponse.json({ error: 'Cannot delete the only active Super Admin' }, { status: 400 });
      }
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Admin role DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
