import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pooja from "@/models/Pooja";
import Chadhava from "@/models/Chadhava";
import Pandit from "@/models/Pandit";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    const isMongoId = mongoose.Types.ObjectId.isValid(id);

    // Find pooja by _id or slug, populate temple details
    const pooja = isMongoId
      ? await Pooja.findById(id).populate("templeIds")
      : await Pooja.findOne({ slug: id, isActive: true }).populate("templeIds");

    if (!pooja) {
      return NextResponse.json(
        { success: false, message: "Pooja not found" },
        { status: 404 }
      );
    }

    // Also fetch chadhava items for temples associated with this pooja
    const templeIds = pooja.templeIds.map((t: any) => t._id);
    
    const [chadhavaItems, pandits] = await Promise.all([
      Chadhava.find({
        templeId: { $in: templeIds },
        isActive: true,
      }),
      Pandit.find({
        assignedTemples: { $in: templeIds },
        isActive: true,
      }).select("name photo experienceYears languages bio assignedTemples"),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        pooja,
        chadhavaItems,
        pandits,
      },
    });
  } catch (error) {
    console.error("GET /api/poojas/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}