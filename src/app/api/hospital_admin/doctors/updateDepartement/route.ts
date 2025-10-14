// File: app/api/doctors/department/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface UpdatePayload {
  doctorId: string;
  departmentId: string | null;
}

export async function PATCH(request: NextRequest) {
  try {
    // Récupérer la session et vérifier le rôle
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer l'hôpital de l'admin
    const hospital = await prisma.hospital.findUnique({
      where: { adminId: session.user.id },
      select: { id: true },
    });
    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    // Parser le body
    const { doctorId, departmentId }: UpdatePayload = await request.json();
    if (!doctorId) {
      return NextResponse.json({ error: "Missing doctorId" }, { status: 400 });
    }

    // Vérifier que le médecin existe et appartient à l'hôpital
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { hospitalId: true },
    });
    if (!doctor || doctor.hospitalId !== hospital.id) {
      return NextResponse.json(
        { error: "Doctor not found in this hospital" },
        { status: 404 }
      );
    }

    // Si departmentId non null, vérifier que le département appartient à l'hôpital
    if (departmentId) {
      const dept = await prisma.department.findUnique({
        where: { id: departmentId },
        select: { hospitalId: true },
      });
      if (!dept || dept.hospitalId !== hospital.id) {
        return NextResponse.json(
          { error: "Department not found in this hospital" },
          { status: 404 }
        );
      }
    }

    // Mettre à jour l'attribution de département
    const updated = await prisma.doctor.update({
      where: { id: doctorId },
      data: { departmentId },
      select: {
        id: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ doctor: updated });
  } catch (error) {
    console.error("Error updating doctor's department:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}
