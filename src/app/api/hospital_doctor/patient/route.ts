export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctor) {
      return NextResponse.json(
        { message: "Médecin non trouvé" },
        { status: 404 }
      );
    }

    const doctorId = doctor.id;

    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        hospital: true,
      },
    });

    const formattedAppointments = appointments.map((appointment) => {
      const { patient, hospital } = appointment;
      const age = patient.user?.dateOfBirth
        ? new Date().getFullYear() -
          new Date(patient.user.dateOfBirth).getFullYear()
        : "Inconnu";

      return {
        id: appointment.id,
        patientName: patient.user.name,
        patientEmail: patient.user.email,
        patientPhone: patient.user.phone,
        age: age,
        bloodType: patient.bloodType || "Inconnu",
        hospitalName: hospital ? hospital.name : "Non renseigné",
        hospitalLocation: hospital ? hospital.address : "Non renseigné",
        scheduledAt: appointment.scheduledAt,
        status: appointment.status,
        type: appointment.type || "Non spécifié",
        reason: appointment.reason || "Non spécifié",
        notes: appointment.notes || "Aucune note",
      };
    });

    return NextResponse.json(formattedAppointments, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
