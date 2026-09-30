import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProject extends Document {
  courseId: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  technologies: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  objectives: string[];
  features: string[];
  deploymentDetails: string;
  liveUrl?: string;
  githubUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    technologies: [{ type: String }],
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    objectives: [{ type: String }],
    features: [{ type: String }],
    deploymentDetails: { type: String, default: '' },
    liveUrl: { type: String },
    githubUrl: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProjectSchema.index({ courseId: 1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
