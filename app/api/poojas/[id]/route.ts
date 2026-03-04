import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pooja from "@/models/Pooja";
import Chadhava from "@/models/Chadhava";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "en";

    const isMongoId = mongoose.Types.ObjectId.isValid(id);

    // Find pooja by _id or slug, populate temple details
    const poojaData = isMongoId
      ? await Pooja.findById(id).populate("templeIds")
      : await Pooja.findOne({ slug: id, isActive: true }).populate("templeIds");

    if (!poojaData) {
      return NextResponse.json(
        { success: false, message: "Pooja not found" },
        { status: 404 }
      );
    }

    // Helper to localize entity
    const localize = (obj: any, fields: string[]) => {
      const result = { ...obj };
      fields.forEach(field => {
        if (result[field] && typeof result[field] === "object") {
          result[field] = result[field][lang] || result[field].en || "";
        }
      });
      return result;
    };

    // Also fetch chadhava items for temples associated with this pooja
    const chadhavaItemsRaw = await Chadhava.find({
      templeId: { $in: poojaData.templeIds.map((t: any) => t._id) },
      isActive: true,
    });

    // Localize pooja and its populated temples
    const poojaObj = poojaData.toObject();
    const pooja = {
      ...localize(poojaObj, ["name", "description", "about", "duration", "tag"]),
      benefits: poojaObj.benefits?.map((b: any) => (typeof b === "object" ? b[lang] || b.en : b)),
      includes: poojaObj.includes?.map((i: any) => (typeof i === "object" ? i[lang] || i.en : i)),
      templeIds: poojaObj.templeIds?.map((t: any) => localize(t, ["name", "description", "about"])),
      packages: poojaObj.packages?.map((pkg: any) => ({
        ...pkg,
        name: typeof pkg.name === "object" ? pkg.name[lang] || pkg.name.en : pkg.name
      }))
    };

    // Localize chadhava items
    const chadhavaItems = chadhavaItemsRaw.map(c => localize(c.toObject(), ["name", "description"]));

    return NextResponse.json({
      success: true,
      data: {
        pooja,
        chadhavaItems,
      },
      lang
    });
  } catch (error) {
    console.error("GET /api/poojas/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}