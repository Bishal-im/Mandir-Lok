import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Mocking the Notification model since this is a standalone script
const NotificationSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    recipientModel: { type: String, required: true, enum: ["User", "Pandit", "Admin"] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
});

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log("Connected to DB");

        const dummyId = new mongoose.Types.ObjectId();
        
        console.log("Creating Admin notification...");
        const notif = await Notification.create({
            recipientId: dummyId,
            recipientModel: "Admin",
            title: "Test Admin Notification",
            message: "This is a test notification for Admin",
            type: "system"
        });
        console.log("Notification created:", notif._id);

        console.log("Fetching Admin notifications...");
        const adminNotifs = await Notification.find({ recipientModel: "Admin" });
        console.log("Found:", adminNotifs.length);
        
        await Notification.findByIdAndDelete(notif._id);
        console.log("Test notification deleted.");
        
        await mongoose.disconnect();
    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
