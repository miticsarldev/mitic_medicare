import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const vitalId = params.id;
    const doctor = await prisma.doctor.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Médecin non trouvé" },
        { status: 404 }
      );
    }

    const vital = await prisma.vitalSign.findUnique({
      where: { id: vitalId },
      select: { id: true, patientId: true },
    });

    if (!vital) {
      return NextResponse.json(
        { error: "Mesure introuvable" },
        { status: 404 }
      );
    }

    // Ensure doctor has a relationship to this patient (has at least one appointment)
    const linked = await prisma.appointment.findFirst({
      where: { patientId: vital.patientId, doctorId: doctor.id },
      select: { id: true },
    });

    if (!linked) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await prisma.vitalSign.delete({ where: { id: vitalId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE vital_signs error", e);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!doctor) {
      return NextResponse.json(
        { error: "Médecin non trouvé" },
        { status: 404 }
      );
    }

    const vital = await prisma.vitalSign.findUnique({
      where: { id: params.id },
      select: { id: true, patientId: true },
    });
    if (!vital) {
      return NextResponse.json(
        { error: "Mesure introuvable" },
        { status: 404 }
      );
    }

    const linked = await prisma.appointment.findFirst({
      where: { patientId: vital.patientId, doctorId: doctor.id },
      select: { id: true },
    });
    if (!linked) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const {
      temperature,
      heartRate,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      oxygenSaturation,
      weight,
      height,
    } = body ?? {};

    const updated = await prisma.vitalSign.update({
      where: { id: params.id },
      data: {
        temperature,
        heartRate,
        bloodPressureSystolic,
        bloodPressureDiastolic,
        oxygenSaturation,
        weight,
        height,
      },
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (e) {
    console.error("PUT vital_signs error", e);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
