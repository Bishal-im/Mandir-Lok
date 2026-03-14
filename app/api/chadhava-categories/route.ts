import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ChadhavaCategory from "@/models/ChadhavaCategory";

export async function GET() {
  try {
    await connectDB();
    const categories = await ChadhavaCategory.find({ isActive: true }).sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET /api/chadhava-categories error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
