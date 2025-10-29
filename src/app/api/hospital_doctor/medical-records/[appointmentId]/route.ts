import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { appointmentId: params.appointmentId },
      include: { prescription: true, attachments: true },
    });

    if (!record) {
      return NextResponse.json(
        { message: "Dossier introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("[GET MEDICAL RECORD]", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const body = await req.json();

    // Delete existing attachments and prescriptions
    await prisma.medicalRecordAttachment.deleteMany({
      where: { medicalRecord: { appointmentId: params.appointmentId } },
    });

    await prisma.prescription.deleteMany({
      where: { medicalRecord: { appointmentId: params.appointmentId } },
    });

    const updated = await prisma.medicalRecord.update({
      where: { appointmentId: params.appointmentId },
      data: {
        diagnosis: body.diagnosis,
        treatment: body.treatment,
        notes: body.notes || "",
        followUpNeeded: body.followUpNeeded || false,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
        attachments: {
          create: (body.attachments ?? []).map((att: { fileName: string; fileType: string; fileUrl: string; fileSize: number }) => ({
            fileName: att.fileName,
            fileType: att.fileType,
            fileUrl: att.fileUrl,
            fileSize: att.fileSize,
            uploadedAt: new Date(),
          })),
        },
        prescription: {
          create: (body.prescriptions ?? []).map((presc: { medicationName: string; dosage: string; frequency: string; duration: string; instructions?: string; isActive: boolean; startDate: string; endDate: string }) => ({
            medicationName: presc.medicationName,
            dosage: presc.dosage,
            frequency: presc.frequency,
            duration: presc.duration,
            instructions: presc.instructions,
            isActive: presc.isActive,
            startDate: new Date(presc.startDate),
            endDate: new Date(presc.endDate),
            patient: { connect: { id: body.patientId } },
            doctor: { connect: { id: body.doctorId } },
          })),
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[UPDATE MEDICAL RECORD]", error);
    return NextResponse.json(
      { message: "Erreur de mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {
    // Supprimer d'abord les attachments et prescriptions liées
    await prisma.medicalRecordAttachment.deleteMany({
      where: { medicalRecord: { appointmentId: params.appointmentId } },
    });

    await prisma.prescription.deleteMany({
      where: { medicalRecord: { appointmentId: params.appointmentId } },
    });

    // Ensuite le dossier médical
    await prisma.medicalRecord.delete({
      where: { appointmentId: params.appointmentId },
    });

    return NextResponse.json({ message: "Dossier supprimé" });
  } catch (error) {
    console.error("[DELETE MEDICAL RECORD]", error);
    return NextResponse.json(
      { message: "Erreur de suppression" },
      { status: 500 }
    );
  }
}
