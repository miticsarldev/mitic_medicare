"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { HospitalStatus } from "@prisma/client";

export async function createHospital(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    const adminId = formData.get("adminId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const country = formData.get("country") as string;
    const status = formData.get("status") as HospitalStatus;
    const verified = formData.get("verified") === "on";
    const description = formData.get("description") as string;

    // Create hospital
    const hospital = await prisma.hospital.create({
      data: {
        name,
        email,
        phone,
        address,
        city,
        state,
        country,
        status,
        isVerified: verified,
        description,
        adminId,
      },
    });

    revalidatePath("/hospitals");
    return { success: true, hospitalId: hospital.id };
  } catch (error) {
    console.error("Error creating hospital:", error);
    return { error: "Failed to create hospital" };
  }
}

export async function updateHospitalStatus(id: string, status: HospitalStatus) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN")
      return { error: "Unauthorized" };

    await prisma.hospital.update({ where: { id }, data: { status } });
    revalidatePath("/dashboard/superadmin/users/hospitals");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update hospital status" };
  }
}

export async function updateHospitalVerification(
  id: string,
  verified: boolean
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN")
      return { error: "Unauthorized" };

    await prisma.hospital.update({
      where: { id },
      data: { isVerified: verified },
    });
    revalidatePath("/dashboard/superadmin/users/hospitals");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update hospital verification" };
  }
}

export async function bulkDeleteHospitals(ids: string[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN")
      return { error: "Unauthorized" };

    await prisma.hospital.deleteMany({ where: { id: { in: ids } } });
    revalidatePath("/dashboard/superadmin/users/hospitals");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete hospitals" };
  }
}

export async function bulkExportHospitals(ids: string[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN")
      return { error: "Unauthorized" };

    const data = await prisma.hospital.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        status: true,
        isVerified: true,
        createdAt: true,
        subscription: { select: { plan: true } },
      },
    });

    return {
      success: true,
      data: data.map((h) => ({
        id: h.id,
        name: h.name,
        email: h.email,
        phone: h.phone,
        city: h.city,
        country: h.country,
        status: h.status,
        verified: h.isVerified,
        subscription: h.subscription?.plan ?? "FREE",
        createdAt: h.createdAt.toISOString(),
      })),
    };
  } catch (e) {
    console.error(e);
    return { error: "Failed to export hospitals" };
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

    await prisma.doctor.update({
      where: {
        id: doctorId,
      },
      data: {
        hospitalId,
      },
    });

    revalidatePath("/dashboard/superadmin/users/hospitals");
    return { success: true };
  } catch (error) {
    console.error("Error assigning doctor to hospital:", error);
    return { error: "Failed to assign doctor to hospital" };
  }
}

export async function removeDoctorFromHospital(doctorId: string) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    await prisma.doctor.update({
      where: {
        id: doctorId,
      },
      data: {
        hospitalId: null,
      },
    });

    revalidatePath("/dashboard/superadmin/users/hospitals");
    return { success: true };
  } catch (error) {
    console.error("Error removing doctor from hospital:", error);
    return { error: "Failed to remove doctor from hospital" };
  }
}
