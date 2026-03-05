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
    const { poojaId, qty = 1, chadhavaIds = [], extraDonation = 0, packageIndex } = body;

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

      if (packageIndex !== undefined && packageIndex !== null && pooja.packages?.length > packageIndex) {
        poojaAmount = pooja.packages[packageIndex].price;
        poojaName = `${pooja.name} - ${pooja.packages[packageIndex].name}`;
      } else {
        poojaAmount = pooja.price * qty;
        poojaName = pooja.name;
      }
    }

    // Calculate chadhava total with quantities
    let chadhavaAmount = 0;
    if (chadhavaIds.length > 0) {
      // chadhavaIds from frontend might be just IDs, we need to handle quantities passed in verify later
      // But for create-order, cart.tsx passes just the raw IDs to the API: `chadhavaIds: selectedOfferingIds`
      // Wait, in cart.tsx: selectedOfferingIds = selectedOfferingData.map(o => o.id)
      // cart.tsx calls API with plain IDs! So it doesn't pass quantities to create-order!
      // Let's modify cart.tsx to pass the quantities, but let's assume the body receives an array of objects
      // OR we just calculate it based on what cart.tsx currently passes (it only passes IDs right now)
      // Actually, looking at cart.tsx line 210: chadhavaIds: selectedOfferingIds.
      // We must change cart.tsx to pass the quantities to this route.
      // But for now, we can calculate based on what is passed. If it's just IDs, it assumes qty 1.

      // We will change the API to expect an array of objects for chadhava if possible, or just parse if they are strings.
      // If it's strings, it's just IDs.
      const parsedChadhava = chadhavaIds.map((val: string | { id: string, quantity: number }) => {
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