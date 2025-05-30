import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

// Types personnalisés
interface AttachmentInput {
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
}

interface PrescriptionInput {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface MedicalRecordInput {
  diagnosis: string;
  treatment: string;
  notes: string;
  followUpNeeded: boolean;
  followUpDate?: string;
  attachments?: AttachmentInput[];
  prescriptions?: PrescriptionInput[];
}

interface PatchRequestBody {
  appointmentId: string;
  action: "confirm" | "canceled" | "complete";
  medicalRecord?: MedicalRecordInput;
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HOSPITAL_DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data: PatchRequestBody = await req.json();
    const { appointmentId, action, medicalRecord } = data;

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        doctorId: true,
        patientId: true,
        medicalRecord: true,
      },
    });

    if (!appointment || appointment.doctorId !== doctor.id) {
      return NextResponse.json({ error: "Appointment not found or access denied" }, { status: 403 });
    }

    let updatedAppointment;

    if (action === "confirm") {
      updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.CONFIRMED },
      });

    } else if (action === "canceled") {
      updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.CANCELED },
      });

    } else if (action === "complete") {
      if (!medicalRecord) {
        return NextResponse.json({ error: "Medical record data is required to complete appointment" }, { status: 400 });
      }

      await prisma.medicalRecord.create({
        data: {
          appointment: { connect: { id: appointmentId } },
          diagnosis: medicalRecord.diagnosis,
          treatment: medicalRecord.treatment,
          notes: medicalRecord.notes,
          followUpNeeded: medicalRecord.followUpNeeded,
          followUpDate: medicalRecord.followUpDate ? new Date(medicalRecord.followUpDate) : undefined,
          attachments: {
            create: (medicalRecord.attachments ?? []).map((att) => ({
              fileName: att.fileName,
              fileType: att.fileType,
              fileUrl: att.fileUrl,
              fileSize: att.fileSize,
              uploadedAt: new Date(),
            })),
          },
          prescription: {
            create: (medicalRecord.prescriptions ?? []).map((presc) => ({
              medicationName: presc.medicationName,
              dosage: presc.dosage,
              frequency: presc.frequency,
              duration: presc.duration,
              instructions: presc.instructions,
              isActive: presc.isActive,
              startDate: new Date(presc.startDate),
              endDate: new Date(presc.endDate),
              patient: { connect: { id: appointment.patientId } },
              doctor: { connect: { id: appointment.doctorId } },
            })),
          },
          patient: { connect: { id: appointment.patientId } },
          doctor: { connect: { id: appointment.doctorId } },
        },
      });

      updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.COMPLETED },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        appointment: updatedAppointment,
        medicalRecord: updatedAppointment.medicalRecord || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
