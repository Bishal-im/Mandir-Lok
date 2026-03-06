import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pooja from "@/models/Pooja";
import Chadhava from "@/models/Chadhava";
import { createCashfreeOrder } from "@/lib/cashfree";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { poojaId, qty = 1, chadhavaIds = [], extraDonation = 0, packageIndex, isBulk, amount } = body;

    let totalAmount = 0;
    let poojaName = "Sacred Offering";

    if (isBulk && amount) {
      totalAmount = amount;
      poojaName = "Multiple Sacred Offerings";
    } else {
      // 2. Fetch pooja price (if provided)
      let poojaAmount = 0;
      if (poojaId) {
        const pooja = await Pooja.findById(poojaId);
        if (!pooja) {
          return NextResponse.json(
            { success: false, message: "Pooja not found" },
            { status: 404 }
          );
        }

        if (packageIndex !== undefined && packageIndex !== null && pooja.packages?.length > packageIndex) {
          poojaAmount = pooja.packages[packageIndex].price;
          poojaName = `${pooja.name} - ${pooja.packages[packageIndex].name}`;
        } else {
          poojaAmount = pooja.price * qty;
          poojaName = pooja.name;
        }
      }

      // Calculate chadhava total
      let chadhavaAmount = 0;
      if (chadhavaIds.length > 0) {
        const parsedChadhava = chadhavaIds.map((val: any) => {
          if (typeof val === 'string') return { id: val, quantity: 1 };
          return val;
        });

        const uniqueIds = parsedChadhava.map((c: any) => c.id);
        const chadhavaItems = await Chadhava.find({ _id: { $in: uniqueIds } });

        chadhavaAmount = chadhavaItems.reduce((sum, item) => {
          const matchingInput = parsedChadhava.find((c: any) => c.id === item._id.toString());
          const quantity = matchingInput ? matchingInput.quantity : 1;
          return sum + (item.price * quantity);
        }, 0);
      }

      totalAmount = poojaAmount + chadhavaAmount + (extraDonation || 0);
    }

    // Cashfree order creation
    let phone = body.phone || "9999999999";
    if (phone !== "9999999999" && !phone.startsWith('+')) {
      phone = '+' + phone;
    }

    const cashfreeOrder = await createCashfreeOrder({
      orderId: `order_${Date.now()}`,
      amount: totalAmount,
      customerId: "devotee_id", // Optional: use user ID if available
      customerPhone: phone,
      customerName: body.name || "Devotee",
      orderNote: `Pooja: ${poojaName}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        payment_session_id: cashfreeOrder.payment_session_id,
        order_id: cashfreeOrder.order_id,
        amount: totalAmount,
        currency: "INR",
      },
    });
  } catch (error) {
    console.error("POST /api/payment/create-order error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}