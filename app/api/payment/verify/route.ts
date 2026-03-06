import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import Pooja from "@/models/Pooja";
import Chadhava from "@/models/Chadhava";
import Pandit from "@/models/Pandit";
import { sendWhatsApp } from "@/lib/whatsapp";
import { verifyCashfreePayment } from "@/lib/cashfree";

async function processVerification(req: Request, searchParams?: URLSearchParams) {
  try {
    await connectDB();

    // 1. Get logged in user from JWT cookie
    const token = cookies().get("mandirlok_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    let params: any = {};
    if (searchParams) {
      // GET request from redirect
      params = {
        cashfreeOrderId: searchParams.get("order_id"),
        poojaId: searchParams.get("poojaId") || undefined,
        templeId: searchParams.get("templeId"),
        bookingDate: searchParams.get("bookingDate"),
        qty: parseInt(searchParams.get("qty") || "1"),
        sankalpName: searchParams.get("sankalpName"),
        gotra: searchParams.get("gotra"),
        dob: searchParams.get("dob"),
        phone: searchParams.get("phone"),
        whatsapp: searchParams.get("whatsapp"),
        sankalp: searchParams.get("sankalp"),
        address: searchParams.get("address"),
        isDonation: searchParams.get("isDonation") === "true",
        extraDonation: parseInt(searchParams.get("extraDonation") || "0"),
        packageSelected: searchParams.get("packageName") ? {
          name: searchParams.get("packageName"),
          price: parseInt(searchParams.get("packagePrice") || "0")
        } : undefined,
        chadhavaData: searchParams.get("chadhavaData") || undefined,
      };
    } else {
      // POST request
      params = await req.json();
      params.cashfreeOrderId = params.order_id;
    }

    const {
      cashfreeOrderId,
      poojaId,
      templeId,
      bookingDate,
      qty = 1,
      chadhavaItems: incomingChadhavaItems = [], 
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
      chadhavaData,
    } = params;

    // 2. Verify Cashfree Payment
    const cashfreeOrder = await verifyCashfreePayment(cashfreeOrderId);
    
    if (cashfreeOrder.order_status !== "PAID") {
       // If it's a redirect, we might want to redirect to a failure page instead of JSON
       if (searchParams) {
         return NextResponse.redirect(`${new URL(req.url).origin}/booking-failure?orderId=${cashfreeOrderId}`);
       }
       return NextResponse.json({ success: false, message: "Payment not completed" }, { status: 400 });
    }

    // Check if order already exists (prevent duplicate creation on refresh)
    const existingOrder = await Order.findOne({ cashfreeOrderId });
    if (existingOrder) {
      if (searchParams) {
        return NextResponse.redirect(`${new URL(req.url).origin}/booking-success?orderId=${existingOrder._id}`);
      }
      return NextResponse.json({ success: true, data: { orderId: existingOrder._id } });
    }

    // 3. Fetch pooja/chadhava details and calculate amounts
    let poojaAmount = 0;
    let poojaName = isDonation ? "Sacred Support" : "Sacred Offering";

    if (poojaId) {
      const pooja = await Pooja.findById(poojaId);
      if (pooja) {
        if (packageSelected) {
          const dbPackage = pooja.packages?.find((p: any) => p.name === packageSelected.name);
          poojaAmount = dbPackage ? dbPackage.price : packageSelected.price;
        } else {
          poojaAmount = pooja.price * qty;
        }
        poojaName = pooja.name;
      }
    }

    // Chadhava items handled similarly
    let chadhavaItems: any[] = [];
    let chadhavaAmount = 0;

    if (incomingChadhavaItems && incomingChadhavaItems.length > 0) {
      chadhavaItems = incomingChadhavaItems;
    } else if (chadhavaData) {
      // Parse from chadhavaData: id:quantity,id:quantity
      const pairs = chadhavaData.split(",");
      for (const p of pairs) {
        const [id, q] = p.split(":");
        const item = await Chadhava.findById(id);
        if (item) {
          chadhavaItems.push({
            chadhavaId: item._id,
            name: item.name,
            price: item.price,
            emoji: item.emoji || "🙏",
            quantity: parseInt(q || "1")
          });
        }
      }
    }

    if (chadhavaItems.length > 0) {
      chadhavaAmount = chadhavaItems.reduce((sum: number, c: any) => sum + (c.price * c.quantity), 0);
    }

    const totalAmount = poojaAmount + chadhavaAmount + (extraDonation || 0);

    // 4. Save order to DB
    const order = await Order.create({
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
      cashfreeOrderId,
      cashfreePaymentId: cashfreeOrder.order_id,
      orderStatus: isDonation ? "completed" : "pending",
      isDonation: !!isDonation,
      extraDonation: extraDonation || 0,
      packageSelected: packageSelected || undefined,
      poojaId: poojaId || undefined,
    });

    // Notifications and WhatsApp
    try {
        // 1. Notify User
        await Notification.create({
            recipientId: decoded.userId,
            recipientModel: "User",
            title: isDonation ? "Donation Successful! 🙏" : "Booking Confirmed! 📿",
            message: `Order ID: ${order.bookingId} for ${poojaName}`,
            type: "booking",
            link: `/dashboard`
        });
        await sendWhatsApp(whatsapp, `🙏 Booking Confirmed! ID: ${order.bookingId}`);

        // 2. Notify Admins
        const admins = await mongoose.model("User").find({ role: "admin" });
        for (const admin of admins) {
            await Notification.create({
                recipientId: admin._id,
                recipientModel: "Admin",
                title: isDonation ? "New Donation Received! 💰" : "New Pooja Booking! 📿",
                message: `New booking ${order.bookingId} for ${poojaName}`,
                type: "booking",
                link: `/admin/orders/${order._id}`
            });
        }
    } catch (e) { console.error("Notification error", e); }

    // Pandit Assignment
    if (!isDonation) {
        const assignedPandit = await Pandit.findOne({ assignedTemples: templeId, isActive: true });
        if (assignedPandit) {
            order.panditId = assignedPandit._id;
            order.orderStatus = "confirmed";
            await order.save();

            // 3. Notify Assigned Pandit
            try {
                await Notification.create({
                    recipientId: assignedPandit._id,
                    recipientModel: "Pandit",
                    title: "New Puja Assigned! 📿",
                    message: `You have been assigned to a new pooja: ${poojaName}.`,
                    type: "booking",
                    link: `/pandit/orders/${order._id}`
                });
                
                if (assignedPandit.whatsapp) {
                    await sendWhatsApp(assignedPandit.whatsapp, `🛕 New Pooja Assigned!\nID: ${order.bookingId}\nDevotee: ${sankalpName}`);
                }
            } catch (notifErr) {
                console.error("Pandit notification error", notifErr);
            }
        }
    }

    if (searchParams) {
      return NextResponse.redirect(`${new URL(req.url).origin}/booking-success?orderId=${order._id}`);
    }
    return NextResponse.json({ success: true, data: { orderId: order._id } });

  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return processVerification(req);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  return processVerification(req, searchParams);
}