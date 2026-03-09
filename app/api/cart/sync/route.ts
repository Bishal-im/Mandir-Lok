import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import CartItem from "@/models/CartItem";

// Sync local cart with database
export async function POST(req: Request) {
    try {
        await connectDB();

        const token = cookies().get("mandirlok_token")?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
        }

        let body: any = {};
        try {
            body = await req.json();
        } catch {
            // Empty or malformed body — treat as empty cart
            body = { cartItems: [] };
        }
        const { cartItems } = body;

        // Clear existing cart for user and replace with new items
        // This is a simple sync strategy
        await CartItem.deleteMany({ userId: decoded.userId });

        if (cartItems && cartItems.length > 0) {
            const itemsToSave = cartItems.map((item: any) => {
                // Remove client-side _id if present to avoid duplicate key errors
                const { _id, ...rest } = item;
                return {
                    ...rest,
                    userId: decoded.userId,
                    date: new Date(item.date),
                };
            });
            await CartItem.insertMany(itemsToSave);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Cart sync error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// Get cart from database
export async function GET() {
    try {
        await connectDB();

        const token = cookies().get("mandirlok_token")?.value;
        if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

        const items = await CartItem.find({ userId: decoded.userId }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: items });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
