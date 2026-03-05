import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "@/lib/jwt";

// ─── Secret keys ─────────────────────────────────────────────────────────────
// Set ADMIN_LOGIN_SECRET and PANDIT_LOGIN_SECRET in your Vercel env vars.
// Admins log in via:  yourdomain.vercel.app/admin/login?key=YOUR_ADMIN_SECRET
// Pandits log in via: yourdomain.vercel.app/pandit-login?key=YOUR_PANDIT_SECRET
const ADMIN_SECRET = process.env.ADMIN_LOGIN_SECRET || "mandirlok-admin-2024";
const PANDIT_SECRET = process.env.PANDIT_LOGIN_SECRET || "mandirlok-pandit-2024";

// ─── Middleware ───────────────────────────────────────────────────────────────
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ── 1. /admin/* — completely hidden unless you have the secret key ─────────
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("mandirlok_token")?.value;
    const decoded = token ? decodeToken(token) : null;

    // Already authenticated as admin → let through
    if (decoded?.role === "admin") return addPathHeader(req);

    // On the login page WITH correct secret key → let through
    if (pathname === "/admin/login" && searchParams.get("key") === ADMIN_SECRET) {
      return addPathHeader(req);
    }

    // Everything else → silently redirect to homepage (no hint admin exists)
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ── 2. /pandit-login — hidden unless you have the secret key ──────────────
  if (pathname.startsWith("/pandit-login")) {
    const token = req.cookies.get("mandirlok_pandit_token")?.value;
    const decoded = token ? decodeToken(token) : null;

    if (decoded) return addPathHeader(req);
    if (searchParams.get("key") === PANDIT_SECRET) return addPathHeader(req);

    return NextResponse.redirect(new URL("/", req.url));
  }

  // ── 3. /pandit/* — protected pages after pandit login ────────────────────
  if (pathname.startsWith("/pandit")) {
    const token = req.cookies.get("mandirlok_pandit_token")?.value;
    const decoded = token ? decodeToken(token) : null;

    if (decoded) return addPathHeader(req);

    return NextResponse.redirect(new URL("/", req.url));
  }

  // ── 4. User-only routes ───────────────────────────────────────────────────
  const USER_ROUTES = ["/dashboard", "/cart", "/booking"];
  if (USER_ROUTES.some((r) => pathname.startsWith(r))) {
    const token = req.cookies.get("mandirlok_token")?.value;
    const decoded = token ? decodeToken(token) : null;
    if (!decoded) return NextResponse.redirect(new URL("/login", req.url));
  }

  return addPathHeader(req);
}

function addPathHeader(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
