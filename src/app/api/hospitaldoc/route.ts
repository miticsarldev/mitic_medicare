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

    const doctorId = session.user.id;
    // const doctor = await prisma.doctor.findUnique({
    //   where: { id: doctorId }
    // });
    // if (!doctor) {
    //   return NextResponse.json({ error: "Données reserver aux médecin" }, { status: 403 });
    // }

    const today = new Date();
    
    // Correction des dates
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Requêtes de base
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

    // Correction de la requête hebdomadaire
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyPatientsData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date, 
        COUNT(*)::integer as count
      FROM "Appointment"
      WHERE "createdAt" >= ${sevenDaysAgo}
        AND "doctorId" = ${doctorId}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `;

    // Formatage des données hebdomadaires
    const weeklyPatients = (weeklyPatientsData as Array<{ date: Date, count: number }>).map(item => ({
      date: item.date.toISOString().split('T')[0],
      count: item.count
    }));

    //  les rendez-vous en attente 
    const pendingAppointmentsList = await prisma.appointment.findMany({
      where: { doctorId: doctorId, status: "PENDING" },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true }  
            }
          }
        }
      },
      orderBy: { scheduledAt: "asc" }
    });
    
       // Récupérer les avis du médecin, uniquement ceux approuvés
    const reviews = await prisma.doctorReview.findMany({
      where: {
        doctorId: doctorId,
        isApproved: true,  
      },
      include: {
        patient: {
          include: {
            user: { select: { name: true } } 
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      patientsToday,
      confirmedAppointments,
      pendingAppointments,
      weeklyPatients,
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
        createdAt: review.createdAt,
      })),
    });


  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
