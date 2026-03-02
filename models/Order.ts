import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type OrderStatus =
  | "pending"       // payment done, pandit not assigned yet
  | "assigned"      // admin assigned pandit, but pandit not accepted yet
  | "confirmed"     // pandit accepted the booking
  | "in-progress"   // pandit started pooja
  | "completed"     // pooja done, video uploaded
  | "cancelled"     // cancelled by user or admin

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface IOrderChadhava {
  chadhavaId: Types.ObjectId;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
}

export interface IOrder extends Document {
  // References
  userId: Types.ObjectId;
  poojaId?: Types.ObjectId;
  templeId: Types.ObjectId;
  panditId?: Types.ObjectId;

  // Booking details
  bookingDate: Date;         // date user chose for pooja
  bookingId: string;         // e.g. BK-1045 (human readable)

  // Sankalp / user details
  sankalpName: string;       // name for sankalp
  gotra: string;
  dob?: string;
  phone: string;
  whatsapp: string;
  sankalp?: string;          // wish / special message
  address?: string;          // for prasad delivery
  qty: number;               // number of devotees

  // Selected chadhava items
  chadhavaItems: IOrderChadhava[];

  // Pricing
  poojaAmount: number;
  chadhavaAmount: number;
  extraDonation: number;
  totalAmount: number;

  // Payment
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // Order tracking
  orderStatus: OrderStatus;
  isDonation: boolean;
  videoUrl?: string;         // AWS S3 URL after pandit uploads
  videoSentAt?: Date;

  packageSelected?: {
    name: string;
    price: number;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const OrderChadhavaSchema = new Schema(
  {
    chadhavaId: { type: Schema.Types.ObjectId, ref: "Chadhava" },
    name: String,
    price: Number,
    emoji: String,
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    poojaId: { type: Schema.Types.ObjectId, ref: "Pooja", required: false, default: null },
    templeId: { type: Schema.Types.ObjectId, ref: "Temple", required: true },
    panditId: { type: Schema.Types.ObjectId, ref: "Pandit", default: null },

    bookingDate: { type: Date, required: true },
    bookingId: { type: String, unique: true },

    sankalpName: { type: String, required: true },
    gotra: { type: String, default: "" },
    dob: { type: String, default: "" },
    phone: { type: String, required: true },
    whatsapp: { type: String, required: true },
    sankalp: { type: String, default: "" },
    address: { type: String, default: "" },
    qty: { type: Number, default: 1 },

    chadhavaItems: [OrderChadhavaSchema],

    poojaAmount: { type: Number, required: true },
    chadhavaAmount: { type: Number, default: 0 },
    extraDonation: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },

    orderStatus: {
      type: String,
      enum: ["pending", "assigned", "confirmed", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    isDonation: { type: Boolean, default: false },

    videoUrl: { type: String, default: "" },
    videoSentAt: { type: Date, default: null },
    packageSelected: {
      name: { type: String },
      price: { type: Number },
    },
  },
  { timestamps: true }
);

// Auto-generate a collision-safe bookingId before save  e.g. BK-1LMXYZ-A3F
// Uses timestamp + random suffix — no DB query, no race conditions.
// Uses async style (no `next` param) which is required for Mongoose 7+.
OrderSchema.pre("save", async function () {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36).toUpperCase();               // base-36 timestamp
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase(); // 4-char random
    this.bookingId = `BK-${timestamp}-${suffix}`;
  }
});

// Force re-registration in development to pick up schema changes
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;