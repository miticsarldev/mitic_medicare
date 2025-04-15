// app/api/hospital_doctor/hospital/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Trouver l'hôpital associé à l'utilisateur (admin ou docteur)
    const hospital = await prisma.hospital.findFirst({
      where: {
        OR: [
          { adminId: session.user.id },
          { doctors: { some: { userId: session.user.id } } }
        ]
      },
      include: {
        departments: {
          select: {
            name: true,
            description: true,
            doctors: {
              select: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            doctors: true,
            appointments: true
          }
        }
      }
    });

    if (!hospital) {
      return NextResponse.json({ message: "Hôpital non trouvé" }, { status: 404 });
    }

     const doctor = await prisma.doctor.findUnique({
          where: { userId: session.user.id },
          include: {
            user: {
              select: {
                name: true
              }
            },
            hospital: {
              select: {
                name: true
              }
            },
            department: {
              select: {
                name: true
              }
            },
            availabilities: {
              where: { isActive: true },
              orderBy: { dayOfWeek: 'asc' }
            },
            appointments: {
              where: {
                status: { in: ['PENDING', 'CONFIRMED'] },
                scheduledAt: { gte: new Date() }
              },
              select: {
                id: true,
                scheduledAt: true,
                startTime: true,
                endTime: true,
                status: true,
                patient: {
                  select: {
                    user: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              },
              orderBy: { scheduledAt: 'asc' }
            }
          }
        });
    
        if (!doctor) {
          return NextResponse.json({ message: "Médecin non trouvé" }, { status: 404 });
        }

    // Formater la réponse
    const response = {
      id: hospital.id,
      name: hospital.name,
      description: hospital.description,
      address: `${hospital.address}, ${hospital.city}, ${hospital.country}`,
      phone: hospital.phone,
      email: hospital.email,
      website: hospital.website,
      logoUrl: hospital.logoUrl,
      stats: {
        doctors: hospital._count.doctors,
        appointments: hospital._count.appointments,
        departments: hospital.departments.length
      },
      departments: hospital.departments.map(dept => ({
        name: dept.name,
        description: dept.description,
        doctorsCount: dept.doctors.length
      })),

      doctor: {
        id: doctor.id,
        name: doctor.user.name,
        hospital: doctor.hospital?.name,
        department: doctor.department?.name,
        specialization: doctor.specialization,
        availabilities: doctor.availabilities,
        appointments: doctor.appointments
      }
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
} 
