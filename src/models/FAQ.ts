import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  courseId?: Types.ObjectId;
  isGlobal: boolean;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    isGlobal: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FAQSchema.index({ courseId: 1, order: 1 });
FAQSchema.index({ isGlobal: 1 });

export default mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema);
