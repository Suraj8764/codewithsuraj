import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookie = req.cookies.get('admin_token');
  return cookie?.value || null;
}

export function getAdminFromRequest(req: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function getAdminFromToken(token: string): JWTPayload | null {
  if (!token) return null;
  return verifyToken(token);
}

export const PERMISSIONS = {
  // Course permissions
  COURSE_VIEW: 'course:view',
  COURSE_CREATE: 'course:create',
  COURSE_EDIT: 'course:edit',
  COURSE_DELETE: 'course:delete',
  COURSE_PUBLISH: 'course:publish',
  // Enrollment permissions
  ENROLLMENT_VIEW: 'enrollment:view',
  ENROLLMENT_MANAGE: 'enrollment:manage',
  // Payment permissions
  PAYMENT_VIEW: 'payment:view',
  // Content permissions
  CONTENT_VIEW: 'content:view',
  CONTENT_MANAGE: 'content:manage',
  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',
  // Trainer permissions
  TRAINER_VIEW: 'trainer:view',
  TRAINER_MANAGE: 'trainer:manage',
  // Blog permissions
  BLOG_VIEW: 'blog:view',
  BLOG_MANAGE: 'blog:manage',
} as const;

export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS),
  course_manager: [
    PERMISSIONS.COURSE_VIEW, PERMISSIONS.COURSE_CREATE, PERMISSIONS.COURSE_EDIT,
    PERMISSIONS.COURSE_DELETE, PERMISSIONS.COURSE_PUBLISH,
    PERMISSIONS.TRAINER_VIEW, PERMISSIONS.TRAINER_MANAGE,
  ],
  enrollment_manager: [
    PERMISSIONS.ENROLLMENT_VIEW, PERMISSIONS.ENROLLMENT_MANAGE,
    PERMISSIONS.PAYMENT_VIEW,
  ],
  content_manager: [
    PERMISSIONS.CONTENT_VIEW, PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.BLOG_VIEW, PERMISSIONS.BLOG_MANAGE,
  ],
};
