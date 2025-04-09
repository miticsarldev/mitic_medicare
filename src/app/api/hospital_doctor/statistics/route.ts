import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Médecin non trouvé" }, { status: 404 });
    }

    const doctorId = doctor.id;

    const url = new URL(req.url);
    const filter = url.searchParams.get("filter") || "semaine";

    let dateFilter: Date;

    switch (filter) {
      case "jour":
        dateFilter = new Date();
        dateFilter.setHours(0, 0, 0, 0);
        break;
      case "semaine":
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case "mois":
        dateFilter = new Date();
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      case "année":
        dateFilter = new Date();
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
      default:
        return NextResponse.json({ error: "Filtre invalide" }, { status: 400 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: "COMPLETED",
        scheduledAt: {
          gte: dateFilter,
        },
      },
      select: {
        patientId: true,
      },
    });

    const uniquePatients = new Set(appointments.map((appt) => appt.patientId)).size;

    const cancellations = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: "CANCELED",
        scheduledAt: { gte: dateFilter },
      },
      select: {
        cancellationReason: true,
      },
    });

    const totalCancellations = cancellations.length;
    const reasonCounts = {
      Urgence: 0,
      "Changement d'horaire": 0,
      Autres: 0,
    };

    cancellations.forEach((appointment) => {
      const reason = appointment.cancellationReason?.trim().toLowerCase();
      if (reason === "urgence") {
        reasonCounts.Urgence++;
      } else if (reason === "changement d'horaire") {
        reasonCounts["Changement d'horaire"]++;
      } else {
        reasonCounts.Autres++;
      }
    });

    // Rendez-vous par types
    const appointmentsByType = await prisma.appointment.groupBy({
      by: ["type"],
      where: {
        doctorId,
        status: "COMPLETED",
        scheduledAt: {
          gte: dateFilter,
        },
      },
      _count: {
        type: true,
      },
    });

    const appointmentTypeStats = appointmentsByType.map((item) => ({
      type: item.type || "Non spécifié",
      count: item._count.type,
    }));

    return NextResponse.json({
      filter,
      patientsSeen: uniquePatients,
      totalCancellations,
      cancellationsByReason: [
        { reason: "Urgence", count: reasonCounts.Urgence },
        { reason: "Changement d'horaire", count: reasonCounts["Changement d'horaire"] },
        { reason: "Autres", count: reasonCounts.Autres },
      ],
      appointmentTypeStats,
    });

  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
