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
    const { isActive } = await request.json();

    // Mise à jour du statut
    const updatedDoctor = await prisma.user.update({
      where: { id: doctorId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        doctor: {
          select: {
            specialization: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/superadmin/users/doctors");

    return NextResponse.json({
      success: true,
      data: updatedDoctor,
      message: `Médecin ${isActive ? "activé" : "désactivé"} avec succès`,
    });
  } catch (error) {
    console.error("Error updating doctor status:", error);
    return NextResponse.json(
      { error: "Failed to update doctor status" },
      { status: 500 }
    );
  }
}
