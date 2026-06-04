import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/lookup-applicant",
  "/api/verify-applicant",
  "/api/edubot",
  "/production-os",
  "/ship-it",
];

const publicPrefixes = [
  "/_next",
  "/favicon.ico",
  "/images",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname === p) || publicPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow root path
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Check for session cookie on protected routes
  const sessionCookie = request.cookies.get("co_session");

  // Redirect to login if no session cookie on protected routes
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
