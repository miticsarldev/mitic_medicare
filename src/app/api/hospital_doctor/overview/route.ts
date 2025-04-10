import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctor) {
      return NextResponse.json({ message: "Médecin non trouvé" }, { status: 404 });
    }

    const doctorId = doctor.id;
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    
    const [patientsToday, confirmedAppointments, pendingAppointments] = await Promise.all([
      prisma.appointment.count({
        where: {
          doctorId: doctorId,
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      }),
      prisma.appointment.count({
        where: { doctorId: doctorId, status: "COMPLETED" }
      }),
      prisma.appointment.count({
        where: { doctorId: doctorId, status: "PENDING" }
      })
    ]);

    // Dates pour la semaine en cours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);


    const allDaysOfWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    const dailyAppointmentsData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "scheduledAt") as day,
        COUNT(*)::integer as count
      FROM "Appointment"
      WHERE "scheduledAt" >= ${sevenDaysAgo}
        AND "scheduledAt" <= ${endOfDay}
        AND "doctorId" = ${doctorId}
      GROUP BY DATE_TRUNC('day', "scheduledAt")
      ORDER BY day ASC
    `;

    
    const appointmentsByDay = (dailyAppointmentsData as Array<{ day: Date, count: number }>)
      .reduce((acc, item) => {
        const dayStr = item.day.toISOString().split('T')[0];
        acc[dayStr] = item.count;
        return acc;
      }, {} as Record<string, number>);

    const dailyAppointments = allDaysOfWeek.map(day => ({
      day,
      count: appointmentsByDay[day] || 0
    }));

    // Données hebdomadaires (patients)
    const weeklyPatientsData = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('day', "scheduledAt") as date, 
      COUNT(*)::integer as count
    FROM "Appointment"
    WHERE "scheduledAt" >= ${sevenDaysAgo}
      AND "scheduledAt" <= ${endOfDay}
      AND "doctorId" = ${doctorId}
    GROUP BY DATE_TRUNC('day', "scheduledAt")
    ORDER BY date ASC
  `;


    const weeklyPatients = (weeklyPatientsData as Array<{ date: Date, count: number }>).map(item => ({
      date: item.date.toISOString().split('T')[0],
      count: item.count
    }));

    // Rendez-vous en attente
    const pendingAppointmentsList = await prisma.appointment.findMany({
      where: { doctorId: doctorId, status: "PENDING" },
      include: {
        patient: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { scheduledAt: "asc" }
    });

    // Avis du médecin
    const reviews = await prisma.doctorReview.findMany({
      where: { doctorId: doctorId, isApproved: true },
      include: {
        patient: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

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
      patientsToday,
      confirmedAppointments,
      pendingAppointments,
      weeklyPatients,
      dailyAppointments,
      pendingAppointmentsList: pendingAppointmentsList.map(app => ({
        id: app.id,
        patient: app.patient.user.name,
        date: app.scheduledAt.toISOString().split('T')[0],
        time: app.scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })),
      reviews: reviews.map(review => ({
        id: review.id,
        patient: review.isAnonymous ? "Anonyme" : review.patient.user.name,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      })),
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