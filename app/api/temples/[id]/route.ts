import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Temple from "@/models/Temple";
import Pooja from "@/models/Pooja";
import Chadhava from "@/models/Chadhava";
import Review from "@/models/Review";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Support both MongoDB _id and slug
    const isMongoId = mongoose.Types.ObjectId.isValid(id);

    const temple = isMongoId
      ? await Temple.findById(id)
      : await Temple.findOne({ slug: id, isActive: true });

    if (!temple) {
      return NextResponse.json(
        { success: false, message: "Temple not found" },
        { status: 404 }
      );
    }

    // Fetch poojas and chadhava for this temple
    const [poojas, chadhavaItems, reviewsData] = await Promise.all([
      Pooja.find({ templeId: temple._id, isActive: true }).sort({ isFeatured: -1, rating: -1 }),
      Chadhava.find({ templeId: temple._id, isActive: true }),
      Review.aggregate([
        { $match: { templeId: temple._id, isApproved: true } },
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
      : temple.rating;

    return NextResponse.json({
      success: true,
      data: {
        temple: {
          ...temple.toObject(),
          rating: avgRating,
          totalReviews: totalReviews,
          ratingDistribution: distribution
        },
        poojas,
        chadhavaItems,
      },
    });
  } catch (error) {
    console.error("GET /api/temples/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}