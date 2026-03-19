import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import { getPanditFromRequest } from "@/lib/panditAuth";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const panditId = await getPanditFromRequest(req);
    await connectDB();

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (order.panditId?.toString() !== panditId) {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
    }

    if (order.orderStatus !== "confirmed") {
      return NextResponse.json(
        { success: false, message: `Cannot start order in ${order.orderStatus} status` },
        { status: 400 }
      );
    }

    order.orderStatus = "in-progress";
    await order.save();

    // Send WhatsApp notification
    try {
      // Re-fetch or populate to get pooja name
      const orderWithPooja = await Order.findById(order._id).populate("poojaId", "name");
      if (orderWithPooja) {
        if (process.env.TWILIO_SID_POOJA_STARTED) {
          await sendWhatsApp(orderWithPooja.whatsapp, process.env.TWILIO_SID_POOJA_STARTED, {
            "1": ((orderWithPooja.poojaId as any)?.name || "").trim(),
            "2": orderWithPooja.bookingId.trim()
          });
        }
      }
    } catch (e) {
      console.error("[WhatsApp pooja started notification failed]", e);
    }

    // Create Admin Notification for order start
    try {
      await Notification.create({
        recipientId: order.userId,
        recipientModel: "Admin",
        title: "Pooja Started! 📿",
        message: `Pooja for ${order.sankalpName} has been started by a Pandit.`,
        type: "booking",
        link: `/admin/orders`
      });
    } catch (adminNotifError) {
      console.error("Failed to create admin notification (order start):", adminNotifError);
    }

    return NextResponse.json({ success: true, message: "Pooja started" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 401 });
  }
}
