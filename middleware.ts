import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LRUCache } from "lru-cache";

const counts = new LRUCache({ max: 5000, ttl: 1000 * 60 }); // 1-min window

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const editing = req.nextUrl.pathname.startsWith("/edit");

  if (editing && (!token || token.role !== "admin")) {
    return NextResponse.redirect(new URL("/", req.url)); // or /login
  }

  const path = req.nextUrl.pathname;

  const mutating = ["POST", "PATCH", "DELETE"].includes(req.method);
  if (mutating && !path.startsWith("/api/auth")) {
    // Simple same-origin check
    const origin = req.headers.get("origin");
    if (origin && origin !== req.nextUrl.origin) {
      return NextResponse.json({ message: "CSRF detected" }, { status: 403 });
    }

    // IP-based rate-limit (more lenient for admins)
    const key = `${req.ip}:${path}`;
    const hits = ((counts.get(key) as number | undefined) ?? 0) + 1;
    counts.set(key, hits);
    
    // Higher limit for admins, lower for regular users
    const limit = token?.role === "admin" ? 200 : 100;
    if (hits > limit) {
      return NextResponse.json({ message: "Too many requests" }, { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/edit/:path*", "/api/:path*"],
};
