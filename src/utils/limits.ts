// lib/limits.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
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

function isUnlimited(v: number | null | undefined) {
  return v === null || v === undefined;
}

// Resolve tenant from session
export async function resolveTenantFromSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { doctor: { include: { hospital: true } }, hospital: true },
  });
  if (!user) throw new Error("Unauthorized");

  if (user.role === UserRole.INDEPENDENT_DOCTOR && user.doctor?.isIndependent) {
    return { scope: "DOCTOR" as const, scopeId: user.doctor.id };
  }
  if (user.role === UserRole.HOSPITAL_ADMIN && user.hospital) {
    return { scope: "HOSPITAL" as const, scopeId: user.hospital.id };
  }
  if (user.role === UserRole.HOSPITAL_DOCTOR && user.doctor?.hospitalId) {
    return { scope: "HOSPITAL" as const, scopeId: user.doctor.hospitalId };
  }

  throw new Error("No subscription scope for this user");
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

// Map PlanLimits -> banner keys
export async function getPlanLimits(plan: string) {
  const cfg = await prisma.planConfig.findUnique({
    where: { code: plan as SubscriptionPlan },
    include: { limits: true },
  });

  const dict: Record<LimitKey, number | null> = {
    appointmentsPerMonth: cfg?.limits?.maxAppointments ?? null,
    patientsPerMonth: cfg?.limits?.maxPatients ?? null,
    doctorsPerHospital: cfg?.limits?.maxDoctorsPerHospital ?? null,
  };
  return dict;
}

// Compute usage for current month
export async function getUsage(scope: "DOCTOR" | "HOSPITAL", scopeId: string) {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const usage: Record<LimitKey, number> = {
    appointmentsPerMonth: 0,
    patientsPerMonth: 0,
    doctorsPerHospital: 0,
  };

  if (scope === "DOCTOR") {
    usage.appointmentsPerMonth = await prisma.appointment.count({
      where: {
        doctorId: scopeId,
        scheduledAt: { gte: monthStart, lte: monthEnd },
      },
    });
    const patientAgg = await prisma.appointment.findMany({
      where: {
        doctorId: scopeId,
        scheduledAt: { gte: monthStart, lte: monthEnd },
      },
      select: { patientId: true },
      distinct: ["patientId"],
    });
    usage.patientsPerMonth = patientAgg.length;
  } else {
    usage.appointmentsPerMonth = await prisma.appointment.count({
      where: {
        OR: [{ hospitalId: scopeId }, { doctor: { hospitalId: scopeId } }],
        scheduledAt: { gte: monthStart, lte: monthEnd },
      },
    });
    const patientAgg = await prisma.appointment.findMany({
      where: {
        OR: [{ hospitalId: scopeId }, { doctor: { hospitalId: scopeId } }],
        scheduledAt: { gte: monthStart, lte: monthEnd },
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

export async function getLimitSummaryForCurrentUser(): Promise<LimitSummary> {
  const { scope, scopeId } = await resolveTenantFromSession();
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

// Optional: throw when blocked
export class PlanLimitExceededError extends Error {
  code = "PLAN_LIMIT_EXCEEDED";
  limitKey: LimitKey;
  constructor(message: string, limitKey: LimitKey) {
    super(message);
    this.limitKey = limitKey;
    Object.setPrototypeOf(this, PlanLimitExceededError.prototype);
  }
}

export async function assertWithinLimit(
  key: LimitKey,
  opts?: { message?: string }
) {
  const summary = await getLimitSummaryForCurrentUser();
  if (summary.exceeded[key]) {
    throw new PlanLimitExceededError(
      opts?.message ??
        "Votre limite de forfait est atteinte. Veuillez mettre à niveau votre plan pour continuer.",
      key
    );
  }
  return summary;
}
