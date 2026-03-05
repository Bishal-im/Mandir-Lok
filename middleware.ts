import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "@/lib/jwt";

// ─── Subdomain helpers ────────────────────────────────────────────────────────
function getSubdomain(req: NextRequest): string | null {
  const host = req.headers.get("host") || "";
  // e.g.  admin.mandirlok.com  →  "admin"
  //       mandirlok.com        →  null
  //       localhost:3000        →  null  (local dev)
  const parts = host.split(".");
  if (parts.length >= 3) return parts[0]; // admin | pandit
  return null;
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const subdomain = getSubdomain(req);

  // ── 1. Block /admin and /pandit paths on the MAIN domain ──────────────────
  //    Anyone typing mandirlok.com/admin just gets sent home.
  if (!subdomain) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (pathname.startsWith("/pandit")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ── 2. Admin subdomain (admin.mandirlok.com) ───────────────────────────────
  if (subdomain === "admin") {
    // Allow the login page without auth
    if (pathname.startsWith("/admin/login")) {
      return addPathHeader(req);
    }

    // Everything else on admin subdomain needs admin JWT
    const token = req.cookies.get("mandirlok_token")?.value;
    const decoded = token ? decodeToken(token) : null;

    if (!decoded || decoded.role !== "admin") {
      // Redirect to admin login (still on admin subdomain)
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 3. Pandit subdomain (pandit.mandirlok.com) ────────────────────────────
  if (subdomain === "pandit") {
    // Allow the login page without auth
    if (pathname.startsWith("/pandit-login")) {
      return addPathHeader(req);
    }

    // Everything else on pandit subdomain needs pandit JWT
    const token = req.cookies.get("mandirlok_pandit_token")?.value;
    const decoded = token ? decodeToken(token) : null;

    if (!decoded) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/pandit-login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 4. Main domain — protect user-only routes ─────────────────────────────
  const PROTECTED_USER_ROUTES = ["/dashboard", "/cart", "/booking"];
  if (PROTECTED_USER_ROUTES.some((r) => pathname.startsWith(r))) {
    const token = req.cookies.get("mandirlok_token")?.value;
    const decoded = token ? decodeToken(token) : null;
    if (!decoded) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return addPathHeader(req);
}

// Utility: pass pathname as a header so server components can read it
function addPathHeader(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    /*
     * Match every route EXCEPT Next.js internals and static assets.
     * This lets the middleware check the subdomain on every request.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
