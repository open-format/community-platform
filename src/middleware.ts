import { getCurrentUser } from "@/lib/privy";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { chains, type ChainName } from "@/constants/chains";

export async function middleware(request: NextRequest) {
  const user = await getCurrentUser();
  const pathname = request.nextUrl.pathname;

  // Allow access to auth and API routes
  if (pathname.startsWith("/auth") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Handle chain selection page (home)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Check if the path starts with a chain name
  const chainName = pathname.split("/")[1];
  
  // If it's not a chain path, continue
  if (!chainName || chainName === "chain" || chainName === "api" || chainName === "auth") {
    return NextResponse.next();
  }

  // Check if the chain exists
  const chainExists = Object.keys(chains).includes(chainName);

  // If chain doesn't exist, redirect to home
  if (!chainExists) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not logged in, redirect to auth
  if (!user) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
