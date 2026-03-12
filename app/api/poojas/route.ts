import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pooja from "@/models/Pooja";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");
    const templeId = searchParams.get("templeId");
    const search = searchParams.get("search");
    const deity = searchParams.get("deity");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, any> = { isActive: true };
    if (featured === "true") query.isFeatured = true;
    if (templeId) {
      query.$or = [
        { templeId: templeId },
        { templeIds: templeId }
      ];
    }
    if (deity && deity !== "all") query.deity = deity;
    if (search) {
      const searchTerms = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { deity: { $regex: search, $options: "i" } },
      ];
      if (query.$or) {
        // If we already have an $or (from templeId), we need to $and it with the search $or
        const existingOr = query.$or;
        delete query.$or;
        query.$and = [
          { $or: existingOr },
          { $or: searchTerms }
        ];
      } else {
        query.$or = searchTerms;
      }
    }

    const skip = (page - 1) * limit;

    // Use aggregation to calculate dynamic fields
    const pipeline: any[] = [
      { $match: query },
      // Lookup approved reviews for each pooja
      {
        $lookup: {
          from: "reviews",
          let: { poojaId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$poojaId", "$$poojaId"] },
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
          approvedReviews: 0
        }
      },
      { $sort: { isFeatured: -1, rating: -1 } }
    ];

    // Lookup temple info for templeIds array
    pipeline.splice(1, 0, {
      $lookup: {
        from: "temples",
        localField: "templeIds",
        foreignField: "_id",
        as: "templeIds"
      }
    }, {
      $project: {
        "templeIds.description": 0,
        "templeIds.about": 0,
        "templeIds.images": 0,
        "templeIds.openTime": 0,
        "templeIds.phone": 0,
        "templeIds.website": 0,
        "templeIds.mapUrl": 0
      }
    });

    const [poojas, total] = await Promise.all([
      Pooja.aggregate(pipeline).skip(skip).limit(limit),
      Pooja.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: poojas,   // existing pages use: data.success + data.data
      poojas,         // FeaturedPoojas uses: data.poojas
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/poojas error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch poojas" },
      { status: 500 }
    );
  }
}