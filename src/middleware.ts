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
  }

  const userRole = token?.role as UserRole;
  const isApproved = token?.isApproved;
  const emailVerified = token?.emailVerified;
  const isActive = token?.isActive as boolean;

  const isApprovalRequiredPath = pathname.startsWith("/auth/approval-required");
  const isVerificationRequiredPath = pathname.startsWith(
    "/auth/email-verification-required"
  );
  const isActivationRequiredPath = pathname.startsWith(
    "/auth/activation-required"
  );

  // Rediriger si l'email n’est pas vérifié
  if (!emailVerified && !isVerificationRequiredPath) {
    return NextResponse.redirect(
      new URL("/auth/email-verification-required", origin)
    );
  }

  // Si l'utilisateur n'est pas approuvé et est un ADMIN
  if (
    (userRole === "HOSPITAL_ADMIN" || userRole === "INDEPENDENT_DOCTOR") &&
    isApproved === false &&
    !isApprovalRequiredPath
  ) {
    return NextResponse.redirect(new URL("/auth/approval-required", origin));
  }

  // 3) Activation gate (ALL roles)
  // If the account is inactive, send to activation page (avoid loops)
  if (isActive === false && !isActivationRequiredPath) {
    return NextResponse.redirect(new URL("/auth/activation-required", origin));
  }

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
