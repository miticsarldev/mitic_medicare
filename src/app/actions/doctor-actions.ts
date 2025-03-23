"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { SubscriptionPlan, UserRole } from "@prisma/client";

export async function createDoctor(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password =
      (formData.get("password") as string) || "defaultPassword123";
    const specialty = formData.get("specialty") as string;
    const location = formData.get("location") as string;
    const status = formData.get("status") as string;
    const subscription = formData.get("subscription") as SubscriptionPlan;
    const licenseNumber = formData.get("licenseNumber") as string;
    const role = formData.get("role") as UserRole;
    const hospitalId = (formData.get("hospitalId") as string) || null;

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password, // In a real app, you would hash this password
        role: role,
        isActive: status === "active",
        emailVerified: new Date(),
        isApproved: true,
        profile: {
          create: {
            city: location,
          },
        },
      },
    });

    await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: specialty,
        hospitalId: hospitalId || null,
        licenseNumber: licenseNumber,
        isVerified: true,
        isIndependent: !hospitalId, // optionnel : déterminer automatiquement le type
        subscription: {
          create: {
            plan: subscription as SubscriptionPlan,
            startDate: new Date(),
            status: "ACTIVE",
            amount: 0,
            endDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
            subscriberType: "HOSPITAL",
          },
        },
      },
    });

    // In a real app, you would send an email here if sendEmail is true

    revalidatePath("/doctors");
    return { success: true, doctorId: user.id };
  } catch (error) {
    console.error("Error creating doctor:", error);
    return { error: "Failed to create doctor" };
  }
}

export async function updateDoctorStatus(doctorId: string, status: string) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    await prisma.user.update({
      where: {
        id: doctorId,
      },
      data: {
        isActive: status === "active",
      },
    });

    revalidatePath("/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error updating doctor status:", error);
    return { error: "Failed to update doctor status" };
  }
}

export async function updateDoctorVerification(
  doctorId: string,
  verified: boolean
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    await prisma.user.update({
      where: {
        id: doctorId,
      },
      data: {
        isApproved: verified,
      },
    });

    revalidatePath("/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error updating doctor verification:", error);
    return { error: "Failed to update doctor verification" };
  }
}

export async function bulkDeleteDoctors(doctorIds: string[]) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    // Delete users (will cascade to doctor records)
    await prisma.user.deleteMany({
      where: {
        id: {
          in: doctorIds,
        },
      },
    });

    revalidatePath("/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting doctors:", error);
    return { error: "Failed to delete doctors" };
  }
}

export async function bulkExportDoctors(doctorIds: string[]) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    // Get doctor data for export
    const doctors = await prisma.doctor.findMany({
      where: {
        user: {
          id: {
            in: doctorIds,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            profile: {
              select: {
                city: true,
              },
            },
          },
        },
        hospital: {
          select: {
            name: true,
            city: true,
            phone: true,
            state: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            payments: {
              select: {
                amount: true,
              },
            },
          },
        },
      },
    });

    // Format data for export
    const exportData = doctors.map((doctor) => ({
      id: doctor.user.id,
      name: doctor.user.name,
      email: doctor.user.email,
      phone: doctor.user.phone,
      specialty: doctor.specialization,
      location: doctor.user.profile?.city || "",
      status: doctor.user.isActive ? "active" : "inactive",
      verified: doctor.user.emailVerified ? "Yes" : "No",
      hospital: doctor.hospital?.name || "",
      subscription: doctor.subscription?.plan || "FREE",
      joinedAt: doctor.user.createdAt.toISOString(),
    }));

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting doctors:", error);
    return { error: "Failed to export doctors" };
  }
}

export async function assignDoctorToHospital(
  doctorId: string,
  hospitalId: string
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    const doctor = await prisma.doctor.findFirst({
      where: {
        user: {
          id: doctorId,
        },
      },
    });

    if (!doctor) {
      return { error: "Doctor not found" };
    }

    await prisma.doctor.update({
      where: {
        id: doctor.id,
      },
      data: {
        hospitalId,
      },
    });

    revalidatePath("/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error assigning doctor to hospital:", error);
    return { error: "Failed to assign doctor to hospital" };
  }
}
