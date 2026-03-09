import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import Pandit from "@/models/Pandit";

export async function POST(req: Request) {
  try {
    const { panditId, phone, whatsapp } = await req.json();
    console.log(`[Update Phone API] Starting update for Pandit ID: ${panditId}`, { phone, whatsapp });

    if (!panditId || !phone || !whatsapp) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log(`[Update Phone API] DB Connected`);

    const pandit = await Pandit.findById(panditId);
    if (!pandit) {
      console.log(`[Update Phone API] Pandit not found: ${panditId}`);
      return NextResponse.json(
        { success: false, message: "Pandit not found" },
        { status: 404 }
      );
    }

    // Normalize: remove duplicate '+' signs that could create "+91+977..." patterns
    // The client sends "+CODE" + localNumber, this ensures we store a clean number
    const normalizePhone = (num: string) => {
      // Strip all '+' chars, get only digits, then re-add single leading '+'
      const digits = num.replace(/\D/g, '');
      return digits ? `+${digits}` : num;
    };

    pandit.phone = normalizePhone(phone);
    pandit.whatsapp = normalizePhone(whatsapp);
    await pandit.save();
    console.log(`[Update Phone API] Pandit ${panditId} saved successfully`);

    revalidatePath("/pandit", "layout");
    console.log(`[Update Phone API] Cache revalidated for /pandit`);

    const onboardingRequired = !pandit.whatsapp?.trim() || !pandit.aadhaarCardUrl?.trim();

    return NextResponse.json({
      success: true,
      message: "Phone number updated successfully",
      onboardingRequired
    });
  } catch (error) {
    console.error("Pandit update-phone error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
