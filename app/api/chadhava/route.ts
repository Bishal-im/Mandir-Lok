import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Chadhava from "@/models/Chadhava";
import Temple from "@/models/Temple"; // ← Required so Mongoose registers the Temple schema before populate()

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const lang = searchParams.get("lang") || "en";
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

    const chadhavaItemsRaw = await Chadhava.find(filter)
      .populate("templeId", "name location slug") // attach temple name & location
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();

    const chadhavaItems = chadhavaItemsRaw.map((item: any) => {
      const localized = { ...item };
      ["name", "description", "tag"].forEach(field => {
        if (localized[field] && typeof localized[field] === "object") {
          localized[field] = localized[field][lang] || localized[field].en || "";
        }
      });
      if (localized.benefits && Array.isArray(localized.benefits)) {
        localized.benefits = localized.benefits.map((b: any) =>
          typeof b === "object" ? b[lang] || b.en || "" : b
        );
      }
      return localized;
    });

    return NextResponse.json({ success: true, data: chadhavaItems });
  } catch (error) {
    console.error("GET /api/chadhava error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}