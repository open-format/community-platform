import { getCurrentUser } from "@/lib/privy";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import getCommunities from "./app/actions/communities";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Bypass middleware for Discord callback and its redirect as privy does not set the cookies in time
  if (
    pathname === "/api/discord/callback" ||
    (pathname === "/onboarding/integrations" && url.searchParams.has("guildId"))
  ) {
    return NextResponse.next();
  }

  const user = await getCurrentUser();
  const { communities, error } = await getCommunities();

  if (user && (error || !communities || communities.length === 0)) {
    return NextResponse.redirect(new URL("/onboarding/integrations", request.url));
  }

  // Redirect to /communities if user is logged in and on home page or auth page
  if (user && (pathname === "/" || pathname === "/auth")) {
    return NextResponse.redirect(new URL("/communities", request.url));
  }

  // Redirect to auth if no user and not on auth page
  if (!user && !pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // For the specific communities check
  if (pathname.startsWith("/communities/")) {
    const slug = pathname.split("/")[2];
    if (!user?.apps?.includes(slug)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/(authenticated)/:path*",
    "/auth",
    "/onboarding/:path*",
    "/onboarding",
  ],
};
