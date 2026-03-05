import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IChadhava extends Document {
  name: string;
  templeId: Types.ObjectId;
  category: string; // e.g. "Bhog", "Vastra", "Deep Daan"
  emoji: string;
  image?: string;
  price: number;
  description: string;
  benefits: string[]; // List of spiritual benefits
  tag: string; // e.g. "MOST POPULAR", "SEASONAL"
  tagColor: string; // Tailwind bg color class
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChadhavaSchema = new Schema<IChadhava>(
  {
    name: { type: String, required: true, trim: true },
    templeId: { type: Schema.Types.ObjectId, ref: "Temple", required: true },
    category: { type: String, default: "General" },
    emoji: { type: String, default: "🌸" },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    benefits: [{ type: String }],
    tag: { type: String, default: "" },
    tagColor: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Chadhava: Model<IChadhava> =
  mongoose.models.Chadhava || mongoose.model<IChadhava>("Chadhava", ChadhavaSchema);

export default Chadhava;