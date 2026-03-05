import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Temple from "@/models/Temple";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const state = searchParams.get("state");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = { isActive: true };
    if (featured === "true") query.isFeatured = true;
    if (category && category !== "all") query.category = category;
    if (state && state !== "all") query.state = state;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
        { deity: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // Use aggregation to calculate dynamic fields
    const pipeline: any[] = [
      { $match: query },
      // Lookup active poojas
      {
        $lookup: {
          from: "poojas",
          let: { templeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$templeId", "$$templeId"] },
                    { $eq: ["$isActive", true] }
                  ]
                }
              }
            }
          ],
          as: "activePoojas"
        }
      },
      // Lookup approved reviews
      {
        $lookup: {
          from: "reviews",
          let: { templeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$templeId", "$$templeId"] },
                    { $eq: ["$isApproved", true] }
                  ]
                }
              }
            }
          ],
          as: "approvedReviews"
        }
      },
      {
        $addFields: {
          pujasAvailable: { $size: "$activePoojas" },
          totalReviews: { $size: "$approvedReviews" },
          rating: {
            $cond: {
              if: { $gt: [{ $size: "$approvedReviews" }, 0] },
              then: { $avg: "$approvedReviews.rating" },
              else: "$rating" // Keep existing rating as default if no reviews
            }
          }
        }
      },
      {
        $project: {
          activePoojas: 0,
          approvedReviews: 0
        }
      },
      { $sort: { isFeatured: -1, isPopular: -1, rating: -1 } }
    ];

    const [temples, total] = await Promise.all([
      Temple.aggregate(pipeline).skip(skip).limit(limit),
      Temple.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: temples,  // existing pages use: data.success + data.data
      temples,        // FeaturedTemples uses: data.temples
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/temples error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch temples" },
      { status: 500 }
    );
  }
}