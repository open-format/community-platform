import { getCurrentUser } from "@/lib/privy";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { i18nMiddleware } from './translationMiddleware/i18n';

export async function middleware(request: NextRequest) {
  // First handle i18n
  const i18nResponse = await i18nMiddleware(request);
  
  const user = await getCurrentUser();

  // Redirect to /communities if user is logged in and on home page or auth page
  if (user && (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/auth")) {
    return NextResponse.redirect(new URL("/communities", request.url));
  }

  // Redirect to auth if no user
  if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // For the specific communities check
  if (request.nextUrl.pathname.startsWith("/communities/")) {
    const slug = request.nextUrl.pathname.split("/")[2];
    if (!user?.apps?.includes(slug)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If no redirects needed, return the i18n response
  return i18nResponse;
}

export const config = {
  // Add i18n paths to matcher while preserving existing ones
  matcher: [
    '/',
    '/(en)/:path*',
    '/auth',
    '/(authenticated)/:path*',
  ]
};