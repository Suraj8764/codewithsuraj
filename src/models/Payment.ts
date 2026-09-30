import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  enrollmentId: Types.ObjectId;
  courseId: Types.ObjectId;
  candidateName: string;
  email: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  refundStatus?: 'none' | 'requested' | 'processed';
  refundAmount?: number;
  refundId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    candidateName: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'processed'],
      default: 'none',
    },
    refundAmount: { type: Number },
    refundId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

PaymentSchema.index({ razorpayOrderId: 1 });
PaymentSchema.index({ enrollmentId: 1 });
PaymentSchema.index({ status: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
