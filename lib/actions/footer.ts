"use server";

import { connectDB } from "@/lib/db";
import Temple from "@/models/Temple";
import Pooja from "@/models/Pooja";

export async function getFooterData() {
  try {
    await connectDB();
    const [temples, poojas] = await Promise.all([
      Temple.find({ isPopular: true, isActive: true })
        .select("name slug")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Pooja.find({ isFeatured: true, isActive: true })
        .select("name slug")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    return {
      success: true,
      temples: JSON.parse(JSON.stringify(temples)),
      poojas: JSON.parse(JSON.stringify(poojas)),
    };
  } catch (error) {
    console.error("getFooterData error:", error);
    return { success: false, temples: [], poojas: [] };
  }
}
