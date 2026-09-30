import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: string;
  price: number;
  discountPrice: number;
  currency: string;
  thumbnail: string;
  heroImage: string;
  technologies: string[];
  skillsCovered: string[];
  learningOutcomes: string[];
  requirements: string[];
  whoIsThisFor: string[];
  features: { icon: string; title: string; description: string }[];
  classMode: 'Online' | 'Offline' | 'Hybrid';
  classTimings: string;
  numberOfSessions: number;
  trainers: Types.ObjectId[];
  status: 'draft' | 'published' | 'archived';
  enrollmentStatus: 'open' | 'closed' | 'coming_soon';
  maxSeats: number;
  availableSeats: number;
  batchStartDate?: Date;
  batchEndDate?: Date;
  classFrequency: string;
  weekdays: string[];
  isFeatured: boolean;
  order: number;
  enrollmentCount: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, default: '' },
    category: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'All Levels' },
    duration: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    thumbnail: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    technologies: [{ type: String }],
    skillsCovered: [{ type: String }],
    learningOutcomes: [{ type: String }],
    requirements: [{ type: String }],
    whoIsThisFor: [{ type: String }],
    features: [
      {
        icon: { type: String, default: '' },
        title: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],
    classMode: { type: String, enum: ['Online', 'Offline', 'Hybrid'], default: 'Online' },
    classTimings: { type: String, default: '' },
    numberOfSessions: { type: Number, default: 0 },
    trainers: [{ type: Schema.Types.ObjectId, ref: 'Trainer' }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    enrollmentStatus: { type: String, enum: ['open', 'closed', 'coming_soon'], default: 'coming_soon' },
    maxSeats: { type: Number, default: 30 },
    availableSeats: { type: Number, default: 30 },
    batchStartDate: { type: Date },
    batchEndDate: { type: Date },
    classFrequency: { type: String, default: '' },
    weekdays: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
  },
  { timestamps: true }
);

CourseSchema.index({ slug: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ category: 1 });

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
