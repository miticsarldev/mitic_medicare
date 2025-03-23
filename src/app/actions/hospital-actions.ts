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
    const zipCode = formData.get("zipCode") as string;
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
        zipCode,
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

export async function updateHospitalStatus(
  hospitalId: string,
  status: HospitalStatus
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    await prisma.hospital.update({
      where: {
        id: hospitalId,
      },
      data: {
        status,
      },
    });

    revalidatePath("/hospitals");
    return { success: true };
  } catch (error) {
    console.error("Error updating hospital status:", error);
    return { error: "Failed to update hospital status" };
  }
}

export async function updateHospitalVerification(
  hospitalId: string,
  verified: boolean
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    await prisma.hospital.update({
      where: {
        id: hospitalId,
      },
      data: {
        isVerified: verified,
      },
    });

    revalidatePath("/hospitals");
    return { success: true };
  } catch (error) {
    console.error("Error updating hospital verification:", error);
    return { error: "Failed to update hospital verification" };
  }
}

export async function bulkDeleteHospitals(hospitalIds: string[]) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    // Delete hospitals
    await prisma.hospital.deleteMany({
      where: {
        id: {
          in: hospitalIds,
        },
      },
    });

    revalidatePath("/hospitals");
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting hospitals:", error);
    return { error: "Failed to delete hospitals" };
  }
}

export async function bulkExportHospitals(hospitalIds: string[]) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    // Get hospital data for export
    const hospitals = await prisma.hospital.findMany({
      where: {
        id: {
          in: hospitalIds,
        },
      },
      include: {
        _count: {
          select: {
            doctors: true,
          },
        },
      },
    });

    // Format data for export
    const exportData = hospitals.map((hospital) => ({
      id: hospital.id,
      name: hospital.name,
      email: hospital.email,
      phone: hospital.phone,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      zipCode: hospital.zipCode,
      country: hospital.country,
      status: hospital.status,
      verified: hospital.isVerified ? "Yes" : "No",
      doctorsCount: hospital._count.doctors,
      createdAt: hospital.createdAt.toISOString(),
    }));

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting hospitals:", error);
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

    revalidatePath("/hospitals");
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

    revalidatePath("/hospitals");
    return { success: true };
  } catch (error) {
    console.error("Error removing doctor from hospital:", error);
    return { error: "Failed to remove doctor from hospital" };
  }
}
