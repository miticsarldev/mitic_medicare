import prisma from "@/lib/prisma";
import { getAllPlansWithStats } from "@/app/actions/plan-config-actions";
import SubscriptionsClient from "./subscriptions-client";

export default async function SubscriptionsPage() {
  const [plans, doctorSubs, hospitalSubs] = await Promise.all([
    getAllPlansWithStats(),
    prisma.subscription.findMany({
      where: { doctorId: { not: null } },
      include: {
        doctor: { include: { user: true } },
        payments: { orderBy: { paymentDate: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.subscription.findMany({
      where: { hospitalId: { not: null } },
      include: {
        hospital: true,
        payments: { orderBy: { paymentDate: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  console.log("Fetched subscriptions:", {
    doctorSubsCount: doctorSubs,
    hospitalSubsCount: hospitalSubs,
  });

  return (
    <SubscriptionsClient
      plans={plans}
      doctorSubs={doctorSubs
        .filter((sub) => sub.doctor !== null)
        .map((sub) => ({
          ...sub,
          doctor: sub.doctor!,
          payments: sub.payments || [],
          _type: "DOCTOR" as const,
        }))}
      hospitalSubs={hospitalSubs
        .filter((sub) => sub.hospital !== null)
        .map((sub) => ({
          ...sub,
          hospital: sub.hospital!,
          payments: sub.payments || [],
          _type: "HOSPITAL" as const,
        }))}
    />
  );
}
