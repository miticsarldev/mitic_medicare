// app/api/superadmin/doctors/[id]/verify/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Vérification de l'authentification et du rôle
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorId = params.id;
    const { isVerified } = await request.json();

    // Mise à jour du statut de vérification
    const updatedDoctor = await prisma.doctor.update({
      where: { userId: doctorId },
      data: { isVerified },
      select: {
        id: true,
        isVerified: true,
        licenseNumber: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/superadmin/users/doctors");

    return NextResponse.json({
      success: true,
      data: updatedDoctor,
      message: `Vérification ${isVerified ? "appliquée" : "retirée"} avec succès`,
    });
  } catch (error) {
    console.error("Error updating doctor verification:", error);
    return NextResponse.json(
      { error: "Failed to update doctor verification" },
      { status: 500 }
    );
  }
}
