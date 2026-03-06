import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type PayoutStatus = "requested" | "processing" | "paid" | "rejected";

export interface IPayout extends Document {
  panditId: Types.ObjectId;
  amount: number;
  status: PayoutStatus;
  upiId?: string;
  bankAccount?: string;
  note?: string;
  cashfreePayoutId?: string;
  failureReason?: string;
  utr?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    panditId: { type: Schema.Types.ObjectId, ref: "Pandit", required: true },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["requested", "processing", "paid", "rejected"],
      default: "requested",
    },
    upiId: { type: String, default: "" },
    bankAccount: { type: String, default: "" },
    note: { type: String, default: "" },
    cashfreePayoutId: { type: String, default: "" },
    failureReason: { type: String, default: "" },
    utr: { type: String, default: "" },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Payout: Model<IPayout> =
  mongoose.models.Payout || mongoose.model<IPayout>("Payout", PayoutSchema);

export default Payout;