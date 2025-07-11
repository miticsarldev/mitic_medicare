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

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.id; // Renommer pour plus de clarté

    // Vérifier l'existence du patient et de l'utilisateur
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Transaction pour garantir l'intégrité
    await prisma.$transaction(async (prisma) => {
      // 1. Supprimer les dépendances du patient
      await prisma.prescriptionOrder.deleteMany({
        where: { patientId: patient.id }
      });

      await prisma.prescription.deleteMany({
        where: { patientId: patient.id }
      });

      await prisma.review.deleteMany({
        where: { authorId: userId } // Note: utiliser userId ici
      });

      // Supprimer les attachments avant les medical records
      await prisma.medicalRecordAttachment.deleteMany({
        where: { medicalRecord: { patientId: patient.id } }
      });

      await prisma.medicalRecord.deleteMany({
        where: { patientId: patient.id }
      });

      await prisma.medicalHistory.deleteMany({
        where: { patientId: patient.id }
      });

      await prisma.appointment.deleteMany({
        where: { patientId: patient.id }
      });

      await prisma.vitalSign.deleteMany({
        where: { patientId: patient.id }
      });

      // 2. Supprimer le profil utilisateur s'il existe
      await prisma.userProfile.deleteMany({
        where: { userId }
      });

      // 3. Supprimer les sessions et comptes
      await prisma.session.deleteMany({
        where: { userId }
      });

      await prisma.account.deleteMany({
        where: { userId }
      });

      // 4. Supprimer les favoris (relations many-to-many)
      await prisma.user.update({
        where: { id: userId },
        data: {
          favoriteDoctors: { set: [] },
          favoriteHospitals: { set: [] }
        }
      });

      // 5. Supprimer le patient
      await prisma.patient.delete({
        where: { id: patient.id }
      });

      // 6. Enfin supprimer l'utilisateur
      await prisma.user.delete({
        where: { id: userId }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      {
        error: "Failed to delete patient",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

