import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  content: string;
  author: string;
  authorImage?: string;
  category: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  status: 'draft' | 'published';
  publishedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    coverImage: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    content: { type: String, required: true },
    author: { type: String, required: true },
    authorImage: { type: String },
    category: { type: String, required: true },
    tags: [{ type: String }],
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BlogSchema.index({ slug: 1 });
BlogSchema.index({ status: 1 });
BlogSchema.index({ category: 1 });

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
