import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import Pooja from "@/models/Pooja";
import Chadhava from "@/models/Chadhava";
import Pandit from "@/models/Pandit";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 1. Get logged in user from JWT cookie
    const token = cookies().get("mandirlok_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      poojaId,
      templeId,
      bookingDate,
      qty = 1,
      chadhavaItems: incomingChadhavaItems = [], // incoming from payload
      sankalpName,
      gotra,
      dob,
      phone,
      whatsapp,
      sankalp,
      address,
      isDonation,
      extraDonation,
      packageSelected,
    } = body;

    // 2. Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    // 3. Fetch pooja (if provided) and chadhava details
    let poojaAmount = 0;
    let poojaName = isDonation ? "Sacred Support" : "Sacred Offering";

    if (poojaId) {
      const pooja = await Pooja.findById(poojaId);
      if (!pooja) {
        return NextResponse.json(
          { success: false, message: "Pooja not found" },
          { status: 404 }
        );
      }
      if (packageSelected) {
        const dbPackage = pooja.packages?.find((p: any) => p.name === packageSelected.name);
        poojaAmount = dbPackage ? dbPackage.price : packageSelected.price;
      } else {
        poojaAmount = pooja.price * qty;
      }
      poojaName = typeof pooja.name === "object" ? (pooja.name.en || pooja.name.hi || "") : pooja.name;
    }

    // Build chadhava items array for DB
    let chadhavaItems: { chadhavaId: string; name: string; price: number; emoji: string; quantity: number }[] = [];
    let chadhavaAmount = 0;

    if (incomingChadhavaItems.length > 0) {
      chadhavaItems = incomingChadhavaItems.map((item: any) => ({
        chadhavaId: item.chadhavaId,
        name: item.name,
        price: item.price,
        emoji: item.emoji,
        quantity: item.quantity || 1
      }));
      chadhavaAmount = chadhavaItems.reduce((sum, c) => sum + (c.price * c.quantity), 0);
    }

    const totalAmount = poojaAmount + chadhavaAmount + (extraDonation || 0);

    // 4. Save order to DB
    const orderObj: any = {
      userId: decoded.userId,
      templeId,
      bookingDate: new Date(bookingDate),
      sankalpName,
      gotra: gotra || "",
      dob: dob || "",
      phone,
      whatsapp,
      sankalp: sankalp || "",
      address: address || "",
      qty: Number(qty),
      chadhavaItems,
      poojaAmount,
      chadhavaAmount,
      totalAmount,
      paymentStatus: "paid",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderStatus: isDonation ? "completed" : "pending",
      isDonation: !!isDonation,
      extraDonation: extraDonation || 0,
      packageSelected: packageSelected || undefined,
    };

    if (poojaId) {
      orderObj.poojaId = poojaId;
    }

    const order = await Order.create(orderObj);

    // Create In-app Notification for payment
    try {
      await Notification.create({
        recipientId: decoded.userId,
        recipientModel: "User",
        title: isDonation ? "Donation Successful! 🙏" : "Booking Confirmed! 📿",
        message: isDonation
          ? `Thank you for your generous contribution of ₹${totalAmount} towards ${poojaName}.`
          : `Your booking for ${poojaName} has been confirmed. Booking ID: ${order.bookingId}`,
        type: "booking",
        link: `/dashboard`
      });
    } catch (notifError) {
      console.error("Failed to create in-app notification (payment):", notifError);
    }

    // Create Admin Notification for new order
    try {
      await Notification.create({
        recipientId: decoded.userId, // Using the user who paid as a proxy ID, though Admin doesn't need a specific recipientId usually, we'll use a placeholder or the user's ID
        recipientModel: "Admin",
        title: "New Order Received! 💰",
        message: `A new order of ₹${totalAmount} has been placed for ${poojaName}.`,
        type: "booking",
        link: `/admin/orders`
      });
    } catch (adminNotifError) {
      console.error("Failed to create admin notification (new order):", adminNotifError);
    }

    // 5. Auto-assign Pandit (Only if NOT a donation)
    if (!isDonation) {
      try {
        const assignedPandit = await Pandit.findOne({
          assignedTemples: templeId,
          isActive: true
        });

        if (assignedPandit) {
          await Order.findByIdAndUpdate(order._id, {
            panditId: assignedPandit._id,
            orderStatus: "confirmed"
          });

          // Notify devotee about pandit assignment
          try {
            await sendWhatsApp(
              whatsapp,
              `🙏 *Update on your Mandirlok Booking*\n\nYour *${poojaName}* has been assigned to:\n👤 *Pandit ${assignedPandit.name}*\n📱 ${assignedPandit.phone}\n\n📋 Booking ID: ${order.bookingId}\n📅 Date: ${new Date(bookingDate).toLocaleDateString("en-IN")}\n\n*Your pooja will be performed as scheduled. Stay blessed!* 🛕`
            );
          } catch (e) {
            console.error("[WhatsApp auto-assign - devotee notification failed]", e);
          }

          // Notify pandit
          try {
            await sendWhatsApp(
              assignedPandit.whatsapp,
              `🛕 *New Pooja Assigned — Mandirlok*\n\n📿 *Pooja:* ${poojaName}\n👤 *Devotee:* ${sankalpName}\n📅 *Date:* ${new Date(bookingDate).toLocaleDateString("en-IN")}\n📋 *Booking ID:* ${order.bookingId}\n\nPlease log in to your Pandit Portal to view full details.`
            );
          } catch (e) {
            console.error("[WhatsApp auto-assign - pandit notification failed]", e);
          }

          // Create In-app Notification for Pandit Assignment
          try {
            await Notification.create({
              recipientId: decoded.userId,
              recipientModel: "User",
              title: "Pandit Assigned! 🧘",
              message: `Pandit ${assignedPandit.name} has been assigned to your ${poojaName}.`,
              type: "booking",
              link: `/bookings/${order._id}`
            });
          } catch (notifError) {
            console.error("Failed to create in-app notification (pandit assign):", notifError);
          }
        }
      } catch (e) {
        console.error("[Pandit auto-assignment failed]", e);
      }
    }

    // 6. Send WhatsApp confirmation (Initial)
    try {
      let message = "";
      if (isDonation) {
        const offeringText = poojaId ? poojaName : "Temple Maintenance Support";
        message = `🙏 *Jai Shri Ram!*\n\nThank you for your generous contribution to *Mandirlok*.\n\n📋 *Order ID:* ${order.bookingId}\n📿 *Offering:* ${offeringText}\n💰 *Amount:* ₹${totalAmount}\n📜 *Certificate:* You can view your donation certificate on our website.\n\n*Your contribution helps in the divine service of the temple. Stay blessed!* 🛕`;
      } else {
        message = `🙏 *Jai Shri Ram!*\n\nYour booking is confirmed on *Mandirlok*.\n\n📋 *Booking ID:* ${order.bookingId}\n📿 *Pooja:* ${poojaName}\n📅 *Date:* ${new Date(bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}\n💰 *Amount Paid:* ₹${totalAmount}\n\nA pandit will be assigned shortly. You will receive another WhatsApp update.\n\n🛕 *Mandirlok — Divine Blessings Delivered*`;
      }

      await sendWhatsApp(whatsapp, message);
    } catch (e) {
      console.error("[WhatsApp booking confirmation failed]", e);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and order created",
      data: {
        orderId: order._id,
        bookingId: order.bookingId,
      },
    });
  } catch (error: any) {
    console.error("POST /api/payment/verify error:");
    if (error.errors) {
      console.error(Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`).join('\n'));
    } else {
      console.error(error);
    }
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}