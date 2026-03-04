import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Temple from "@/models/Temple";
import Pooja from "@/models/Pooja";
import Chadhava from "@/models/Chadhava";
import Review from "@/models/Review";
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

    // Support both MongoDB _id and slug
    const isMongoId = mongoose.Types.ObjectId.isValid(id);

    const templeData = isMongoId
      ? await Temple.findById(id)
      : await Temple.findOne({ slug: id, isActive: true });

    if (!templeData) {
      return NextResponse.json(
        { success: false, message: "Temple not found" },
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

    // Fetch poojas and chadhava for this temple
    const [poojasRaw, chadhavaItemsRaw, reviewsData] = await Promise.all([
      Pooja.find({ templeId: templeData._id, isActive: true }).sort({ isFeatured: -1, rating: -1 }),
      Chadhava.find({ templeId: templeData._id, isActive: true }),
      Review.aggregate([
        { $match: { templeId: templeData._id, isApproved: true } },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format rating distribution
    const distribution = [5, 4, 3, 2, 1].reduce((acc: any, star: number) => {
      const found = reviewsData.find((d: any) => d._id === star);
      acc[star] = found ? found.count : 0;
      return acc;
    }, {});

    // Calculate total reviews and average rating from reviews collection
    const totalReviews = reviewsData.reduce((sum: number, d: any) => sum + d.count, 0);
    const avgRating = totalReviews > 0
      ? Number((reviewsData.reduce((sum: number, d: any) => sum + (d._id * d.count), 0) / totalReviews).toFixed(1))
      : templeData.rating;

    // Localize temple
    const temple = localize(templeData.toObject(), ["name", "description", "about"]);

    // Localize poojas
    const poojas = poojasRaw.map(p => {
      const pooja = p.toObject();
      return {
        ...localize(pooja, ["name", "description", "about", "duration", "tag"]),
        benefits: pooja.benefits?.map((b: any) => (typeof b === "object" ? b[lang] || b.en : b)),
        includes: pooja.includes?.map((i: any) => (typeof i === "object" ? i[lang] || i.en : i)),
        packages: pooja.packages?.map((pkg: any) => ({
          ...pkg,
          name: typeof pkg.name === "object" ? pkg.name[lang] || pkg.name.en : pkg.name
        }))
      };
    });

    // Localize chadhava (if needed - currently chadhava models might not be localized yet but we can prep)
    const chadhavaItems = chadhavaItemsRaw.map(c => localize(c.toObject(), ["name", "description"]));

    return NextResponse.json({
      success: true,
      data: {
        temple: {
          ...temple,
          rating: avgRating,
          totalReviews: totalReviews,
          ratingDistribution: distribution
        },
        poojas,
        chadhavaItems,
      },
      lang
    });
  } catch (error) {
    console.error("GET /api/temples/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}