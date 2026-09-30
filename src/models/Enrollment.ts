import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEnrollment extends Document {
  candidateName: string;
  email: string;
  phone: string;
  courseId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  razorpayOrderId?: string;

  // Legacy status kept for Razorpay flow compat
  status: 'pending' | 'paid' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';

  // New fields for manual UPI workflow
  paymentMethod: 'razorpay' | 'upi_manual';
  paymentStatus: 'pending' | 'verified' | 'rejected';
  enrollmentStatus: 'pending' | 'active' | 'rejected' | 'cancelled' | 'completed';
  courseAccess: boolean;

  enrollmentNumber?: string; // ENR-2026-000001
  receiptNumber?: string;    // REC-2026-000001

  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: Date;
  rejectionReason?: string;

  // Resubmission tracking
  latestPaymentAttemptId?: Types.ObjectId;

  enrolledAt: Date;
  startDate?: Date;
  notes?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    candidateName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    razorpayOrderId: { type: String },

    status: {
      type: String,
      enum: ['pending', 'paid', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },

    paymentMethod: {
      type: String,
      enum: ['razorpay', 'upi_manual'],
      default: 'upi_manual',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    enrollmentStatus: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    courseAccess: { type: Boolean, default: false },

    enrollmentNumber: { type: String, unique: true, sparse: true },
    receiptNumber: { type: String, unique: true, sparse: true },

    verifiedBy: { type: String },
    verifiedByName: { type: String },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },

    latestPaymentAttemptId: { type: Schema.Types.ObjectId, ref: 'PaymentAttempt' },

    enrolledAt: { type: Date, default: Date.now },
    startDate: { type: Date },
    notes: { type: String },
    source: { type: String, default: 'website' },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ email: 1, courseId: 1 });
EnrollmentSchema.index({ status: 1 });
EnrollmentSchema.index({ courseId: 1 });
EnrollmentSchema.index({ paymentStatus: 1 });
EnrollmentSchema.index({ enrollmentStatus: 1 });
EnrollmentSchema.index({ enrollmentNumber: 1 });

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
