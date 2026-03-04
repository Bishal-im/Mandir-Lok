import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ILocalizedString {
  en: string;
  hi?: string;
  ne?: string;
  mr?: string;
  ta?: string;
}

export interface IPoojaPackage {
  name: string | ILocalizedString;
  members: number;
  price: number;
}

export interface IPooja extends Document {
  name: string | ILocalizedString;
  slug: string;
  templeId?: Types.ObjectId;
  templeIds: Types.ObjectId[];
  deity: string;
  emoji: string;
  description: string | ILocalizedString;
  about: string | ILocalizedString;
  price: number;
  duration: string | ILocalizedString;
  benefits: (string | ILocalizedString)[];
  includes: (string | ILocalizedString)[];
  tag: string | ILocalizedString;
  tagColor: string;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  isFeatured: boolean;
  availableDays: string; // This matches the key in translations.ts
  images: string[];
  packages: IPoojaPackage[];
  createdAt: Date;
  updatedAt: Date;
}

const LocalizedStringSchema = new Schema({
  en: { type: String, required: true },
  hi: { type: String, default: "" },
  ne: { type: String, default: "" },
  mr: { type: String, default: "" },
  ta: { type: String, default: "" },
}, { _id: false });

const PoojaSchema = new Schema<IPooja>(
  {
    name: { type: Schema.Types.Mixed, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    templeId: { type: Schema.Types.ObjectId, ref: "Temple", required: false },
    templeIds: [{ type: Schema.Types.ObjectId, ref: "Temple", default: [] }],
    deity: { type: String, required: true },
    emoji: { type: String, default: "🪔" },
    description: { type: Schema.Types.Mixed, required: true },
    about: { type: Schema.Types.Mixed, default: "" },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Schema.Types.Mixed, required: true },
    benefits: [{ type: Schema.Types.Mixed }],
    includes: [{ type: Schema.Types.Mixed }],
    tag: { type: Schema.Types.Mixed, default: "" },
    tagColor: { type: String, default: "" },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    availableDays: { type: String, default: "Every Day" },
    images: [{ type: String }],
    packages: [
      {
        name: { type: Schema.Types.Mixed, required: true },
        members: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Force re-registration in development to handle schema changes without restart
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Pooja;
}

const Pooja: Model<IPooja> =
  mongoose.models.Pooja || mongoose.model<IPooja>("Pooja", PoojaSchema);

export default Pooja;