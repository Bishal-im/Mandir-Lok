import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICartItem extends Document {
    userId: Types.ObjectId;
    id: string; // Dynamic ID from frontend
    poojaId: Types.ObjectId;
    poojaName: string;
    poojaEmoji: string;
    templeId: Types.ObjectId;
    templeName: string;
    date: Date;
    packageIndex: number;
    packageName: string;
    packagePrice: number;
    packageMembers: number;
    offeringIds: Types.ObjectId[];
    offerings: {
        id: Types.ObjectId;
        name: string;
        price: number;
        emoji: string;
        quantity: number;
    }[];
    totalPrice: number;
    selected: boolean;
    poojaImage?: string;
    reminderSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        id: { type: String, required: true },
        poojaId: { type: Schema.Types.ObjectId, ref: "Pooja", required: true },
        poojaName: { type: String, required: true },
        poojaEmoji: { type: String, default: "🪔" },
        templeId: { type: Schema.Types.ObjectId, ref: "Temple", required: true },
        templeName: { type: String, required: true },
        date: { type: Date, required: true },
        packageIndex: { type: Number, required: true },
        packageName: { type: String, required: true },
        packagePrice: { type: Number, required: true },
        packageMembers: { type: Number, required: true },
        offeringIds: [{ type: Schema.Types.ObjectId, ref: "Chadhava" }],
        offerings: [
            {
                id: { type: Schema.Types.ObjectId, ref: "Chadhava" },
                name: String,
                price: Number,
                emoji: String,
                quantity: { type: Number, default: 1 },
            },
        ],
        totalPrice: { type: Number, required: true },
        selected: { type: Boolean, default: true },
        poojaImage: { type: String, default: "" },
        reminderSent: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index for reminders
CartItemSchema.index({ date: 1, reminderSent: 1 });

const CartItem: Model<ICartItem> = mongoose.models.CartItem || mongoose.model<ICartItem>("CartItem", CartItemSchema);

export default CartItem;
