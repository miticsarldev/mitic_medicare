export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma, UserGenre } from "@prisma/client";

const DEFAULT_PAGE_SIZE = 10;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(
      searchParams.get("pageSize") || DEFAULT_PAGE_SIZE.toString(),
      10
    );
    const nameFilter = searchParams.get("name") || undefined;
    const genderFilter = searchParams.get("gender") || undefined;
    const minAppointmentsFilter = searchParams.get("minAppointments");
    const minAppointments = minAppointmentsFilter
      ? parseInt(minAppointmentsFilter)
      : undefined;

    if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    if (
      minAppointmentsFilter &&
      (minAppointments === undefined || isNaN(minAppointments))
    ) {
      return NextResponse.json(
        { error: "Invalid minimum appointments parameter" },
        { status: 400 }
      );
    }

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

    const hospitalId = hospital.id;

    // Étape 1 : patients ayant au moins X rendez-vous dans cet hôpital
    let filteredPatientIds: string[] | undefined = undefined;
    if (minAppointments) {
      const grouped = await prisma.appointment.groupBy({
        by: ["patientId"],
        where: {
          hospitalId,
        },
        _count: {
          patientId: true,
        },
        having: {
          patientId: {
            _count: {
              gte: minAppointments,
            },
          },
        },
      });

      filteredPatientIds = grouped.map((g) => g.patientId);
      if (filteredPatientIds.length === 0) {
        return NextResponse.json({
          patients: [],
          pagination: {
            currentPage: page,
            pageSize,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      }
    }

    // Étape 2 : construction des conditions de recherche
    const whereConditions: Prisma.PatientWhereInput = {
      appointments: {
        some: {
          hospitalId,
        },
      },
    };

    if (filteredPatientIds) {
      whereConditions.id = { in: filteredPatientIds };
    }

    if (nameFilter || genderFilter) {
      whereConditions.user = {};
    }

    if (nameFilter) {
      whereConditions.user!.name = {
        contains: nameFilter,
        mode: "insensitive",
      };
    }

    if (genderFilter) {
      whereConditions.user!.profile = {
        genre: UserGenre[genderFilter as keyof typeof UserGenre],
      };
    }

    const skip = (page - 1) * pageSize;

    const [patientsWithAppointments, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where: whereConditions,
        skip,
        take: pageSize,
        select: {
          id: true,
          allergies: true,
          medicalNotes: true,
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              profile: {
                select: {
                  genre: true,
                  address: true,
                  city: true,
                  state: true,
                  zipCode: true,
                },
              },
            },
          },
          appointments: {
            where: { hospitalId },
            orderBy: { scheduledAt: "desc" },
            select: {
              id: true,
              scheduledAt: true,
              status: true,
              reason: true,
              doctor: {
                select: {
                  id: true,
                  specialization: true,
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          medicalRecords: {
            where: { hospitalId },
            select: {
              id: true,
              diagnosis: true,
              treatment: true,
              createdAt: true,
            },
          },
          medicalHistories: {
            select: {
              id: true,
              title: true,
              condition: true,
              diagnosedDate: true,
              status: true,
              details: true,
              doctor: {
                select: {
                  id: true,
                  specialization: true,
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
      prisma.patient.count({
        where: whereConditions,
      }),
    ]);

    const patientsFormatted = patientsWithAppointments.map((patient) => {
      const appointments = patient.appointments.map((appt) => ({
        id: appt.id,
        scheduledAt: appt.scheduledAt,
        status: appt.status,
        reason: appt.reason,
        doctor: {
          id: appt.doctor.id,
          name: appt.doctor.user.name,
          email: appt.doctor.user.email,
          specialty: appt.doctor.specialization,
        },
      }));

      const lastAppointment = appointments[0];

      return {
        id: patient.id,
        name: patient.user.name,
        gender: patient.user.profile?.genre || "Non précisé",
        email: patient.user.email,
        phone: patient.user.phone,
        address: patient.user.profile?.address || null,
        city: patient.user.profile?.city || null,
        state: patient.user.profile?.state || null,
        zipCode: patient.user.profile?.zipCode || null,
        numberOfMedicalRecords: patient.medicalRecords.length,
        numberOfAppointments: appointments.length,
        lastAppointment: lastAppointment?.scheduledAt || null,
        appointments,
        medicalRecords: patient.medicalRecords,
        medicalHistories: patient.medicalHistories.map((history) => ({
          id: history.id,
          title: history.title,
          condition: history.condition,
          diagnosedDate: history.diagnosedDate,
          status: history.status,
          details: history.details,
          doctor: history.doctor
            ? {
                id: history.doctor.id,
                name: history.doctor.user.name,
                email: history.doctor.user.email,
                specialty: history.doctor.specialization,
              }
            : null,
          createdAt: history.createdAt,
          updatedAt: history.updatedAt,
        })),
        healthStatus: {
          allergies: patient.allergies || null,
          notes: patient.medicalNotes || null,
        },
      };
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      patients: patientsFormatted,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients with appointments" },
      { status: 500 }
    );
  }
}
