import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { appointmentId: params.appointmentId },
      include: { prescription: true },
    });

    if (!record) {
      return NextResponse.json({ message: "Dossier introuvable" }, { status: 404 });
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

    const updated = await prisma.medicalRecord.update({
      where: { appointmentId: params.appointmentId },
      data: {
        diagnosis: body.diagnosis,
        treatment: body.treatment,
        notes: body.notes || "",
        followUpNeeded: body.followUpNeeded || false,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
        // Tu peux aussi mettre à jour les prescriptions ici si besoin
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[UPDATE MEDICAL RECORD]", error);
    return NextResponse.json({ message: "Erreur de mise à jour" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {
    // Supprimer d'abord les prescriptions liées
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
    return NextResponse.json({ message: "Erreur de suppression" }, { status: 500 });
  }
}
