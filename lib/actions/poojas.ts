"use server";

import { connectDB } from "@/lib/db";
import Pooja from "@/models/Pooja";
import Temple from "@/models/Temple"; // Required for population

export async function getFeaturedPoojas() {
  try {
    await connectDB();
    const poojas = await Pooja.find({ isFeatured: true, isActive: true })
      .populate("templeId", "name location city state slug")
      .sort({ rating: -1 })
      .limit(6)
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(poojas)) };
  } catch (error: any) {
    console.error("getFeaturedPoojas error:", error);
    return { success: false, error: error.message };
  }
}
