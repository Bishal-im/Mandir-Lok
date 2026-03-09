import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pandit from "@/models/Pandit";
import Payout from "@/models/Payout";
import { getPanditFromRequest } from "@/lib/panditAuth";

export async function POST(req: Request) {
  try {
    const panditId = await getPanditFromRequest(req);
    const { amount, upiId, bankAccount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
    }

    if (!upiId && !bankAccount) {
      return NextResponse.json({ success: false, message: "Please provide either UPI ID or Bank Details" }, { status: 400 });
    }

    await connectDB();

    const pandit = await Pandit.findById(panditId);
    if (!pandit) return NextResponse.json({ success: false, message: "Pandit not found" }, { status: 404 });

    if (amount > pandit.unpaidEarnings) {
      return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 });
    }

    // Check for existing pending/processing payouts
    const existingPayout = await Payout.findOne({
      panditId,
      status: { $in: ["requested", "processing"] }
    });

    if (existingPayout) {
      return NextResponse.json({
        success: false,
        message: "You already have a payout request in progress"
      }, { status: 400 });
    }



    const payout = await Payout.create({
      panditId,
      amount,
      status: "requested",
      upiId: upiId || "",
      bankAccount: bankAccount || ""
    });

    // Create Admin Notification for payout request
    try {
      const Notification = (await import("@/models/Notification")).default;
      await Notification.create({
        recipientId: panditId,
        recipientModel: "Admin",
        title: "New Payout Request! 💸",
        message: `Pandit ${pandit.name} has requested a payout of ₹${amount}.`,
        type: "system",
        link: `/admin/payments/payouts`
      });
    } catch (adminNotifError) {
      console.error("Failed to create admin notification (payout request):", adminNotifError);
    }

    return NextResponse.json({ success: true, data: payout });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 401 });
  }
}
