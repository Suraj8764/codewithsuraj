import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  performedBy?: string; // admin userId or 'system'
  performedByName?: string;
  enrollmentId?: Types.ObjectId;
  paymentAttemptId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    performedBy: { type: String },
    performedByName: { type: String },
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'Enrollment' },
    paymentAttemptId: { type: Schema.Types.ObjectId, ref: 'PaymentAttempt' },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AuditLogSchema.index({ enrollmentId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ timestamp: -1 });

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
