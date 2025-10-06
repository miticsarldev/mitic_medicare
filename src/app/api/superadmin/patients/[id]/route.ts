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

    const link = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, userId: true },
    });
    if (!link)
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    // Normalize gender (accept "MALE"/"FEMALE" or "Homme"/"Femme")
    const normalizedGenre =
      data.gender === "MALE"
        ? "MALE"
        : data.gender === "FEMALE"
          ? "FEMALE"
          : data.gender === "Homme"
            ? "MALE"
            : data.gender === "Femme"
              ? "FEMALE"
              : null;

    // Update User (do NOT overwrite isActive unless provided)
    await prisma.user.update({
      where: { id: link.userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        ...(typeof data.isActive === "boolean"
          ? { isActive: data.isActive }
          : {}), // ← key fix
      },
    });

    // Upsert Profile
    await prisma.userProfile.upsert({
      where: { userId: link.userId },
      update: {
        address: data.address ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        zipCode: data.zipCode ?? null,
        country: data.country ?? null,
        genre: normalizedGenre,
      },
      create: {
        userId: link.userId,
        address: data.address ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        zipCode: data.zipCode ?? null,
        country: data.country ?? null,
        genre: normalizedGenre,
      },
    });

    // Update Patient
    await prisma.patient.update({
      where: { id: link.id },
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

// export async function DELETE(
//   _request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "SUPER_ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const link = await prisma.patient.findUnique({
//       where: { id: params.id },
//       select: { id: true, userId: true },
//     });
//     if (!link)
//       return NextResponse.json({ error: "Patient not found" }, { status: 404 });

//     const { userId } = link;

//     await prisma.$transaction(
//       async (tx) => {
//         // 0) Clear M2M favorites to be extra safe
//         await tx.user.update({
//           where: { id: userId },
//           data: {
//             favoriteDoctors: { set: [] },
//             favoriteHospitals: { set: [] },
//           },
//         });

//         // 1) Children of medical records
//         await tx.medicalRecordAttachment.deleteMany({
//           where: { medicalRecord: { patientId: params.id } },
//         });
//         await tx.prescription.deleteMany({
//           where: { medicalRecord: { patientId: params.id } },
//         });
//         await tx.prescriptionOrder.deleteMany({
//           where: { medicalRecord: { patientId: params.id } },
//         });

//         // 2) Direct children of patient
//         await tx.prescription.deleteMany({ where: { patientId: params.id } });
//         await tx.prescriptionOrder.deleteMany({
//           where: { patientId: params.id },
//         });
//         await tx.vitalSign.deleteMany({ where: { patientId: params.id } });
//         await tx.medicalHistory.deleteMany({
//           where: { OR: [{ patientId: params.id }, { createdBy: userId }] }, // ← also authored by this user
//         });
//         await tx.appointment.deleteMany({ where: { patientId: params.id } });

//         // 3) Medical records
//         await tx.medicalRecord.deleteMany({ where: { patientId: params.id } });

//         // 4) Rows keyed by userId
//         await tx.review.deleteMany({ where: { authorId: userId } });
//         await tx.session.deleteMany({ where: { userId } });
//         await tx.account.deleteMany({ where: { userId } });
//         await tx.verificationToken
//           .deleteMany({ where: { identifier: userId } })
//           .catch(() => {});

//         // 5) Parent rows
//         await tx.patient.delete({ where: { id: params.id } });
//         await tx.user.delete({ where: { id: userId } });
//       },
//       { timeout: 20_000, maxWait: 10_000 }
//     );

//     return NextResponse.json({ success: true });
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (err: any) {
//     console.error("Error deleting patient:", err);
//     return NextResponse.json(
//       { error: err?.message ?? "Failed to delete patient" },
//       { status: 500 }
//     );
//   }
// }

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log({ id: params.id });

    // Resolve userId + email (email is needed to clear verification tokens)
    const link = await prisma.patient.findUnique({
      where: { id: params.id },
      select: {
        userId: true,
        user: { select: { email: true } },
      },
    });
    console.log({ link });

    if (!link) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const userId = link.userId;
    const email = link.user?.email ?? null;

    // 1) Clean the few non-cascading references in a single batched transaction
    await prisma.$transaction([
      // PrescriptionOrder → patient relation in your schema doesn't have onDelete: Cascade
      prisma.prescriptionOrder.deleteMany({ where: { patientId: params.id } }),
      // Review.author has no onDelete: Cascade in your schema
      prisma.review.deleteMany({ where: { authorId: userId } }),
      // VerificationToken is keyed by "identifier" (email in your app),
      // fall back to userId if you stored it that way at some point.
      prisma.verificationToken.deleteMany({
        where: email ? { identifier: email } : { identifier: userId },
      }),
    ]);

    // 2) Delete the user (this cascades to patient and most patient children)
    await prisma.user.delete({ where: { id: userId } });

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
