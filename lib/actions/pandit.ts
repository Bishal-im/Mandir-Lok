"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "../db";
import Order from "../../models/Order";
import { sendWhatsApp } from "../whatsapp";

export async function acceptOrder(orderId: string) {
    try {
        await connectDB();
        const order = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus: "confirmed" },
            { new: true }
        ).populate("poojaId", "name");

        if (!order) return { success: false, error: "Order not found" };

        // Notify devotee
        try {
            if (process.env.TWILIO_SID_PANDIT_ACCEPTED) {
                await sendWhatsApp(order.whatsapp, process.env.TWILIO_SID_PANDIT_ACCEPTED, {
                    "1": ((order.poojaId as any)?.name || "Pooja").trim(),
                    "2": order.bookingId.trim()
                });
            }
        } catch (e) {
            console.error("[WhatsApp acceptOrder notification failed]", e);
        }

        revalidatePath("/pandit/orders");
        revalidatePath(`/pandit/orders/${orderId}`);
        return { success: true, order: JSON.parse(JSON.stringify(order)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function declineOrder(orderId: string) {
    try {
        await connectDB();
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                panditId: null,
                orderStatus: "pending"
            },
            { new: true }
        );

        if (!order) return { success: false, error: "Order not found" };

        revalidatePath("/pandit/orders");
        revalidatePath("/admin/orders");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
