import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/** ──────────────────────────────────────────────────────────────
 *  GET /delete-summary  → counts for warning modal
 *  Use: /api/superadmin/patients/:id?summary=1
 *  ────────────────────────────────────────────────────────────── */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSummary = request.nextUrl.searchParams.get("summary");
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            name: true,
            email: true,
            favoriteDoctors: { select: { id: true } },
            favoriteHospitals: { select: { id: true } },
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    if (isSummary) {
      const userId = patient.userId;

      const [
        appointmentsCount,
        medicalRecordsCount,
        recordAttachmentsCount,
        prescriptionsByRecordCount,
        prescriptionsByPatientCount,
        prescriptionOrdersByRecordCount,
        prescriptionOrdersByPatientCount,
        vitalSignsCount,
        historiesCount,
        authoredReviewsCount,
        sessionsCount,
        accountsCount,
      ] = await Promise.all([
        prisma.appointment.count({ where: { patientId: params.id } }),
        prisma.medicalRecord.count({ where: { patientId: params.id } }),
        prisma.medicalRecordAttachment.count({
          where: { medicalRecord: { patientId: params.id } },
        }),
        prisma.prescription.count({
          where: { medicalRecord: { patientId: params.id } },
        }),
        prisma.prescription.count({ where: { patientId: params.id } }),
        prisma.prescriptionOrder.count({
          where: { medicalRecord: { patientId: params.id } },
        }),
        prisma.prescriptionOrder.count({ where: { patientId: params.id } }),
        prisma.vitalSign.count({ where: { patientId: params.id } }),
        prisma.medicalHistory.count({ where: { patientId: params.id } }),
        prisma.review.count({ where: { authorId: userId } }),
        prisma.session.count({ where: { userId } }),
        prisma.account.count({ where: { userId } }),
      ]);

      return NextResponse.json({
        name: patient.user?.name ?? "—",
        email: patient.user?.email ?? "—",
        favorites: {
          doctors: patient.user?.favoriteDoctors.length ?? 0,
          hospitals: patient.user?.favoriteHospitals.length ?? 0,
        },
        counts: {
          appointments: appointmentsCount,
          medicalRecords: medicalRecordsCount,
          medicalRecordAttachments: recordAttachmentsCount,
          prescriptionsByRecord: prescriptionsByRecordCount,
          prescriptionsByPatient: prescriptionsByPatientCount,
          prescriptionOrdersByRecord: prescriptionOrdersByRecordCount,
          prescriptionOrdersByPatient: prescriptionOrdersByPatientCount,
          vitalSigns: vitalSignsCount,
          histories: historiesCount,
          authoredReviews: authoredReviewsCount,
          sessions: sessionsCount,
          accounts: accountsCount,
        },
      });
    }

    // (your existing GET details can stay here if needed)
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error fetching patient summary/details:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient info" },
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

    // Resolve userId + email (email is needed to clear verification tokens)
    const link = await prisma.patient.findUnique({
      where: { id: params.id },
      select: {
        userId: true,
        user: { select: { email: true } },
      },
    });
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
