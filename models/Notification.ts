import mongoose, { Schema, Document, Model } from "mongoose";
import User from "./User";

export interface INotification extends Document {
    recipientId: mongoose.Types.ObjectId;
    recipientModel: "User" | "Pandit" | "Admin";
    title: string;
    message: string;
    type: "booking" | "video" | "system" | "promotion";
    read: boolean;
    link?: string;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        recipientId: { type: Schema.Types.ObjectId, refPath: "recipientModel", required: true, index: true },
        recipientModel: { type: String, required: true, enum: ["User", "Pandit", "Admin"], default: "User" },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["booking", "video", "system", "promotion"],
            default: "system"
        },
        read: { type: Boolean, default: false },
        link: { type: String, default: "" },
    },
    { timestamps: true }
);

// Register "Admin" as an alias for "User" model to satisfy refPath
if (!mongoose.models.Admin) {
    mongoose.model("Admin", User.schema);
}

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
