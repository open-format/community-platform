import { getCurrentUser } from "@/lib/privy";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { chains } from "./constants/chains";

export async function middleware(request: NextRequest) {
  const user = await getCurrentUser();
  const pathname = request.nextUrl.pathname;

  if (pathname === "/auth") {
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const chainName = pathname.split("/")[1];
  if (chainName) {
    const chainExists = Object.keys(chains).includes(chainName);
    if (!chainExists) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!user) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth", // Auth path
    "/:chainName", // Chain-specific routes
  ],
};
