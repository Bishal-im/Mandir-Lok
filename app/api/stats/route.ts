import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Temple from "@/models/Temple";
import Pooja from "@/models/Pooja";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const [totalUsers, totalTemples, completedPujas, uniqueStates] = await Promise.all([
            User.countDocuments(),
            Temple.countDocuments({ isActive: true }),
            Order.countDocuments({ orderStatus: "completed" }),
            Temple.distinct("state", { isActive: true })
        ]);

        // Format stats for display
        return NextResponse.json({
            success: true,
            stats: [
                {
                    value: totalUsers > 1000 ? `${(totalUsers / 1000).toFixed(1)}K+` : `${totalUsers}+`,
                    label: "Devotees Served",
                    raw: totalUsers
                },
                {
                    value: `${totalTemples}+`,
                    label: "Sacred Temples",
                    raw: totalTemples
                },
                {
                    value: completedPujas > 1000 ? `${(completedPujas / 1000).toFixed(1)}K+` : `${completedPujas}+`,
                    label: "Pujas Completed",
                    raw: completedPujas
                },
                {
                    value: `${uniqueStates.length}+`,
                    label: "States Covered",
                    raw: uniqueStates.length
                }
            ]
        });
    } catch (error) {
        console.error("GET /api/stats error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
