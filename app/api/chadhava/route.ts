import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Chadhava from "@/models/Chadhava";
import Temple from "@/models/Temple"; // ← Required so Mongoose registers the Temple schema before populate()

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const templeId = searchParams.get("templeId");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const filter: Record<string, unknown> = { isActive: true };

    if (templeId) {
      filter.templeId = templeId;
    }
    if (category && category !== "all") {
      filter.category = category;
    }
    if (featured === "true") {
      filter.isFeatured = true;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const chadhavaItems = await Chadhava.find(filter)
      .populate("templeId", "name location slug") // attach temple name & location
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: chadhavaItems });
  } catch (error) {
    console.error("GET /api/chadhava error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}