import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { patientId, scheduledAt, type, notes } = body ?? {};

    if (!patientId || !scheduledAt) {
      return NextResponse.json(
        { error: "Patient ID et date de rendez-vous requis" },
        { status: 400 }
      );
    }

    // Get the doctor
    const doctor = await prisma.doctor.findFirst({
      where: { userId: session.user.id },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Médecin non trouvé" },
        { status: 404 }
      );
    }

    // Verify the patient exists and the doctor has access to them
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    // Check if doctor has access to this patient (has at least one appointment)
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        patientId: patientId,
        doctorId: doctor.id,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Accès refusé - Aucune relation avec ce patient" },
        { status: 403 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId: doctor.id,
        hospitalId: doctor.hospitalId,
        scheduledAt: new Date(scheduledAt),
        type: type || null,
        notes: notes || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      ok: true,
      id: appointment.id,
      appointment: {
        id: appointment.id,
        scheduledAt: appointment.scheduledAt,
        status: appointment.status,
        type: appointment.type,
        notes: appointment.notes,
      },
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
