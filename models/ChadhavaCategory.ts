import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChadhavaCategory extends Document {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChadhavaCategorySchema = new Schema<IChadhavaCategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ChadhavaCategory: Model<IChadhavaCategory> =
  mongoose.models.ChadhavaCategory || mongoose.model<IChadhavaCategory>("ChadhavaCategory", ChadhavaCategorySchema);

export default ChadhavaCategory;
