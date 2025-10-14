"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { PendingApprovalUser } from "./types";
import { sendApprovingEmail } from "@/lib/email";
import { addMonths } from "date-fns";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

export async function getPendingApprovals(): Promise<PendingApprovalUser[]> {
  try {
    const users = await prisma.user.findMany({
      where: {
        emailVerified: { not: null },
        isApproved: false,
        role: {
          in: ["HOSPITAL_ADMIN", "INDEPENDENT_DOCTOR"],
        },
      },
      include: {
        profile: true,
        doctor: true,
        hospital: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      profile: user.profile,
      doctor: user.doctor
        ? {
            ...user.doctor,
            consultationFee: user.doctor.consultationFee
              ? user.doctor.consultationFee.toNumber()
              : null,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              emailVerified: user.emailVerified,
              isApproved: user.isApproved,
              isActive: user.isActive,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
              profile: user.profile
                ? {
                    address: user.profile.address || undefined,
                    city: user.profile.city || undefined,
                    state: user.profile.state || undefined,
                    zipCode: user.profile.zipCode || undefined,
                    country: user.profile.country || undefined,
                    bio: user.profile.bio || undefined,
                    avatarUrl: user.profile.avatarUrl || undefined,
                    genre: user.profile.genre || undefined,
                    createdAt: user.profile.createdAt,
                    updatedAt: user.profile.updatedAt,
                  }
                : undefined,
            },
          }
        : null,
      hospital: user.hospital,
    }));
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    throw new Error("Failed to fetch pending approvals");
  }
}

export async function approveUser(user: PendingApprovalUser): Promise<void> {
  ///
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { isApproved: true },
    });

    const now = new Date();
    const periodStart = now;
    const periodEnd = addMonths(now, 1);

    // should check for role
    // Assign Free Subscription to Patient (If not already assigned)
    if (user.role === "INDEPENDENT_DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: user?.id },
      });

      const existingSubscription = await prisma.subscription.findFirst({
        where: { doctorId: doctor?.id, subscriberType: "DOCTOR" },
      });

      if (!existingSubscription && doctor) {
        await prisma.subscription.create({
          data: {
            doctorId: doctor?.id,
            subscriberType: "DOCTOR",
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.ACTIVE,
            amount: 0,
            startDate: periodStart,
            endDate: periodEnd,
          },
        });
      }
    } else if (user.role === "HOSPITAL_ADMIN") {
      // Find the hospital associated with this admin
      const hospital = await prisma.hospital.findUnique({
        where: { adminId: user.id },
      });

      if (hospital) {
        const existingSubscription = await prisma.subscription.findFirst({
          where: {
            hospitalId: hospital.id,
            subscriberType: "HOSPITAL",
          },
        });

        if (!existingSubscription) {
          await prisma.subscription.create({
            data: {
              hospitalId: hospital.id,
              subscriberType: "HOSPITAL",
              plan: SubscriptionPlan.FREE,
              status: SubscriptionStatus.ACTIVE,
              amount: 0,
              startDate: periodStart,
              endDate: periodEnd,
            },
          });
        }
      }
    }

    await sendApprovingEmail(
      user.name,
      user.email,
      user.role,
      user.hospital?.name ?? "Hopital"
    );

    revalidatePath("/dashboard/superadmin/verifications/all");
    revalidatePath("/dashboard/superadmin/overview");
  } catch (error) {
    console.error("Error approving user:", error);
    throw new Error("Failed to approve user");
  }
}

export async function rejectUser(userId: string): Promise<void> {
  try {
    // Option 1: Delete the user
    // await prisma.user.delete({
    //   where: { id: userId },
    // });

    // Option 2: Mark as rejected (requires schema update)
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        // If you add a status field to your schema, you could use:
        // status: "REJECTED",
      },
    });

    revalidatePath("/admin/verification");
  } catch (error) {
    console.error("Error rejecting user:", error);
    throw new Error("Failed to reject user");
  }
}
