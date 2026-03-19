import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import Pandit from "@/models/Pandit";
import { getPanditFromRequest } from "@/lib/panditAuth";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const panditId = await getPanditFromRequest(req);
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return NextResponse.json({ success: false, message: "Video URL is required" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(params.id)
      .populate("poojaId", "name")
      .populate("templeId", "name");

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (order.panditId?.toString() !== panditId) {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
    }

    if (order.orderStatus !== "in-progress") {
      return NextResponse.json(
        { success: false, message: "Order must be in-progress to upload video" },
        { status: 400 }
      );
    }

    const pandit = await Pandit.findById(panditId);
    if (!pandit) return NextResponse.json({ success: false, message: "Pandit not found" }, { status: 404 });

    // Update Order
    order.videoUrl = videoUrl;
    order.videoSentAt = new Date();
    order.orderStatus = "completed";
    await order.save();

    // Update Pandit Earnings
    const commission = (order.totalAmount * (pandit.commissionPercentage || 80)) / 100;
    pandit.totalEarnings += commission;
    pandit.unpaidEarnings += commission;
    await pandit.save();

    // Send WhatsApp Notification to User
    try {
      if (process.env.TWILIO_SID_POOJA_COMPLETED) {
        await sendWhatsApp(order.whatsapp, process.env.TWILIO_SID_POOJA_COMPLETED, {
          "1": order.sankalpName.trim(),
          "2": ((order.poojaId as any)?.name || "").trim(),
          "3": ((order.templeId as any)?.name || "").trim(),
          "4": videoUrl.trim(),
          "5": order.bookingId.trim()
        });
      }
    } catch (waError) {
      console.error("Failed to send WhatsApp notification:", waError);
    }

    // Create In-app Notification
    try {
      await Notification.create({
        recipientId: order.userId,
        recipientModel: "User",
        title: "Pooja Video Uploaded! 📹",
        message: `Your ${(order.poojaId as any).name} at ${(order.templeId as any).name} has been completed. You can now watch the video proof.`,
        type: "video",
        link: `/bookings/${order._id}`
      });
    } catch (notifError) {
      console.error("Failed to create in-app notification:", notifError);
    }

    // Create Admin Notification for order completion
    try {
      await Notification.create({
        recipientId: order.userId,
        recipientModel: "Admin",
        title: "Order Completed! ✅",
        message: `Pooja for ${order.sankalpName} has been completed by Pandit ${pandit.name}.`,
        type: "booking",
        link: `/admin/orders`
      });
    } catch (adminNotifError) {
      console.error("Failed to create admin notification (order completion):", adminNotifError);
    }

    return NextResponse.json({
      success: true,
      data: { videoUrl, completedAt: order.videoSentAt }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 401 });
  }
}
