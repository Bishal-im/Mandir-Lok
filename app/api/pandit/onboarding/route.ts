import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Pandit from "@/models/Pandit";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        const token = cookies().get("mandirlok_pandit_token")?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { panditId: string };
        const { whatsapp, aadhaarCardUrl } = await req.json();
        console.log(`[Onboarding API] Received for ${decoded.panditId}: whatsapp="${whatsapp}", aadhaar="${aadhaarCardUrl}"`);

        if (!whatsapp || !aadhaarCardUrl) {
            return NextResponse.json({ success: false, message: "Required fields missing" }, { status: 400 });
        }

        // Normalize phone: strip all non-digit characters then re-add a single leading '+'
        // This handles accidental double-prefix patterns like "+91+9779860804988" → "+9779860804988"
        const normalizePhone = (num: string) => {
            const digits = num.replace(/\D/g, '');
            return digits ? `+${digits}` : num;
        };
        const cleanWhatsapp = normalizePhone(whatsapp);

        await connectDB();
        const pandit = await Pandit.findByIdAndUpdate(decoded.panditId, {
            whatsapp: cleanWhatsapp,
            phone: cleanWhatsapp, // sync phone to the number entered during onboarding
            aadhaarCardUrl,
            aadhaarStatus: "pending"
        }, { new: true });

        console.log(`[Onboarding API] Updated Pandit: ID=${pandit?._id}, whatsapp="${pandit?.whatsapp}", aadhaar="${pandit?.aadhaarCardUrl}"`);

        if (!pandit) {
            return NextResponse.json({ success: false, message: "Pandit not found" }, { status: 404 });
        }

        revalidatePath("/pandit", "layout");

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            pandit: {
                name: pandit.name,
                whatsapp: pandit.whatsapp,
                aadhaarStatus: pandit.aadhaarStatus
            }
        });

    } catch (error) {
        console.error("Pandit onboarding error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
