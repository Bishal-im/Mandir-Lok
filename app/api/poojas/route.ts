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

    const query: Record<string, unknown> = { isActive: true };
    if (featured === "true") query.isFeatured = true;
    if (templeId) query.templeId = templeId;
    if (deity && deity !== "all") query.deity = deity;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { deity: { $regex: search, $options: "i" } },
      ];
    }

    const lang = searchParams.get("lang") || "en";
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
          },
          // Localize fields
          name: {
            $cond: {
              if: { $eq: [{ $type: "$name" }, "string"] },
              then: "$name",
              else: { $ifNull: [`$name.${lang}`, "$name.en"] }
            }
          },
          description: {
            $cond: {
              if: { $eq: [{ $type: "$description" }, "string"] },
              then: "$description",
              else: { $ifNull: [`$description.${lang}`, "$description.en"] }
            }
          },
          about: {
            $cond: {
              if: { $eq: [{ $type: "$about" }, "string"] },
              then: "$about",
              else: { $ifNull: [`$about.${lang}`, "$about.en"] }
            }
          },
          duration: {
            $cond: {
              if: { $eq: [{ $type: "$duration" }, "string"] },
              then: "$duration",
              else: { $ifNull: [`$duration.${lang}`, "$duration.en"] }
            }
          },
          tag: {
            $cond: {
              if: { $eq: [{ $type: "$tag" }, "string"] },
              then: "$tag",
              else: { $ifNull: [`$tag.${lang}`, "$tag.en"] }
            }
          },
          benefits: {
            $map: {
              input: "$benefits",
              as: "b",
              in: {
                $cond: {
                  if: { $eq: [{ $type: "$$b" }, "string"] },
                  then: "$$b",
                  else: { $ifNull: [`$$b.${lang}`, "$$b.en"] }
                }
              }
            }
          },
          includes: {
            $map: {
              input: "$includes",
              as: "i",
              in: {
                $cond: {
                  if: { $eq: [{ $type: "$$i" }, "string"] },
                  then: "$$i",
                  else: { $ifNull: [`$$i.${lang}`, "$$i.en"] }
                }
              }
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

    // Note: aggregate doesn't support .populate() directly, so we need to $lookup the temple info
    pipeline.splice(1, 0, {
      $lookup: {
        from: "temples",
        localField: "templeId",
        foreignField: "_id",
        as: "templeId"
      }
    }, {
      $unwind: "$templeId"
    }, {
      $project: {
        "templeId.description": 0,
        "templeId.about": 0,
        "templeId.images": 0,
        "templeId.openTime": 0,
        "templeId.phone": 0,
        "templeId.website": 0,
        "templeId.mapUrl": 0
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
      lang,
    });
  } catch (error) {
    console.error("GET /api/poojas error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch poojas" },
      { status: 500 }
    );
  }
}