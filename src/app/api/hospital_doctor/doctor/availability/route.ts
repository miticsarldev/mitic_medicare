import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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

    const body = await request.json();
    const { days, startTime, endTime, slotDuration, specificDates, isRecurring } = body;

    // Validation des données
    if (!startTime || !endTime) {
      return NextResponse.json(
        { message: 'Les heures de début et fin sont requises' },
        { status: 400 }
      );
    }

    if (isRecurring) {
      if (!days || days.length === 0) {
        return NextResponse.json(
          { message: 'Veuillez sélectionner au moins un jour pour les créneaux récurrents' },
          { status: 400 }
        );
      }

      // Vérifier que les jours sélectionnés font partie des disponibilités du médecin
      const doctorAvailabilities = await prisma.doctorAvailability.findMany({
        where: { 
          doctorId: doctor.id,
          dayOfWeek: { in: days },
          isActive: true
        }
      });

      if (doctorAvailabilities.length !== days.length) {
        return NextResponse.json(
          { message: 'Certains jours sélectionnés ne font pas partie de vos disponibilités' },
          { status: 400 }
        );
      }

      // Enregistrer les créneaux (simplifié pour l'exemple)
      // Dans une vraie application, vous voudrez probablement une table séparée pour les créneaux
      await Promise.all(days.map(async (dayOfWeek: number) => {
        await prisma.doctorAvailability.updateMany({
          where: {
            doctorId: doctor.id,
            dayOfWeek
          },
          data: {
            startTime,
            endTime,
            // Vous pourriez stocker la durée dans un champ existant ou une table séparée
          }
        });
      }));
    } else {
      if (!specificDates || specificDates.length === 0) {
        return NextResponse.json(
          { message: 'Veuillez sélectionner au moins une date pour les créneaux spécifiques' },
          { status: 400 }
        );
      }

      // Pour les dates spécifiques, vérifier que le jour de la semaine est disponible
      const dateDays = specificDates.map((dateStr: string) => new Date(dateStr).getDay());
      const doctorAvailabilities = await prisma.doctorAvailability.findMany({
        where: { 
          doctorId: doctor.id,
          dayOfWeek: { in: dateDays },
          isActive: true
        }
      });

      if (doctorAvailabilities.length !== dateDays.length) {
        return NextResponse.json(
          { message: 'Certaines dates sélectionnées ne font pas partie de vos jours de disponibilité' },
          { status: 400 }
        );
      }

      // Enregistrer les créneaux spécifiques
      // Solution simplifiée - dans la réalité, utilisez une table séparée
      await Promise.all(specificDates.map(async (dateStr: string) => {
        const date = new Date(dateStr);
        await prisma.doctorAvailability.create({
          data: {
            doctorId: doctor.id,
            dayOfWeek: date.getDay(),
            startTime,
            endTime,
            isActive: true,
            // Vous pourriez ajouter un champ pour marquer que c'est un créneau spécifique
          }
        });
      }));
    }

    return NextResponse.json({ 
      success: true,
      message: 'Créneaux enregistrés avec succès'
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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

    const availabilities = await prisma.doctorAvailability.findMany({
      where: { 
        doctorId: doctor.id,
        isActive: true 
      },
    });

    return NextResponse.json(availabilities);
  } catch (error) {
    console.error('Error fetching doctor availabilities:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des disponibilités' },
      { status: 500 }
    );
  }
}