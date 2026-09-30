import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICourseTopic extends Document {
  moduleId: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  description: string;
  order: number;
  duration: string;
  isOptional: boolean;
  subtopics: { title: string; description: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseTopicSchema = new Schema<ICourseTopic>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: 'CourseModule', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    duration: { type: String, default: '' },
    isOptional: { type: Boolean, default: false },
    subtopics: [
      {
        title: { type: String },
        description: { type: String },
      },
    ],
  },
  { timestamps: true }
);

CourseTopicSchema.index({ moduleId: 1, order: 1 });
CourseTopicSchema.index({ courseId: 1 });

export default mongoose.models.CourseTopic || mongoose.model<ICourseTopic>('CourseTopic', CourseTopicSchema);
