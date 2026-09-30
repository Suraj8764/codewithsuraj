import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { ROLE_PERMISSIONS } from '@/lib/auth';

// One-time setup route — secured by setup secret
export async function POST(req: NextRequest) {
  try {
    const { setupSecret, name, email, password } = await req.json();

    if (setupSecret !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 });
    }

    await dbConnect();

    const existing = await User.findOne({ role: 'super_admin' });
    if (existing) {
      return NextResponse.json({ error: 'Super admin already exists' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const permissions = ROLE_PERMISSIONS['super_admin'];

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: 'super_admin',
      permissions,
    });

    return NextResponse.json({
      success: true,
      message: 'Super admin created successfully',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
