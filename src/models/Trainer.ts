import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainer extends Document {
  name: string;
  photo: string;
  designation: string;
  bio: string;
  experience: number;
  skills: string[];
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  youtube?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerSchema = new Schema<ITrainer>(
  {
    name: { type: String, required: true, trim: true },
    photo: { type: String, default: '' },
    designation: { type: String, required: true },
    bio: { type: String, required: true },
    experience: { type: Number, default: 0 },
    skills: [{ type: String }],
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String },
    twitter: { type: String },
    youtube: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Trainer || mongoose.model<ITrainer>('Trainer', TrainerSchema);
