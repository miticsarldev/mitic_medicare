export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientId = params.id;
    console.log(patientId);

    // Get patient details
    const patient = await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        appointments: true,
        medicalRecords: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Format the response
    const formattedPatient = {
      ...patient,
      appointmentsCount: patient.appointments.length,
      medicalRecordsCount: patient.medicalRecords.length,
      allergies: patient.allergies ? patient.allergies.split(",") : [],
      chronicConditions: patient.medicalNotes
        ? patient.medicalNotes.split(",")
        : [],
    };

    return NextResponse.json(formattedPatient);
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientId = params.id;
    const data = await request.json();

    // Update user data
    await prisma.user.update({
      where: {
        id: patientId,
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        isActive: data.status === "active",
      },
    });

    // Update or create user profile
    await prisma.userProfile.upsert({
      where: {
        userId: patientId,
      },
      update: {
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        genre: data.gender === "Homme" ? "MALE" : "FEMALE",
      },
      create: {
        userId: patientId,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        genre: data.gender === "Homme" ? "MALE" : "FEMALE",
      },
    });

    // Get patient record
    const patient = await prisma.patient.findFirst({
      where: {
        user: {
          id: patientId,
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Update patient data
    await prisma.patient.update({
      where: {
        id: patient.id,
      },
      data: {
        dateOfBirth: new Date(data.dateOfBirth),
        bloodType: data.bloodType || null,
        allergies: data.allergies.join(","),
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        insuranceProvider: data.insuranceProvider,
        insuranceNumber: data.insuranceNumber,
        medicalNotes: data.chronicConditions.join(","),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { error: "Failed to update patient" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientId = params.id;

    // Find the patient record
    const patient = await prisma.patient.findFirst({
      where: {
        user: {
          id: patientId,
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Delete the patient and related data
    // Note: This assumes you have proper cascading deletes set up in your schema
    await prisma.user.delete({
      where: {
        id: patientId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      { error: "Failed to delete patient" },
      { status: 500 }
    );
  }
}
