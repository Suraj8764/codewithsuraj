import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  section: 'general' | 'contact' | 'social' | 'seo' | 'payment' | 'email' | 'homepage' | 'about';
  data: Record<string, unknown>;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    section: {
      type: String,
      required: true,
      unique: true,
      enum: ['general', 'contact', 'social', 'seo', 'payment', 'email', 'homepage', 'about'],
    },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
