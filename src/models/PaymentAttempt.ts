import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPaymentAttempt extends Document {
  enrollmentId: Types.ObjectId;
  courseId: Types.ObjectId;
  candidateName: string;
  email: string;
  phone: string;

  paymentMethod: 'upi_manual' | 'razorpay';
  amount: number;
  currency: string;

  utr: string;
  transactionId?: string;
  paymentScreenshot?: string; // Cloudinary URL
  paymentDate?: Date;
  notes?: string;

  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;

  attemptNumber: number;

  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;

  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentAttemptSchema = new Schema<IPaymentAttempt>(
  {
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    candidateName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },

    paymentMethod: { type: String, enum: ['upi_manual', 'razorpay'], default: 'upi_manual' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    utr: { type: String, required: true, trim: true },
    transactionId: { type: String, trim: true },
    paymentScreenshot: { type: String },
    paymentDate: { type: Date },
    notes: { type: String },

    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String },

    attemptNumber: { type: Number, default: 1 },

    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PaymentAttemptSchema.index({ enrollmentId: 1 });
PaymentAttemptSchema.index({ status: 1 });
PaymentAttemptSchema.index({ utr: 1 });
PaymentAttemptSchema.index({ email: 1 });

export default mongoose.models.PaymentAttempt ||
  mongoose.model<IPaymentAttempt>('PaymentAttempt', PaymentAttemptSchema);
