import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICourseModule extends Document {
  courseId: Types.ObjectId;
  title: string;
  description: string;
  order: number;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseModuleSchema = new Schema<ICourseModule>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    duration: { type: String, default: '' },
  },
  { timestamps: true }
);

CourseModuleSchema.index({ courseId: 1, order: 1 });

export default mongoose.models.CourseModule || mongoose.model<ICourseModule>('CourseModule', CourseModuleSchema);
