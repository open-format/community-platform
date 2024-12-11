import { getCurrentUser } from "@/lib/privy";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const user = await getCurrentUser();

  console.log({ user });

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
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
  matcher: ["/(authenticated)/:path*", "/communities/:path*"],
};
