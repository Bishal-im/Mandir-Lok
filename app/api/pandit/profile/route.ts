import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pandit from "@/models/Pandit";
import { getPanditFromRequest } from "@/lib/panditAuth";

export async function PATCH(req: Request) {
  try {
    const panditId = await getPanditFromRequest(req);
    const body = await req.json();

    // Only allow specific fields to be updated
    const allowedUpdates = ["name", "email", "bio", "languages", "photo", "whatsapp"];
    const updates: any = {};
    // Normalize phone numbers — strip all '+' and non-digits, re-add single leading '+'
    const normalizePhone = (num: string) => {
      if (!num) return num;
      const digits = num.replace(/\D/g, '');
      return digits ? `+${digits}` : num;
    };

    Object.keys(body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'whatsapp') {
          updates[key] = normalizePhone(body[key]);
        } else {
          updates[key] = body[key];
        }
      }
    });

    await connectDB();
    const updatedPandit = await Pandit.findByIdAndUpdate(
      panditId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedPandit) {
      return NextResponse.json({ success: false, message: "Pandit not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedPandit });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 401 });
  }
}
