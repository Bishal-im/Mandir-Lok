import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pooja from "@/models/Pooja";
import Chadhava from "@/models/Chadhava";
import Temple from "@/models/Temple";

export async function GET() {
  try {
    await connectDB();

    // Use Promise.all for parallel distinct queries
    const [pujaDeities, chadhavaCategories, templeCategories, templeStates] = await Promise.all([
      Pooja.distinct("deity", { isActive: true }),
      Chadhava.distinct("category", { isActive: true }),
      Temple.distinct("category", { isActive: true }),
      Temple.distinct("state", { isActive: true }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        poojas: pujaDeities.filter(Boolean).sort(),
        chadhava: chadhavaCategories.filter(Boolean).sort(),
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
