import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPoojaPackage {
  name: string;
  members: number;
  price: number;
}

export interface IPooja extends Document {
  name: string;
  slug: string;
  templeId?: Types.ObjectId;
  templeIds: Types.ObjectId[];
  deity: string;
  emoji: string;
  description: string;
  about: string;
  price: number;
  duration: string;
  benefits: string[];
  includes: string[];
  tag: string;
  tagColor: string;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  isFeatured: boolean;
  availableDays: string; // e.g. "Every Monday", "Every Day"
  images: string[];
  packages: IPoojaPackage[];
  createdAt: Date;
  updatedAt: Date;
}

const PoojaSchema = new Schema<IPooja>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    templeId: { type: Schema.Types.ObjectId, ref: "Temple", required: false },
    templeIds: [{ type: Schema.Types.ObjectId, ref: "Temple", default: [] }],
    deity: { type: String, required: true },
    emoji: { type: String, default: "🪔" },
    description: { type: String, required: true },
    about: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    duration: { type: String, required: true },
    benefits: [{ type: String }],
    includes: [{ type: String }],
    tag: { type: String, default: "" }, // e.g. "MOST POPULAR", "TRENDING"
    tagColor: { type: String, default: "" }, // e.g. "bg-orange-500"
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    availableDays: { type: String, default: "Every Day" },
    images: [{ type: String }],
    packages: [
      {
        name: { type: String, required: true },
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