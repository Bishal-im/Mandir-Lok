import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ILocalizedString {
  en: string;
  hi?: string;
  ne?: string;
  mr?: string;
  ta?: string;
}

export interface IPandit extends Document {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  photo: string;
  assignedTemples: Types.ObjectId[];
  experienceYears: number;
  languages: string[];
  bio: string | ILocalizedString;
  commissionPercentage: number;
  totalEarnings: number;
  unpaidEarnings: number;
  razorpayContactId?: string;
  razorpayFundAccountId?: string;
  aadhaarCardUrl?: string;
  aadhaarStatus: "none" | "pending" | "verified" | "rejected";
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PanditSchema = new Schema<IPandit>(
  {
    name: { type: String, required: true },
    phone: { type: String, default: null, unique: true, sparse: true },
    whatsapp: { type: String, default: null },
    email: { type: String, default: null, unique: true, sparse: true },
    photo: { type: String, default: "" },
    assignedTemples: [{ type: Schema.Types.ObjectId, ref: "Temple" }],
    experienceYears: { type: Number, default: 0 },
    languages: [{ type: String }],
    bio: { type: Schema.Types.Mixed, default: "" },
    commissionPercentage: { type: Number, default: 80 }, // Default 80% to Pandit, 20% to Platform
    totalEarnings: { type: Number, default: 0 },
    unpaidEarnings: { type: Number, default: 0 },
    razorpayContactId: { type: String, default: "" },
    razorpayFundAccountId: { type: String, default: "" },
    aadhaarCardUrl: { type: String, default: "" },
    aadhaarStatus: {
      type: String,
      enum: ["none", "pending", "verified", "rejected"],
      default: "none"
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true, autoIndex: true }
);

// In development, always re-compile the model to pick up schema changes.
// In production, use the cached model for performance.
if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).Pandit;
}

const Pandit: Model<IPandit> =
  mongoose.models.Pandit || mongoose.model<IPandit>("Pandit", PanditSchema);

export default Pandit;
