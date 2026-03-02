import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "@/lib/jwt";

const PROTECTED_USER_ROUTES = ["/dashboard", "/cart", "/booking"];
const PROTECTED_ADMIN_ROUTES = ["/admin"];
const PROTECTED_PANDIT_ROUTES = ["/pandit"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect User Routes
  if (PROTECTED_USER_ROUTES.some(r => pathname.startsWith(r))) {
    const token = req.cookies.get("mandirlok_token")?.value;
    const decoded = token ? decodeToken(token) : null;
    if (!decoded) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect Admin Routes (excluding /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("mandirlok_token")?.value;
    const decoded = token ? decodeToken(token) : null;

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Protect Pandit Routes
  if (PROTECTED_PANDIT_ROUTES.some(r => pathname.startsWith(r))) {
    const token = req.cookies.get("mandirlok_pandit_token")?.value;
    const decoded = token ? decodeToken(token) : null;
    if (!decoded) {
      return NextResponse.redirect(new URL("/pandit-login", req.url));
    }
  }

  // Pass current pathname to headers for server components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cart/:path*",
    "/booking/:path*",
    "/admin/:path*",
    "/pandit/:path*",
  ],
};
