// app/api/subscription/summary/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
// import prisma from "@/lib/prisma";
import {
  getLimitSummaryForCurrentUser,
  resolveTenantFromSession,
} from "@/lib/limits";
import {
  //   computeEffectiveStatus,
  computeTimeMeta,
  //   inferInterval,
} from "@/lib/subscription";
import { UserRole } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ show: false });

  const role = session.user.role as UserRole;
  if (role !== "HOSPITAL_ADMIN" && role !== "INDEPENDENT_DOCTOR") {
    return NextResponse.json({ show: false });
  }

  const tenant = await resolveTenantFromSession();
  if (!tenant) return NextResponse.json({ show: false });

  const summary = await getLimitSummaryForCurrentUser(); // gives plan, nominal status, limits & usage
  if (!summary) return NextResponse.json({ show: false });

  const { daysRemaining, daysOverdue, inGrace } = computeTimeMeta(
    summary?.endDate,
    0
  ); // set grace > 0 if you want a grace period

  // Choose primary quota line (like before)
  const { limits, usage } = summary;
  let primaryKey:
    | "appointmentsPerMonth"
    | "doctorsPerHospital"
    | "patientsPerMonth" = "appointmentsPerMonth";
  if (tenant.scope === "HOSPITAL" && limits.doctorsPerHospital != null) {
    primaryKey = "doctorsPerHospital";
  }

  return NextResponse.json({
    show: true,
    scope: tenant.scope,
    role,
    plan: summary.plan, // FREE | STANDARD | PREMIUM
    status: summary.status, // ACTIVE | TRIAL | INACTIVE | EXPIRED | PENDING
    startDate: summary?.startDate ?? null,
    endDate: summary?.endDate ?? null,
    daysRemaining, // e.g., 12
    daysOverdue, // e.g., 3
    inGrace,
    usage: {
      primary: {
        key: primaryKey,
        current: usage[primaryKey],
        limit: limits[primaryKey],
        label:
          primaryKey === "doctorsPerHospital"
            ? "Médecins"
            : primaryKey ===
                ("patientsPerMonth" as
                  | "appointmentsPerMonth"
                  | "doctorsPerHospital"
                  | "patientsPerMonth")
              ? "Patients/mois"
              : "Rendez-vous/mois",
      },
      full: { limits, usage },
    },
  });
}
