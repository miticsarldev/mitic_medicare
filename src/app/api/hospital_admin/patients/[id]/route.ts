import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            profile: {
              select: {
                address: true,
                city: true,
                state: true,
                zipCode: true,
                country: true,
                avatarUrl: true,
                genre: true,
                bio: true,
              },
            },
          },
        },
        appointments: {
          select: {
            id: true,
            scheduledAt: true,
            startTime: true,
            endTime: true,
            status: true,
            type: true,
            reason: true,
            notes: true,
            completedAt: true,
            cancelledAt: true,
            cancellationReason: true,
            createdAt: true,
            updatedAt: true,
            doctor: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            hospital: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        medicalHistories: true,
        medicalRecords: true,
        prescriptions: true,
        vitalSigns: true,
        reviews: {
          include: {
            doctor: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json({ patient })
  } catch (error) {
    console.error("Erreur lors de la récupération du patient :", error)
    return NextResponse.json(
      { error: "Échec lors de la récupération des données du patient" },
      { status: 500 }
    )
  }
}
