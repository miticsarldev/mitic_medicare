import prisma from "@/lib/prisma";
import { resolveTenantFromSession } from "@/lib/limits";
import { computeEffectiveStatus } from "@/lib/subscription";

export async function requireActiveSubscriptionOrThrow() {
  const tenant = await resolveTenantFromSession();
  if (!tenant) return; // no gating for non-tenant roles

  const where =
    tenant.scope === "HOSPITAL"
      ? { hospitalId: tenant.scopeId }
      : { doctorId: tenant.scopeId };
  const sub = await prisma.subscription.findFirst({
    where,
    orderBy: { updatedAt: "desc" },
  });

  const effective = computeEffectiveStatus(sub);
  if (effective !== "ACTIVE" && effective !== "TRIAL") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err: any = new Error("Subscription required");
    err.code = 402; // Payment Required
    throw err;
  }
}
