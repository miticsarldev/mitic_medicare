// lib/limits.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfMonth, addMonths } from "date-fns";
import { SubscriptionPlan, SubscriptionStatus, UserRole } from "@prisma/client";

export type LimitKey =
  | "appointmentsPerMonth"
  | "patientsPerMonth"
  | "doctorsPerHospital";

export type LimitSummary = {
  scope: "DOCTOR" | "HOSPITAL";
  scopeId: string;
  plan: SubscriptionPlan | "FREE";
  status: "ACTIVE" | "TRIAL" | "INACTIVE" | "EXPIRED";
  limits: Record<LimitKey, number | null>;
  usage: Record<LimitKey, number>;
  exceeded: Record<LimitKey, boolean>;
  anyExceeded: boolean;
};

// ✅ helper to do half-open month window [start, end)
function monthWindow(date = new Date()) {
  const start = startOfMonth(date);
  const end = addMonths(start, 1);
  return { start, end };
}

function isUnlimited(v: number | null | undefined) {
  return v === null || v === undefined;
}

// ✅ Return null instead of throwing for unsupported roles
export async function resolveTenantFromSession(): Promise<{
  scope: "DOCTOR" | "HOSPITAL";
  scopeId: string;
} | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { doctor: { include: { hospital: true } }, hospital: true },
  });
  if (!user) return null;

  // Only these two roles participate in limits
  if (user.role === UserRole.INDEPENDENT_DOCTOR && user.doctor?.isIndependent) {
    return { scope: "DOCTOR", scopeId: user.doctor.id };
  }
  if (user.role === UserRole.HOSPITAL_ADMIN && user.hospital) {
    return { scope: "HOSPITAL", scopeId: user.hospital.id };
  }

  // Ignore (no limits banner) for PATIENT, SUPER_ADMIN, HOSPITAL_DOCTOR
  return null;
}

export async function getActiveSubscription(
  scope: "DOCTOR" | "HOSPITAL",
  scopeId: string
) {
  const where =
    scope === "DOCTOR" ? { doctorId: scopeId } : { hospitalId: scopeId };
  const sub = await prisma.subscription.findFirst({
    where: {
      ...where,
      status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
    },
    orderBy: { updatedAt: "desc" },
  });
  return sub ?? null;
}

export async function getPlanLimits(plan: string) {
  const cfg = await prisma.planConfig.findUnique({
    where: { code: plan as SubscriptionPlan },
    include: { limits: true },
  });

  // If no config, treat as unlimited (safer than crashing)
  return {
    appointmentsPerMonth: cfg?.limits?.maxAppointments ?? null,
    patientsPerMonth: cfg?.limits?.maxPatients ?? null,
    doctorsPerHospital: cfg?.limits?.maxDoctorsPerHospital ?? null,
  } as Record<LimitKey, number | null>;
}

export async function getUsage(scope: "DOCTOR" | "HOSPITAL", scopeId: string) {
  const { start, end } = monthWindow();

  const usage: Record<LimitKey, number> = {
    appointmentsPerMonth: 0,
    patientsPerMonth: 0,
    doctorsPerHospital: 0,
  };

  if (scope === "DOCTOR") {
    usage.appointmentsPerMonth = await prisma.appointment.count({
      where: { doctorId: scopeId, scheduledAt: { gte: start, lt: end } },
    });
    const patientAgg = await prisma.appointment.findMany({
      where: { doctorId: scopeId, scheduledAt: { gte: start, lt: end } },
      select: { patientId: true },
      distinct: ["patientId"],
    });
    usage.patientsPerMonth = patientAgg.length;
  } else {
    usage.appointmentsPerMonth = await prisma.appointment.count({
      where: {
        OR: [{ hospitalId: scopeId }, { doctor: { hospitalId: scopeId } }],
        scheduledAt: { gte: start, lt: end },
      },
    });
    const patientAgg = await prisma.appointment.findMany({
      where: {
        OR: [{ hospitalId: scopeId }, { doctor: { hospitalId: scopeId } }],
        scheduledAt: { gte: start, lt: end },
      },
      select: { patientId: true },
      distinct: ["patientId"],
    });
    usage.patientsPerMonth = patientAgg.length;

    usage.doctorsPerHospital = await prisma.doctor.count({
      where: { hospitalId: scopeId },
    });
  }

  return usage;
}

export async function getLimitSummaryForCurrentUser(): Promise<LimitSummary | null> {
  const resolved = await resolveTenantFromSession();

  // ✅ No tenant → no banner
  if (!resolved) return null;

  const { scope, scopeId } = resolved;
  const sub = await getActiveSubscription(scope, scopeId);

  const plan = (sub?.plan ?? "FREE") as SubscriptionPlan | "FREE";
  const status = (sub?.status ?? "INACTIVE") as LimitSummary["status"];

  const limits = await getPlanLimits(plan);
  const usage = await getUsage(scope, scopeId);

  const exceeded = {
    appointmentsPerMonth: isUnlimited(limits.appointmentsPerMonth)
      ? false
      : usage.appointmentsPerMonth >= (limits.appointmentsPerMonth ?? Infinity),
    patientsPerMonth: isUnlimited(limits.patientsPerMonth)
      ? false
      : usage.patientsPerMonth >= (limits.patientsPerMonth ?? Infinity),
    doctorsPerHospital: isUnlimited(limits.doctorsPerHospital)
      ? false
      : usage.doctorsPerHospital >= (limits.doctorsPerHospital ?? Infinity),
  };

  return {
    scope,
    scopeId,
    plan,
    status,
    limits,
    usage,
    exceeded,
    anyExceeded: Object.values(exceeded).some(Boolean),
  };
}
