import { getCurrentUser } from "@/lib/privy";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { chains } from "./constants/chains";

export async function middleware(request: NextRequest) {
  const user = await getCurrentUser();
  const pathname = request.nextUrl.pathname;

  console.log("pathname", pathname);

  if (pathname === "/auth") {
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!user && !pathname.includes("/")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const chainName = pathname.split("/")[1];
  if (chainName) {
    const chainExists = Object.keys(chains).includes(chainName);

    if (!chainExists) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /logout
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!logout|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
    "/auth",
    "/:chainName/communities",
    "/:chainName/communities/:slug*",
  ],
};
