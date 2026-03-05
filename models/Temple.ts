import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITemple extends Document {
  name: string;
  slug: string;
  location: string;
  city: string;
  state: string;
  category: "Jyotirlinga" | "Shaktipeeth" | "Vaishnavite" | "Char Dham" | "Famous Temples";
  deity: string;
  description: string;
  about: string;
  images: string[];
  rating: number;
  totalReviews: number;
  pujasAvailable: number;
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  openTime: string;
  phone: string;
  website: string;
  mapUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const TempleSchema = new Schema<ITemple>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    category: {
      type: String,
      enum: ["Jyotirlinga", "Shaktipeeth", "Vaishnavite", "Char Dham", "Famous Temples"],
      required: true,
    },
    deity: { type: String, required: true },
    description: { type: String, required: true },
    about: { type: String, default: "" },
    images: [{ type: String }],
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    pujasAvailable: { type: Number, default: 0 },
    isPopular: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    openTime: { type: String, default: "6:00 AM – 10:00 PM" },
    phone: { type: String, default: "" },
    website: { type: String, default: "" },
    mapUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const Temple: Model<ITemple> =
  mongoose.models.Temple || mongoose.model<ITemple>("Temple", TempleSchema);

export default Temple;