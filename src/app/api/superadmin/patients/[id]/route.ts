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

    const patientRecord = await prisma.patient.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!patientRecord) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const userId = patientRecord.user.id;

    const data = await request.json();

    // Update user data
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        isActive: data.status,
        dateOfBirth: new Date(data.dateOfBirth),
      },
    });

    // Update or create user profile
    await prisma.userProfile.upsert({
      where: {
        userId: userId,
      },
      update: {
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        genre: data.gender,
      },
      create: {
        userId: userId,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        genre: data.gender,
      },
    });

    // Get patient record
    const patient = await prisma.patient.findFirst({
      where: {
        user: {
          id: userId,
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
        bloodType: data.bloodType || null,
        allergies: data.allergies.join(","),
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
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
