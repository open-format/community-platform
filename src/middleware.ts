import { getCurrentUser } from "@/lib/privy";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { chains } from "./constants/chains";

export async function middleware(request: NextRequest) {
  const user = await getCurrentUser();
  const pathname = request.nextUrl.pathname;

  // If on auth page
  if (pathname === "/auth") {
    // If user is logged in, redirect to home
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // If not logged in, allow access to auth page
    return NextResponse.next();
  }

  // For chain routes
  const chainName = pathname.split("/")[1];
  if (chainName) {
    // Check if chain exists
    const chainExists = Object.keys(chains).includes(chainName);
    if (!chainExists) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Require authentication for chain routes
    if (!user) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match auth page
    "/auth",
    // Match chain routes but exclude static files, api routes, and _next
    // "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};