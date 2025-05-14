export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const doctorName = searchParams.get('doctor') || '';
    const patientName = searchParams.get('patient') || '';

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

    // Construction sécurisée du whereClause
    const baseWhere: Prisma.MedicalRecordWhereInput = {
      hospitalId: hospital.id
    };

    const patientFilter: Prisma.MedicalRecordWhereInput = patientName ? {
      patient: {
        user: {
          name: {
            contains: patientName,
            mode: 'insensitive'
          }
        }
      }
    } : {};

    const doctorFilter: Prisma.MedicalRecordWhereInput = doctorName ? {
      doctor: {
        user: {
          name: {
            contains: doctorName,
            mode: 'insensitive'
          }
        }
      }
    } : {};

    const whereClause: Prisma.MedicalRecordWhereInput = {
      ...baseWhere,
      AND: [
        ...(patientName ? [patientFilter] : []),
        ...(doctorName ? [doctorFilter] : [])
      ]
    };

    // Get total count for pagination
    const totalRecords = await prisma.medicalRecord.count({
      where: whereClause
    });

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        diagnosis: true,
        treatment: true,
        createdAt: true,
        updatedAt: true,
        notes: true,
        patient: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
                dateOfBirth: true,
                profile: {
                  select: {
                    genre: true,
                  }
                }
              },
            },
          },
        },
        doctor: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
            specialization: true,
          },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileUrl: true,
            fileSize: true,
            uploadedAt: true,
          },
        },
        prescription: {
          select: {
            id: true,
            medicationName: true,
            dosage: true,
            frequency: true,
            duration: true,
            isActive: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    const formatted = medicalRecords.map((record) => ({
      id: record.id,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      notes: record.notes,
      patient: {
        id: record.patient.id,
        name: record.patient.user.name,
        email: record.patient.user.email,
        dob: record.patient.user.dateOfBirth,
        gender: record.patient.user.profile?.genre,
      },
      doctor: {
        id: record.doctor.id,
        name: record.doctor.user.name,
        specialization: record.doctor.specialization,
      },
      attachments: record.attachments,
      prescriptions: record.prescription,
    }));

    return NextResponse.json({ 
      records: formatted,
      pagination: {
        total: totalRecords,
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit),
        hasNextPage: page * limit < totalRecords,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return NextResponse.json(
      { error: "Failed to fetch medical records" },
      { status: 500 }
    );
  }
}