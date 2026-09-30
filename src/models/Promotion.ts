import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotion extends Document {
  title: string;
  description: string;
  cta: string;
  ctaUrl: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  type: 'banner' | 'popup' | 'topbar';
  backgroundColor: string;
  textColor: string;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    cta: { type: String, default: '' },
    ctaUrl: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
    type: { type: String, enum: ['banner', 'popup', 'topbar'], default: 'topbar' },
    backgroundColor: { type: String, default: '#6c63ff' },
    textColor: { type: String, default: '#ffffff' },
  },
  { timestamps: true }
);

export default mongoose.models.Promotion || mongoose.model<IPromotion>('Promotion', PromotionSchema);
