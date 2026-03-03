import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Song from "@/models/Song";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const token = cookies().get("mandirlok_token")?.value;
        const decoded = token ? verifyToken(token) : null;
        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json({ success: false }, { status: 403 });
        }

        await connectDB();
        const songs = await Song.find().sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: songs });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = cookies().get("mandirlok_token")?.value;
        const decoded = token ? verifyToken(token) : null;
        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json({ success: false }, { status: 403 });
        }

        const body = await req.json();
        console.log("Creating song with body:", body);
        await connectDB();

        const newSong = await Song.create(body);
        console.log("Song created successfully:", newSong);

        return NextResponse.json({ success: true, data: newSong });
    } catch (error: any) {
        console.error("Song creation failed:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
