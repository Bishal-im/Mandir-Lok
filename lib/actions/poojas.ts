"use server";

import { connectDB } from "@/lib/db";
import Pooja from "@/models/Pooja";
import Temple from "@/models/Temple"; // Required for population

import { getLocalizedValue } from "@/lib/utils/localization";

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
      ["name", "description", "tag", "duration", "about"].forEach(field => {
        if (puja[field]) {
          puja[field] = getLocalizedValue(puja[field], lang);
        }
      });
      if (puja.templeId) {
        puja.templeId.name = getLocalizedValue(puja.templeId.name, lang);
      }
      return puja;
    });

    return { success: true, data: JSON.parse(JSON.stringify(poojas)) };
  } catch (error: any) {
    console.error("getFeaturedPoojas error:", error);
    return { success: false, error: error.message };
  }
}
