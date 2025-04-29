import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname, origin } = req.nextUrl;

  if (!token) {
    const callbackUrl = encodeURIComponent(
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(
      new URL(`/auth?callbackUrl=${callbackUrl}`, origin)
    );
    // return NextResponse.redirect(new URL("/auth", req.url));
  }

  const userRole = token?.role as UserRole;

  const rolePaths: Record<UserRole, string> = {
    SUPER_ADMIN: "/dashboard/superadmin",
    HOSPITAL_ADMIN: "/dashboard/hopital_admin",
    PATIENT: "/dashboard/patient",
    INDEPENDENT_DOCTOR: "/dashboard/independant_doctor",
    HOSPITAL_DOCTOR: "/dashboard/hopital_doctor",
  };

  // Accessible routes
  const allowedPath = rolePaths[userRole];

  if (allowedPath && !pathname.startsWith(allowedPath)) {
    return NextResponse.redirect(new URL(allowedPath, req.url));
  }

  return NextResponse.next();
}

// Appliquer le middleware aux routes de dashboard
export const config = {
  matcher: ["/dashboard/:path*"], // Protect all `/dashboard/*` routes
};
