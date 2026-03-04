"use server";

import { connectDB } from "@/lib/db";
import Pooja from "@/models/Pooja";
import Temple from "@/models/Temple"; // Required for population

export async function getFeaturedPoojas(lang: string = "en") {
  try {
    await connectDB();
    const poojasRaw = await Pooja.find({ isFeatured: true, isActive: true })
      .populate("templeId", "name location city state slug")
      .sort({ rating: -1 })
      .limit(6)
      .lean();

    const poojas = poojasRaw.map((p: any) => {
      const puja = { ...p };
      ["name", "description", "tag"].forEach(field => {
        if (puja[field] && typeof puja[field] === "object") {
          puja[field] = puja[field][lang] || puja[field].en || "";
        }
      });
      if (puja.templeId) {
        if (puja.templeId.name && typeof puja.templeId.name === "object") {
          puja.templeId.name = puja.templeId.name[lang] || puja.templeId.name.en || "";
        }
      }
      return puja;
    });

    return { success: true, data: JSON.parse(JSON.stringify(poojas)) };
  } catch (error: any) {
    console.error("getFeaturedPoojas error:", error);
    return { success: false, error: error.message };
  }
}
