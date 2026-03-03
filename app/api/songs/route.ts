import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Song from "@/models/Song";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const deity = searchParams.get("deity");
        const type = searchParams.get("type");

        await connectDB();

        const query: any = { isActive: true };
        if (deity) {
            query.deity = { $regex: new RegExp(`^${deity}$`, "i") };
        }
        if (type && type !== "All") {
            query.type = type.toLowerCase();
        }

        const songs = await Song.find(query).sort({ createdAt: -1 });

        return NextResponse.json(songs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
