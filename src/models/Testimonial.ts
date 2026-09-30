import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  photo: string;
  designation: string;
  company: string;
  review: string;
  rating: number;
  courseId?: Types.ObjectId;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    photo: { type: String, default: '' },
    designation: { type: String, default: '' },
    company: { type: String, default: '' },
    review: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    isPublished: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
