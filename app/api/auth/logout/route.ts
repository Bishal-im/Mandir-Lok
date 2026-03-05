import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  // Clear the JWT cookie
  response.cookies.set("mandirlok_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
    ...(process.env.NODE_ENV === "production" && { domain: ".mandirlok.com" }),
  });
  return response;
}