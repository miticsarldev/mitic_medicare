import prisma from "@/lib/prisma";
import { getAllPlansWithStats } from "@/app/actions/plan-config-actions";
import SubscriptionsClient from "./subscriptions-client";

export default async function SubscriptionsPage() {
  const [plans, doctorSubs, hospitalSubs] = await Promise.all([
    getAllPlansWithStats(), // includes config & limits in cfg
    prisma.subscription.findMany({
      where: { doctorId: { not: null } },
      include: { doctor: { include: { user: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.subscription.findMany({
      where: { hospitalId: { not: null } },
      include: { hospital: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <SubscriptionsClient
      plans={plans}
      doctorSubs={doctorSubs
        .filter((sub) => sub.doctor !== null)
        .map((sub) => ({ ...sub, doctor: sub.doctor!, _type: "DOCTOR" }))}
      hospitalSubs={hospitalSubs
        .filter((sub) => sub.hospital !== null)
        .map((sub) => ({ ...sub, hospital: sub.hospital!, _type: "HOSPITAL" }))}
    />
  );
}
