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
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientId = params.id;
    const data = await request.json();

    // ✅ resolve userId from Patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, userId: true },
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Update User
    await prisma.user.update({
      where: { id: patient.userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        isActive: data.status === "active",
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      },
    });

    // Upsert Profile
    await prisma.userProfile.upsert({
      where: { userId: patient.userId },
      update: {
        address: data.address ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        zipCode: data.zipCode ?? null,
        country: data.country ?? null,
        genre:
          data.gender === "Homme"
            ? "MALE"
            : data.gender === "Femme"
              ? "FEMALE"
              : null,
      },
      create: {
        userId: patient.userId,
        address: data.address ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        zipCode: data.zipCode ?? null,
        country: data.country ?? null,
        genre:
          data.gender === "Homme"
            ? "MALE"
            : data.gender === "Femme"
              ? "FEMALE"
              : null,
      },
    });

    // Update Patient
    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        bloodType: data.bloodType || null,
        allergies: Array.isArray(data.allergies)
          ? data.allergies.join(",")
          : null,
        emergencyContact: data.emergencyContact ?? null,
        emergencyPhone: data.emergencyPhone ?? null,
        medicalNotes: Array.isArray(data.chronicConditions)
          ? data.chronicConditions.join(",")
          : null,
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
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve userId OUTSIDE the transaction (cheap + avoids extra time inside)
    const link = await prisma.patient.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true },
    });
    if (!link) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    const { userId } = link;

    // Phased hard delete with increased timeout.
    await prisma.$transaction(
      async (tx) => {
        // Phase 1: children of MedicalRecord
        await Promise.all([
          tx.medicalRecordAttachment.deleteMany({
            where: { medicalRecord: { patientId: params.id } },
          }),
          tx.prescription.deleteMany({
            where: { medicalRecord: { patientId: params.id } },
          }),
          tx.prescriptionOrder.deleteMany({
            where: { medicalRecord: { patientId: params.id } },
          }),
        ]);

        // Phase 2: direct children of Patient
        await Promise.all([
          tx.prescription.deleteMany({ where: { patientId: params.id } }),
          tx.prescriptionOrder.deleteMany({ where: { patientId: params.id } }),
          tx.vitalSign.deleteMany({ where: { patientId: params.id } }),
          tx.medicalHistory.deleteMany({ where: { patientId: params.id } }),
          tx.appointment.deleteMany({ where: { patientId: params.id } }),
        ]);

        // Phase 3: medical records themselves
        await tx.medicalRecord.deleteMany({ where: { patientId: params.id } });

        // Phase 4: rows keyed by userId
        await Promise.all([
          tx.review.deleteMany({ where: { authorId: userId } }),
          tx.session.deleteMany({ where: { userId } }),
          tx.account.deleteMany({ where: { userId } }),
          // Some apps store verification tokens by email/identifier, not userId.
          // If yours links by userId, keep this; if by email, adjust accordingly.
          tx.verificationToken
            .deleteMany({ where: { identifier: userId } })
            .catch(() => {}),
        ]);

        // Phase 5: parent rows (order matters if no DB cascades configured)
        await tx.patient.delete({ where: { id: params.id } });
        await tx.user.delete({ where: { id: userId } });
      },
      // ⤵️ increase interactive transaction timeout (ms)
      { timeout: 20_000, maxWait: 10_000 }
    );

    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Error deleting patient:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to delete patient" },
      { status: 500 }
    );
  }
}
