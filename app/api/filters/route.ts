import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pooja from "@/models/Pooja";
import Chadhava from "@/models/Chadhava";
import ChadhavaCategory from "@/models/ChadhavaCategory";
import Temple from "@/models/Temple";

export async function GET() {
  try {
    await connectDB();

    // Use Promise.all for parallel distinct queries
    const [pujaDeities, chadhavaCategories, templeCategories, templeStates] = await Promise.all([
      Pooja.distinct("deity", { isActive: true }),
      ChadhavaCategory.find({ isActive: true }).sort({ name: 1 }).lean(),
      Temple.distinct("category", { isActive: true }),
      Temple.distinct("state", { isActive: true }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        poojas: pujaDeities.filter(Boolean).sort(),
        chadhava: chadhavaCategories.map((c: any) => c.name),
        temples: {
          categories: templeCategories.filter(Boolean).sort(),
          states: templeStates.filter(Boolean).sort(),
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/filters error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}
