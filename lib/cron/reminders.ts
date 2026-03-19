import { connectDB } from "@/lib/db";
import CartItem from "@/models/CartItem";
import Order from "@/models/Order";
import { sendWhatsApp } from "@/lib/whatsapp";
import Notification from "@/models/Notification";

export async function sendBookingReminders() {
    try {
        await connectDB();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        // Find orders where booking date is tomorrow and reminder hasn't been sent
        // Note: We use the Order model since paid bookings are Orders now.
        // However, the user also mentioned "cart item reminder". 
        // Usually, people want reminders for PAID bookings. 
        // But if they want reminders for items in cart, we can do that too.
        // User said: "Add the cart item reminder that send notification ... if the cart item(Booked date) came near"

        const paidOrders = await Order.find({
            bookingDate: { $gte: tomorrow, $lt: dayAfterTomorrow },
            reminderSent: { $ne: true },
            paymentStatus: "paid"
        }).populate("userId");

        for (const order of paidOrders) {
            const message = `🙏 Namaste! Your booking for pooja (ID: ${order.bookingId}) is scheduled for tomorrow. Please be ready! Jai Shree Ram 🛕`;

            if (order.whatsapp) {
                await sendWhatsApp(order.whatsapp, message);
            }

            await Notification.create({
                recipientId: order.userId,
                recipientModel: "User",
                title: "Booking Reminder 📿",
                message: "Your pooja is scheduled for tomorrow.",
                type: "system",
                link: "/dashboard"
            });

            order.reminderSent = true;
            await order.save();
        }

        // Also check CartItems for items that were added but not booked/paid?
        // User specifically said "cart item reminder".
        const cartItems = await CartItem.find({
            date: { $gte: tomorrow, $lt: dayAfterTomorrow },
            reminderSent: { $ne: true }
        }).populate("userId");

        for (const item of cartItems) {
            const user: any = item.userId;
            if (user && user.whatsapp) {
                const message = `🪔 Reminder: You have a pooja (${item.poojaName}) in your cart for tomorrow. Complete your booking now! Jai Shree Ram 🛕`;
                await sendWhatsApp(user.whatsapp, message);
            }

            item.reminderSent = true;
            await item.save();
        }

    } catch (error) {
        console.error("Reminder job error:", error);
    }
}
