import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Pandit from "@/models/Pandit";
import { verifyToken } from "@/lib/jwt";
import { sendWhatsApp } from "@/lib/whatsapp";
import { cookies } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get("mandirlok_token")?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    await connectDB();
    const { panditId } = await req.json();

    const [order, pandit] = await Promise.all([
      Order.findByIdAndUpdate(params.id, { panditId, orderStatus: "assigned" }, { new: true })
        .populate("poojaId", "name"),
      Pandit.findById(panditId),
    ]);

    if (!order || !pandit) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    const poojaName = (order.poojaId as any)?.name || "Pooja";

    // Notify devotee
    try {
      if (process.env.TWILIO_SID_ADMIN_ASSIGNED) {
        await sendWhatsApp(order.whatsapp, process.env.TWILIO_SID_ADMIN_ASSIGNED, {
          "1": poojaName.trim(),
          "2": pandit.name.trim(),
          "3": pandit.phone.trim(),
          "4": order.bookingId.trim(),
          "5": new Date(order.bookingDate).toLocaleDateString("en-IN")
        });
      }
    } catch (e) {
      console.error("[WhatsApp pandit assign - devotee]", e);
    }

    // Notify pandit
    try {
      if (process.env.TWILIO_SID_NEW_POOJA_ASSIGNED) {
        await sendWhatsApp(pandit.whatsapp, process.env.TWILIO_SID_NEW_POOJA_ASSIGNED, {
          "1": order.bookingId.trim(),
          "2": order.sankalpName.trim()
        });
      }
    } catch (e) {
      console.error("[WhatsApp pandit assign - pandit]", e);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
