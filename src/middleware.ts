import { getCurrentUser } from "@/lib/privy";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const user = await getCurrentUser();

  console.log({ user });

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/(authenticated)/:path*", "/auth"],
};
