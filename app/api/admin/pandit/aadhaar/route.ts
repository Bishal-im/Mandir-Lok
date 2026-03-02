import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pandit from "@/models/Pandit";
import { revalidatePath } from "next/cache";

export async function PATCH(req: Request) {
    try {
        const { id, status } = await req.json();
        if (!id || !["verified", "rejected", "pending"].includes(status)) {
            return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
        }

        await connectDB();
        const pandit = await Pandit.findByIdAndUpdate(id, { aadhaarStatus: status }, { new: true });

        if (!pandit) {
            return NextResponse.json({ success: false, message: "Pandit not found" }, { status: 404 });
        }

        revalidatePath("/admin/pandits");
        revalidatePath("/pandit/profile");

        return NextResponse.json({ success: true, aadhaarStatus: pandit.aadhaarStatus });
    } catch (error) {
        console.error("Aadhaar status update error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
