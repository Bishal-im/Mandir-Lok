import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pandit from "@/models/Pandit";

export async function POST(req: Request) {
  try {
    const { panditId, phone, whatsapp } = await req.json();

    if (!panditId || !phone || !whatsapp) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const pandit = await Pandit.findById(panditId);
    if (!pandit) {
      return NextResponse.json(
        { success: false, message: "Pandit not found" },
        { status: 404 }
      );
    }

    pandit.phone = phone;
    pandit.whatsapp = whatsapp;
    await pandit.save();

    return NextResponse.json({ success: true, message: "Phone number updated successfully" });
  } catch (error) {
    console.error("Pandit update-phone error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
