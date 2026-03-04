import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Song from "@/models/Song";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = cookies().get("mandirlok_token")?.value;
        const decoded = token ? verifyToken(token) : null;
        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json({ success: false }, { status: 403 });
        }

        const { id } = params;
        const body = await req.json();
        await connectDB();

        const updatedSong = await Song.findByIdAndUpdate(id, body, { new: true });

        if (!updatedSong) {
            return NextResponse.json({ success: false, message: "Song not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedSong });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = cookies().get("mandirlok_token")?.value;
        const decoded = token ? verifyToken(token) : null;
        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json({ success: false }, { status: 403 });
        }

        const { id } = params;
        await connectDB();

        const deletedSong = await Song.findByIdAndDelete(id);

        if (!deletedSong) {
            return NextResponse.json({ success: false, message: "Song not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Song deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}