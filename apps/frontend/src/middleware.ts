import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@repo/auth/server";
import { toast } from "sonner";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session && pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (
      session &&
      (pathname === "/" || pathname === "/login" || pathname === "/signup")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    toast("Error while redirecting");
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard/:path*", "/login"],
};
