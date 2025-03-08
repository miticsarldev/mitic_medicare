import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  if (!token) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  const userRole = token?.role as UserRole;

  const rolePaths: Record<UserRole, string> = {
    super_admin: "/dashboard/superadmin",
    hospital_admin: "/dashboard/hopital_admin",
    patient: "/dashboard/patient",
    independent_doctor: "/dashboard/independant_doctor",
    hospital_doctor: "/dashboard/hopital_doctor",
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
