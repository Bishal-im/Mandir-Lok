import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pandit from "@/models/Pandit";
import Payout from "@/models/Payout";
import { getPanditFromRequest } from "@/lib/panditAuth";

export async function GET(req: Request) {
  try {
    const panditId = await getPanditFromRequest(req);
    await connectDB();

    const pandit = await Pandit.findById(panditId);
    if (!pandit) return NextResponse.json({ success: false, message: "Pandit not found" }, { status: 404 });

    const payouts = await Payout.find({ panditId })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        totalEarnings: pandit.totalEarnings,
        unpaidEarnings: pandit.unpaidEarnings,
        paidOut: pandit.totalEarnings - pandit.unpaidEarnings,
        payouts: payouts.slice(0, 10),
        canRequestPayout: true
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 401 });
  }
}
