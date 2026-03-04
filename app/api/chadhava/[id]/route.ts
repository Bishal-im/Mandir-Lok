import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Chadhava from "@/models/Chadhava";
import Temple from "@/models/Temple"; // ← Required so Mongoose registers the Temple schema before populate()

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "en";

    const chadhavaRaw = await Chadhava.findById(params.id).populate(
      "templeId",
      "name location slug"
    ).lean();

    if (!chadhavaRaw) {
      return NextResponse.json(
        { success: false, message: "Chadhava item not found" },
        { status: 404 }
      );
    }

    const item: any = { ...chadhavaRaw };

    // Localize item fields
    ["name", "description", "tag"].forEach(field => {
      if (item[field] && typeof item[field] === "object") {
        item[field] = item[field][lang] || item[field].en || "";
      }
    });

    if (item.benefits && Array.isArray(item.benefits)) {
      item.benefits = item.benefits.map((b: any) =>
        (typeof b === "object" ? (b[lang] || b.en || "") : b)
      );
    }

    // Localize populated temple name
    if (item.templeId && item.templeId.name && typeof item.templeId.name === "object") {
      item.templeId.name = item.templeId.name[lang] || item.templeId.name.en || "";
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("GET /api/chadhava/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}