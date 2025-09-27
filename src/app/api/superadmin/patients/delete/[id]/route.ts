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
