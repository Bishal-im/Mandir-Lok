import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Chadhava from "@/models/Chadhava";
import Temple from "@/models/Temple"; // ← Required so Mongoose registers the Temple schema before populate()

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const chadhava = await Chadhava.findById(params.id).populate(
      "templeId",
      "name location slug"
    );

    if (!chadhava) {
      return NextResponse.json(
        { success: false, message: "Chadhava item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: chadhava });
  } catch (error) {
    console.error("GET /api/chadhava/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}