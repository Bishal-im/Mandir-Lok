import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        // Authenticate via JWT cookie
        const token = cookies().get("mandirlok_token")?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            );
        }

        let decoded: { userId: string };
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid token" },
                { status: 401 }
            );
        }

        const order = await Order.findById(params.id)
            .populate("poojaId", "name emoji duration images")
            .populate("templeId", "name location")
            .populate("panditId", "name phone whatsapp photo")
            .populate("chadhavaItems.chadhavaId", "name image emoji");

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        // Ensure only the owner can see the order
        if (order.userId.toString() !== decoded.userId) {
            return NextResponse.json(
                { success: false, message: "Forbidden" },
                { status: 403 }
            );
        }

        return NextResponse.json({ success: true, data: order });
    } catch (error) {
        console.error("GET /api/orders/[id] error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
