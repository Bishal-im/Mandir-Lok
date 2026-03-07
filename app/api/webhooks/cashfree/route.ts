import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { sendWhatsApp } from "@/lib/whatsapp";
import Pandit from "@/models/Pandit";

/**
 * Cashfree Payment Gateway Webhook Handler
 * Endpoint: /api/webhooks/cashfree
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");

    if (!signature || !timestamp) {
      console.warn("[Cashfree Webhook] Missing signature or timestamp headers. This is expected during initial verification.");
      // Return 200 OK to allow Cashfree dashboard to verify the URL
      return NextResponse.json({ status: "OK", message: "Verification request received" });
    }

    const secret = process.env.CASHFREE_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[Cashfree Webhook] CASHFREE_WEBHOOK_SECRET is not set in environment variables");
      // If we don't have a secret, we can't verify signatures. 
      // For initial setup, we still return 200 so the user can add the URL.
      // Once they add it, they should get the secret and add it to their env.
      return NextResponse.json({ status: "OK", message: "Secret missing, but endpoint acknowledged" });
    }

    // Verify Cashfree Webhook Signature
    const data = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64");

    if (signature !== expectedSignature) {
      console.error("[Cashfree Webhook] Invalid signature received");
      // Even if signature is invalid, we might want to return 200 during testing phase 
      // to avoid blocking the dashboard, but for security we should usually fail.
      // However, if the user is just setting it up, return 200.
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { data: eventData, type: eventType } = body;

    console.log(`[Cashfree Webhook] Processing event: ${eventType} for order: ${eventData?.order?.order_id}`);

    // Handle Payment Success
    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      const { order, payment } = eventData;
      const cashfreeOrderId = order.order_id;
      const cashfreePaymentId = payment.cf_payment_id;

      await connectDB();

      // Find the corresponding order in our database
      const dbOrder = await Order.findOne({ cashfreeOrderId });

      if (dbOrder && dbOrder.paymentStatus !== "paid") {
        console.log(`[Cashfree Webhook] Marking order ${dbOrder.bookingId} as paid`);

        dbOrder.paymentStatus = "paid";
        dbOrder.cashfreePaymentId = cashfreePaymentId;

        // If order was in 'pending' status, it's now officially paid and confirmed
        if (dbOrder.orderStatus === "pending") {
          dbOrder.orderStatus = "confirmed";
        }

        await dbOrder.save();

        // ── Trigger Post-Payment Actions ───────────────────────────────────────────
        // 1. Notify Devotee (In-app)
        try {
          await Notification.create({
            recipientId: dbOrder.userId,
            recipientModel: "User",
            title: dbOrder.isDonation ? "Donation Successful! 🙏" : "Booking Confirmed! 📿",
            message: `Your order ${dbOrder.bookingId} has been confirmed.`,
            type: "booking",
            link: `/dashboard`
          });
        } catch (err: any) {
          console.error("[Webhook Notification Error] User In-app failed", err);
        }

        // 2. Notify Devotee (WhatsApp)
        try {
          if (dbOrder.whatsapp) {
            await sendWhatsApp(dbOrder.whatsapp, `🙏 *Jai Shri Ram!*\n\nYour booking #${dbOrder.bookingId} has been confirmed successfully.\n\nThank you for choosing MandirLok.\n\n🛕 *Mandirlok*`);
          }
        } catch (err: any) {
          console.error("[Webhook Notification Error] User WhatsApp failed", err);
        }

        // 3. Notify Admins
        try {
          const admins = await User.find({ role: "admin" });
          for (const admin of admins) {
            await Notification.create({
              recipientId: admin._id,
              recipientModel: "Admin",
              title: dbOrder.isDonation ? "New Donation Received! 💰" : "New Pooja Booking! 📿",
              message: `${dbOrder.isDonation ? 'Donation' : 'Booking'} ${dbOrder.bookingId} is confirmed.`,
              type: "booking",
              link: `/admin/orders/${dbOrder._id}`
            });
          }
        } catch (err: any) {
          console.error("[Webhook Notification Error] Admin notifications failed", err);
        }

        // 4. Assign Pandit automatically
        if (!dbOrder.isDonation && !dbOrder.panditId) {
          try {
            const assignedPandit = await Pandit.findOne({ assignedTemples: dbOrder.templeId, isActive: true });
            if (assignedPandit) {
              dbOrder.panditId = assignedPandit._id;
              dbOrder.orderStatus = "confirmed";
              await dbOrder.save();

              await Notification.create({
                recipientId: assignedPandit._id,
                recipientModel: "Pandit",
                title: "New Puja Assigned! 📿",
                message: `You have been assigned to pooja booking ${dbOrder.bookingId}.`,
                type: "booking",
                link: `/pandit/orders/${dbOrder._id}`
              });

              if (assignedPandit.whatsapp) {
                await sendWhatsApp(assignedPandit.whatsapp, `🛕 *New Pooja Assigned!*\n\nBooking ID: ${dbOrder.bookingId}\nDevotee: ${dbOrder.sankalpName}\n\nPlease check your panel for details.\n\n🚩 *Mandirlok*`);
              }
            }
          } catch (err: any) {
            console.error("[Webhook Notification Error] Pandit assignment failed", err);
          }
        }
      } else if (!dbOrder) {
        // This is expected if the webhook hits before the redirect logic creates the order.
        console.warn(`[Cashfree Webhook] Order ${cashfreeOrderId} not yet found in database.`);
      }
    }

    return NextResponse.json({ status: "OK" });
  } catch (error: any) {
    console.error("[Cashfree Webhook Error]", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
