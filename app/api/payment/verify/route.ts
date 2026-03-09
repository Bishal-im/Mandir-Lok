import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import User from "@/models/User";
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
        isBulk: searchParams.get("isBulk") || undefined,
        selectedItemIds: searchParams.get("selectedItemIds") || undefined,
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
      isBulk,
      selectedItemIds,
    } = params;

    // 2. Verify Cashfree Payment
    const cashfreeOrder = await verifyCashfreePayment(cashfreeOrderId);

    if (cashfreeOrder.order_status !== "PAID") {
      if (searchParams) {
        return NextResponse.redirect(`${new URL(req.url).origin}/booking-failure?orderId=${cashfreeOrderId}`);
      }
      return NextResponse.json({ success: false, message: "Payment not completed" }, { status: 400 });
    }

    // Check if order already exists
    const existingOrder = await Order.findOne({ cashfreeOrderId });
    if (existingOrder) {
      if (searchParams) {
        // If we find an existing order with this CF ID, it might be a bulk set. 
        // For simplicity, find all orders with this CF ID.
        const allOrders = await Order.find({ cashfreeOrderId });
        const ids = allOrders.map(o => o._id).join(",");
        return NextResponse.redirect(`${new URL(req.url).origin}/booking-success?orderIds=${ids}`);
      }
      return NextResponse.json({ success: true, data: { orderId: existingOrder._id } });
    }

    let createdOrderIds: string[] = [];

    if (isBulk === "true") {
      // BULK CHECKOUT LOGIC
      const CartItem = (await import("@/models/CartItem")).default;
      let cartItems = [];
      const selectedIds = selectedItemIds ? selectedItemIds.split(",") : [];

      if (selectedIds.length > 0) {
        cartItems = await CartItem.find({ userId: decoded.userId, id: { $in: selectedIds } });
      } else {
        cartItems = await CartItem.find({ userId: decoded.userId });
      }

      if (cartItems.length === 0) {
        return NextResponse.json({ success: false, message: "No items found in cart for bulk order" }, { status: 400 });
      }

      for (const item of cartItems) {
        const order = await Order.create({
          userId: decoded.userId,
          templeId: item.templeId,
          bookingDate: item.date,
          sankalpName, // Shared info from form
          gotra: gotra || "",
          dob: dob || "",
          phone,
          whatsapp,
          sankalp: sankalp || "",
          address: address || "",
          qty: 1, // Default to 1 per pooja in cart
          chadhavaItems: item.offerings.map(o => ({
            chadhavaId: o.id,
            name: o.name,
            price: o.price,
            emoji: o.emoji,
            quantity: o.quantity
          })),
          poojaAmount: item.packagePrice,
          chadhavaAmount: item.totalPrice - item.packagePrice,
          totalAmount: item.totalPrice,
          paymentStatus: "paid",
          cashfreeOrderId,
          cashfreePaymentId: cashfreeOrder.order_id,
          orderStatus: "pending",
          packageSelected: {
            name: item.packageName,
            price: item.packagePrice
          },
          poojaId: item.poojaId,
          poojaImage: item.poojaImage || "",
        });
        createdOrderIds.push(order._id.toString());

        // Trigger Pandit Assignment and Notifications for each
        await handleOrderPostProcess(order, item.poojaName, decoded.userId, sankalpName);
      }

      // Clear only selected items from Cart from DB
      if (selectedIds.length > 0) {
        await CartItem.deleteMany({ userId: decoded.userId, id: { $in: selectedIds } });
      } else {
        await CartItem.deleteMany({ userId: decoded.userId });
      }

    } else {
      // SINGLE ORDER LOGIC (Original)
      let poojaAmount = 0;
      let poojaName = isDonation ? "Sacred Support" : "Sacred Offering";
      let poojaImage = "";

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
          poojaImage = pooja.images?.[0] || "";
        }
      }

      let chadhavaItems: any[] = [];
      let chadhavaAmount = 0;

      if (incomingChadhavaItems && incomingChadhavaItems.length > 0) {
        chadhavaItems = incomingChadhavaItems;
      } else if (chadhavaData) {
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
        poojaImage: poojaImage || "",
      });
      createdOrderIds.push(order._id.toString());
      await handleOrderPostProcess(order, poojaName, decoded.userId, sankalpName);
    }

    if (searchParams) {
      const orderIdsParam = createdOrderIds.join(",");
      return NextResponse.redirect(`${new URL(req.url).origin}/booking-success?orderIds=${orderIdsParam}`);
    }
    return NextResponse.json({ success: true, data: { orderIds: createdOrderIds } });

  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// Helper to handle notifications and pandit assignment
async function handleOrderPostProcess(order: any, poojaName: string, userId: string, sankalpName: string) {
  try {
    // 1. Notify User (In-app)
    try {
      await Notification.create({
        recipientId: userId,
        recipientModel: "User",
        title: order.isDonation ? "Donation Successful! 🙏" : "Booking Confirmed! 📿",
        message: `Order ID: ${order.bookingId} for ${poojaName}`,
        type: "booking",
        link: `/dashboard`
      });
    } catch (err: any) {
      console.error("[Notification Error] User In-app failed", err);
    }

    // 2. Notify User (WhatsApp)
    try {
      await sendWhatsApp(order.whatsapp, `🙏 Booking Confirmed! ID: ${order.bookingId}\nPUJA: ${poojaName}`);
    } catch (err: any) {
      console.error("[Notification Error] User WhatsApp failed", err);
    }

    // 3. Notify Admins
    try {
      const admins = await User.find({ role: "admin" });
      for (const admin of admins) {
        await Notification.create({
          recipientId: admin._id,
          recipientModel: "Admin",
          title: order.isDonation ? "New Donation Received! 💰" : "New Pooja Booking! 📿",
          message: `New booking ${order.bookingId} for ${poojaName}`,
          type: "booking",
          link: `/admin/orders/${order._id}`
        });
      }
    } catch (err: any) {
      console.error("[Notification Error] Admin notifications failed", err);
    }

    // 4. Pandit Auto-Assignment
    if (!order.isDonation) {
      try {
        const assignedPandit = await Pandit.findOne({ assignedTemples: order.templeId, isActive: true });
        if (assignedPandit) {
          order.panditId = assignedPandit._id;
          order.orderStatus = "confirmed";
          await order.save();

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
        }
      } catch (err: any) {
        console.error("[Notification Error] Pandit assignment failed", err);
      }
    }
  } catch (e: any) {
    console.error("Order post-process critical error", e);
  }
}

export async function POST(req: Request) {
  return processVerification(req);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  return processVerification(req, searchParams);
}