import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/db";
import Pooja from "@/models/Pooja";
import Chadhava from "@/models/Chadhava";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { poojaId, qty = 1, chadhavaIds = [], extraDonation = 0 } = body;

    // 2. Fetch pooja price (if provided)
    let poojaAmount = 0;
    let poojaName = "Sacred Offering";

    if (poojaId) {
      const pooja = await Pooja.findById(poojaId);
      if (!pooja) {
        return NextResponse.json(
          { success: false, message: "Pooja not found" },
          { status: 404 }
        );
      }
      poojaAmount = pooja.price * qty;
      poojaName = pooja.name;
    }

    // Calculate chadhava total
    let chadhavaAmount = 0;
    if (chadhavaIds.length > 0) {
      const chadhavaItems = await Chadhava.find({ _id: { $in: chadhavaIds } });
      chadhavaAmount = chadhavaItems.reduce((sum, item) => sum + item.price, 0);
    }

    const totalAmount = poojaAmount + chadhavaAmount + (extraDonation || 0);

    // Razorpay amount is in paise (multiply by 100)
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        poojaId: poojaId || "",
        poojaName: poojaName,
        qty: qty.toString(),
        chadhavaIds: chadhavaIds.join(","),
        extraDonation: (extraDonation || 0).toString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount,
        currency: "INR",
        poojaAmount: poojaAmount,
        chadhavaAmount,
        extraDonation: (extraDonation || 0),
        keyId: process.env.RAZORPAY_KEY_ID,
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