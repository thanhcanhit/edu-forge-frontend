import { NextResponse } from "next/server";

import { auth } from "@/auth";

export async function middleware(request: any) {
  const session = await auth();

  // Check if the path is in the admin section
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // If trying to access admin routes but not logged in or not an admin
  if (isAdminRoute) {
    if (!session) {
      // Not logged in, redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (session.user.role.toUpperCase() !== "ADMIN") {
      // Logged in but not an admin, redirect to home or unauthorized page
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|auth|verify|login|register|$).*)",
  ],
};
