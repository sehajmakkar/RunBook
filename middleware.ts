import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

/**
 * Protected routes that require authentication
 */
const protectedRoutes = ["/dashboard", "/meeting", "/settings", "/profile"];

/**
 * Auth routes - redirect to dashboard if already logged in
 */
const authRoutes = ["/login"];

/**
 * Public routes - accessible to everyone
 */
const publicRoutes = ["/", "/auth/callback", "/terms", "/privacy"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create Supabase client and get user
  const { user, response } = await createClient(request);

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth route (login)
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

