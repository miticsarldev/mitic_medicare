"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  AppointmentStatus,
  BloodType,
  HospitalStatus,
  Prisma,
  ReviewStatus,
  ReviewTargetType,
  UserGenre,
} from "@prisma/client";
import { GetPatientMedicalRecordsResult, PatientOverviewData } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { compare, hash } from "bcryptjs";
import { formatTime, generateTimeSlots, parseTime } from "@/utils/function";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";

export async function getPatientOverview(): Promise<PatientOverviewData> {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
      include: {
        user: true,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Get next appointment
    const now = new Date();
    const nextAppointment = await prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        scheduledAt: {
          gte: now,
        },
        status: {
          in: ["PENDING", "CONFIRMED", "CANCELED", "COMPLETED", "NO_SHOW"],
        },
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    // Get recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
      take: 3,
    });

    // Get latest medical record
    const latestMedicalRecord = await prisma.medicalRecord.findFirst({
      where: {
        patientId: patient.id,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get active prescriptions
    const activePrescriptions = await prisma.prescription.findMany({
      where: {
        patientId: patient.id,
        isActive: true,
        endDate: {
          gte: now,
        },
        prescriptionOrderId: null,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    const latestPrescriptionOrder = await prisma.prescriptionOrder.findFirst({
      where: {
        patientId: patient.id,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        prescriptions: true,
      },
      orderBy: {
        issuedAt: "desc",
      },
    });

    // Get vital signs
    const vitalSigns = await prisma.vitalSign.findMany({
      where: {
        patientId: patient.id,
      },
      orderBy: {
        recordedAt: "desc",
      },
      take: 5,
    });

    // Get medical history
    const medicalHistory = await prisma.medicalHistory.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        createdByUser: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform data to include doctor names
    const transformedNextAppointment = nextAppointment
      ? {
          ...nextAppointment,
          doctorName: nextAppointment.doctor.user.name,
        }
      : null;

    const transformedRecentAppointments = recentAppointments.map(
      (appointment) => ({
        ...appointment,
        doctorName: appointment.doctor.user.name,
      })
    );

    const transformedLatestMedicalRecord = latestMedicalRecord
      ? {
          ...latestMedicalRecord,
          doctorName: latestMedicalRecord.doctor.user.name,
        }
      : null;

    const transformedActivePrescriptions = activePrescriptions.map(
      (prescription) => ({
        ...prescription,
        doctorName: prescription.doctor.user.name,
      })
    );

    const transformedMedicalHistory = medicalHistory.map((history) => ({
      ...history,
      createdByName: history.createdByUser.name,
    }));

    const transformedPrescriptionOrder = latestPrescriptionOrder
      ? {
          ...latestPrescriptionOrder,
          doctorName: latestPrescriptionOrder.doctor.user.name,
          prescriptions: latestPrescriptionOrder.prescriptions,
        }
      : null;

    return {
      patient: patient ?? {},
      nextAppointment: transformedNextAppointment ?? null,
      recentAppointments: transformedRecentAppointments ?? [],
      latestMedicalRecord: transformedLatestMedicalRecord ?? null,
      latestPrescriptionOrder: transformedPrescriptionOrder ?? null,
      activePrescriptions: transformedActivePrescriptions ?? [],
      vitalSigns: vitalSigns ?? [],
      medicalHistory: transformedMedicalHistory ?? [],
    };
  } catch (error) {
    console.error("Error fetching patient overview:", error);
    // Return empty data structure in case of error
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      patient: {} as any,
      nextAppointment: null,
      recentAppointments: [],
      latestMedicalRecord: null,
      activePrescriptions: [],
      latestPrescriptionOrder: null,
      vitalSigns: [],
      medicalHistory: [],
    };
  }
}

export async function bookAppointment(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    const doctorId = formData.get("doctorId") as string;
    const scheduledDate = formData.get("scheduledDate") as string;
    const scheduledTime = formData.get("scheduledTime") as string;
    const reason = formData.get("reason") as string;

    console.log({ doctorId, scheduledDate, scheduledTime, reason });

    if (!doctorId || !scheduledDate || !scheduledTime) {
      throw new Error("Missing required fields");
    }

    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    console.log("Patient ID:", patient?.id);

    if (!patient) {
      throw new Error("Patient not found");
    }

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });

    console.log("Doctor:", doctor);

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Combine date and time
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);

    // Create appointment
    const validatedAppointments = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        hospitalId: doctor.hospitalId || undefined,
        scheduledAt,
        status: "PENDING",
        reason,
      },
    });

    console.log("Created Appointment:", validatedAppointments);
    // Send notification to doctor (if needed)
    // await sendNotificationToDoctor(doctorId, validatedAppointments.id);
    // Optionally, send email to patient and doctor
    // await sendAppointmentEmail(patient.email, doctor.user.email, validatedAppointments);
    // Optionally, send SMS to patient and doctor
    // await sendAppointmentSMS(patient.phone, doctor.user.phone, validatedAppointments);
    // Optionally, send push notification to patient and doctor
    // await sendPushNotification(patient.userId, doctor.userId, validatedAppointments);
    // Optionally, send appointment reminder to patient and doctor

    revalidatePath("/dashboard/patient/appointments/all");
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw new Error("Failed to book appointment");
  }
}

export async function getAvailableDoctors(searchQuery?: string) {
  try {
    // Build the where clause based on the search query
    const where = searchQuery
      ? {
          OR: [
            {
              user: {
                // Ensure this is the only 'user' property in the object
                name: {
                  contains: searchQuery,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              specialization: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              hospital: {
                name: {
                  contains: searchQuery,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
          isVerified: true,
          availableForChat: true,
        }
      : {
          isVerified: true,
          availableForChat: true,
        };

    // Get all available doctors
    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: true,
        hospital: true,
        department: true,
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    // Transform the data to a more usable format
    return doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.user.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital?.name || "Cabinet privé",
      department: doctor.department?.name,
      consultationFee: doctor.consultationFee
        ? Number(doctor.consultationFee)
        : undefined,
      experience: doctor.experience,
      isIndependent: doctor.isIndependent,
    }));
  } catch (error) {
    console.error("Error fetching available doctors:", error);
    return [];
  }
}

export async function getAvailableHospitals(searchQuery?: string) {
  try {
    const where = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" as const } },
            { city: { contains: searchQuery, mode: "insensitive" as const } },
            {
              country: { contains: searchQuery, mode: "insensitive" as const },
            },
          ],
          status: "ACTIVE" as HospitalStatus,
          isVerified: true,
        }
      : {
          status: "ACTIVE" as HospitalStatus,
          isVerified: true,
        };

    const hospitals = await prisma.hospital.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return hospitals.map((h) => ({
      id: h.id,
      name: h.name,
      type: "hospital" as const,
      hospital: h.name,
      consultationFee: undefined,
    }));
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return [];
  }
}

export async function getDoctorAvailableTimeSlots(
  doctorId: string,
  date: string
) {
  try {
    if (!doctorId || !date) {
      return [];
    }

    // Get the day of week (0-6, where 0 is Sunday)
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Get the doctor's availability for the selected day
    const availability = await prisma.doctorAvailability.findMany({
      where: {
        doctorId: doctorId,
        dayOfWeek: dayOfWeek,
        isActive: true,
      },
    });

    if (!availability.length) {
      return [];
    }

    // Get existing appointments for the doctor on the selected date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        scheduledAt: true,
      },
    });

    // Generate time slots based on availability
    const availableTimeSlots: string[] = [];

    availability.forEach((slot) => {
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);

      // Generate 30-minute slots
      const slotDurationMinutes = 30;
      let currentHour = startHour;
      let currentMinute = startMinute;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMinute < endMinute)
      ) {
        const timeSlot = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

        // Check if this time slot conflicts with an existing appointment
        const isBooked = existingAppointments.some((appointment) => {
          const appointmentHour = appointment.scheduledAt.getHours();
          const appointmentMinute = appointment.scheduledAt.getMinutes();
          return (
            appointmentHour === currentHour &&
            appointmentMinute === currentMinute
          );
        });

        if (!isBooked) {
          availableTimeSlots.push(timeSlot);
        }

        // Move to next slot
        currentMinute += slotDurationMinutes;
        if (currentMinute >= 60) {
          currentHour += 1;
          currentMinute = 0;
        }
      }
    });

    return availableTimeSlots.sort();
  } catch (error) {
    console.error("Error fetching doctor available time slots:", error);
    return [];
  }
}

export async function getHospitalAvailableTimeSlots(
  hospitalId: string,
  date: string
): Promise<string[]> {
  try {
    const dayOfWeek = new Date(date).getDay();

    const doctors = await prisma.doctor.findMany({
      where: {
        hospitalId,
        isVerified: true,
        availableForChat: true,
      },
      include: {
        availabilities: {
          where: {
            dayOfWeek,
            isActive: true,
          },
        },
      },
    });

    const timeSlotSet = new Set<string>();

    for (const doctor of doctors) {
      for (const slot of doctor.availabilities) {
        const start = parseTime(slot.startTime);
        const end = parseTime(slot.endTime);

        for (let t = start; t < end; t += 30) {
          timeSlotSet.add(formatTime(t));
        }
      }
    }

    return Array.from(timeSlotSet).sort();
  } catch (err) {
    console.error("Error fetching hospital time slots:", err);
    return [];
  }
}

export async function getPatientAppointments({
  status,
  search,
  page = 1,
  limit = 10,
  time,
}: {
  status?: AppointmentStatus | AppointmentStatus[];
  search?: string;
  page?: number;
  limit?: number;
  time?: "upcoming" | "past";
} = {}) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Build the filter conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      patientId: patient.id,
    };

    // Add status filter if provided
    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
        {
          doctor: {
            user: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
        {
          hospital: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const now = new Date();
    if (time === "upcoming") {
      where.status = { in: ["PENDING", "CONFIRMED"] };
      where.scheduledAt = { gte: now };
    } else if (time === "past") {
      where.OR = [
        { scheduledAt: { lt: now } },
        { status: { in: ["CANCELED", "COMPLETED", "NO_SHOW"] } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.appointment.count({ where });

    // Get appointments with related data
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                profile: {
                  select: {
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        hospital: {
          select: {
            name: true,
            address: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
      skip,
      take: limit,
    });

    // Format the appointments for the frontend
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctor.user.name,
      doctorEmail: appointment.doctor.user.email,
      doctorAvatar: appointment.doctor.user.profile?.avatarUrl,
      hospitalId: appointment.hospitalId,
      hospitalName: appointment.hospital?.name,
      hospitalAddress: appointment.hospital
        ? `${appointment.hospital.address}, ${appointment.hospital.city}, ${appointment.hospital.state}`
        : null,
      scheduledAt: appointment.scheduledAt,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      type: appointment.type,
      reason: appointment.reason,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
    }));

    return {
      appointments: formattedAppointments,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return {
      appointments: [],
      pagination: {
        total: 0,
        pages: 0,
        page: 1,
        limit,
      },
    };
  }
}

export async function cancelAppointment(
  formData: FormData | { id: string; reason: string; notes?: string }
) {
  try {
    // Handle both FormData and direct object input
    const id =
      formData instanceof FormData
        ? (formData.get("id") as string)
        : formData.id;
    const reason =
      formData instanceof FormData
        ? (formData.get("reason") as string)
        : formData.reason;
    const notes =
      formData instanceof FormData
        ? (formData.get("notes") as string)
        : formData.notes;

    // Validate the input
    if (!id) {
      throw new Error("Appointment ID is required");
    }

    // Update the appointment status
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELED,
        cancelledAt: new Date(),
        cancellationReason: reason || "Cancelled by patient",
        notes: notes ? `${notes}\n\nCancellation notes: ${notes}` : undefined,
      },
    });

    console.log("Cancelled Appointment:", updated);

    // Revalidate the appointments page
    revalidatePath("/dashboard/patient/appointments");
    return { success: true };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { success: false, error: "Failed to cancel appointment" };
  }
}

export async function rescheduleAppointment(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    const appointmentId = formData.get("appointmentId") as string;
    const doctorId = formData.get("doctorId") as string;
    const scheduledDate = formData.get("scheduledDate") as string;
    const scheduledTime = formData.get("scheduledTime") as string;
    const reason = formData.get("reason") as string;

    console.log({
      appointmentId,
      doctorId,
      scheduledDate,
      scheduledTime,
      reason,
    });

    if (!appointmentId || !doctorId || !scheduledDate || !scheduledTime) {
      throw new Error("Missing required fields");
    }

    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Combine date and time
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        doctorId: doctor.id,
        hospitalId: doctor.hospitalId || undefined,
        scheduledAt,
        status: "PENDING", // Reset to pending since it's a new time
        reason: reason,
      },
    });

    console.log("Updated Appointment:", updatedAppointment);

    revalidatePath("/dashboard/patient/appointments/all");
    return { success: true, appointment: updatedAppointment };
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    throw new Error("Failed to reschedule appointment");
  }
}

export async function getAppointmentById(appointmentId: string) {
  try {
    if (!appointmentId) {
      throw new Error("Appointment ID is required");
    }

    console.log(appointmentId);

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                profile: {
                  select: {
                    avatarUrl: true,
                  },
                },
              },
            },
            hospital: true,
            department: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Transform the data to a more usable format
    return {
      id: appointment.id,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctor.user.name,
      doctorEmail: appointment.doctor.user.email,
      doctorAvatar: appointment.doctor.user.profile?.avatarUrl,
      specialization: appointment.doctor.specialization,
      hospital: appointment.doctor.hospital?.name || "Cabinet privé",
      department: appointment.doctor.department?.name,
      consultationFee: appointment.doctor.consultationFee
        ? Number(appointment.doctor.consultationFee)
        : undefined,
      scheduledAt: appointment.scheduledAt,
      reason: appointment.reason || "",
      status: appointment.status,
      isPast: appointment.scheduledAt.getTime() < Date.now(),
    };
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw new Error("Failed to fetch appointment details");
  }
}

export async function getPatientMedicalRecords(): Promise<GetPatientMedicalRecordsResult> {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Get medical records with related data
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        doctor: {
          include: {
            user: true,
            hospital: true,
            department: true,
          },
        },
        hospital: true,
        prescriptionOrder: {
          include: {
            prescriptions: true,
          },
        },
        prescription: true,
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to a more usable format
    const transformed = medicalRecords.map((record) => {
      const allPrescriptions = [
        ...record.prescriptionOrder.flatMap((order) =>
          order.prescriptions.map((prescription) => ({
            id: prescription.id,
            name: prescription.medicationName,
            dosage: prescription.dosage,
            frequency: prescription.frequency,
            duration: prescription.duration || "Non spécifié",
            isActive: prescription.isActive,
            doctorId: prescription.doctorId,
            issuedAt: order.issuedAt.toISOString(),
            source: "order",
          }))
        ),
        ...(record.prescription?.map((pres) => ({
          id: pres.id,
          name: pres.medicationName,
          dosage: pres.dosage,
          frequency: pres.frequency,
          duration: pres.duration || "Non spécifié",
          isActive: pres.isActive,
          doctorId: pres.doctorId,
          issuedAt: pres.createdAt.toISOString(),
          source: "direct",
        })) ?? []),
      ];

      // Dédoublonner par ID
      const uniquePrescriptions = Array.from(
        new Map(allPrescriptions.map((p) => [p.id, p])).values()
      );

      return {
        id: record.id,
        title: record.diagnosis,
        date: record.createdAt.toISOString(),
        doctor: record.doctor.user.name,
        specialty: record.doctor.specialization,
        facility: record.hospital?.name || "Non spécifié",
        summary: record.diagnosis,
        recommendations: record.treatment,
        notes: record.notes,
        followUpNeeded: record.followUpNeeded,
        followUpDate: record.followUpDate?.toISOString(),
        status: record.followUpNeeded ? "active" : "completed",
        type: determineRecordType(record),
        tags: generateTags(record),
        medications: uniquePrescriptions,
        documents: record.attachments.map((attachment) => ({
          id: attachment.id,
          name: attachment.fileName,
          type: getDocumentType(attachment.fileType),
          url: attachment.fileUrl,
          size: formatFileSize(attachment.fileSize),
          uploadedAt: attachment.uploadedAt.toISOString(),
        })),
      };
    });

    const allTypes = Array.from(new Set(transformed.map((r) => r.type)));
    const allStatuses = Array.from(new Set(transformed.map((r) => r.status)));
    const allTags = Array.from(new Set(transformed.flatMap((r) => r.tags)));

    return {
      success: true,
      records: transformed,
      filters: {
        types: allTypes,
        statuses: allStatuses,
        tags: allTags,
      },
    };
  } catch (error) {
    console.error("Error fetching patient medical records:", error);
    return { success: false, error: "Une erreur s'est produite" };
  }
}

export async function getMedicalRecordById(recordId: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Get medical record with related data
    const record = await prisma.medicalRecord.findUnique({
      where: {
        id: recordId,
        patientId: patient.id, // Ensure the record belongs to the patient
      },
      include: {
        doctor: {
          include: {
            user: true,
            hospital: true,
            department: true,
          },
        },
        hospital: true,
        prescriptionOrder: {
          include: {
            prescriptions: true,
          },
        },
        attachments: true,
      },
    });

    if (!record) {
      throw new Error("Medical record not found");
    }

    // Transform the data to a more usable format
    return {
      id: record.id,
      title: record.diagnosis,
      date: record.createdAt.toISOString(),
      doctor: record.doctor.user.name,
      specialty: record.doctor.specialization,
      facility: record.hospital?.name || "Non spécifié",
      summary: record.diagnosis,
      recommendations: record.treatment,
      notes: record.notes,
      followUpNeeded: record.followUpNeeded,
      followUpDate: record.followUpDate?.toISOString(),
      status: record.followUpNeeded ? "active" : "completed",
      type: determineRecordType(record),
      tags: generateTags(record),
      medications: record.prescriptionOrder.flatMap((order) =>
        order.prescriptions.map((prescription) => ({
          id: prescription.id,
          name: prescription.medicationName,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration || "Non spécifié",
          isActive: prescription.isActive,
        }))
      ),
      documents: record.attachments.map((attachment) => ({
        id: attachment.id,
        name: attachment.fileName,
        type: getDocumentType(attachment.fileType),
        url: attachment.fileUrl,
        size: formatFileSize(attachment.fileSize),
        uploadedAt: attachment.uploadedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching medical record:", error);
    throw new Error("Failed to fetch medical record");
  }
}

// Get patient profile data
export async function getPatientProfile() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user data with profile and patient info
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
        patient: {
          include: {
            vitalSigns: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    console.log("patientId", user?.patient?.id);

    // Format profile data
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      bio: user.profile?.bio || "",
      dateOfBirth: user.dateOfBirth || null,
      bloodType: user.patient?.bloodType || "",
      allergies: user.patient?.allergies || "",
      address: user.profile?.address || "",
      city: user.profile?.city || "",
      state: user.profile?.state || "",
      zipCode: user.profile?.zipCode || "",
      country: user.profile?.country || "",
      gender: user.profile?.genre || "",
      avatarUrl: user.profile?.avatarUrl || "",
      emergencyContactName: user.patient?.emergencyContact || "",
      emergencyContactPhone: user.patient?.emergencyPhone || "",
      emergencyContactRelation: user.patient?.emergencyRelation || "",
      createdAt: user.createdAt,
    };

    // Format vitals data
    const vitals = user.patient?.vitalSigns[0] || null;

    const formattedVitals = vitals
      ? {
          ...vitals,
          temperature: vitals.temperature?.toNumber() ?? null,
          weight: vitals.weight?.toNumber() ?? null,
          height: vitals.height?.toNumber() ?? null,
        }
      : null;

    return {
      profile,
      vitals: formattedVitals,
    };
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    throw new Error("Failed to fetch patient profile");
  }
}

// Update patient profile
export async function updatePatientProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Extract profile data from form
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const bio = formData.get("bio") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const bloodType = formData.get("bloodType") as string;
    const allergies = formData.get("allergies") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const country = formData.get("country") as string;
    const gender = formData.get("gender") as string;
    const emergencyContactName = formData.get("emergencyContactName") as string;
    const emergencyContactPhone = formData.get(
      "emergencyContactPhone"
    ) as string;
    const emergencyContactRelation = formData.get(
      "emergencyContactRelation"
    ) as string;

    // Handle avatar upload if provided
    const avatar = formData.get("avatar") as File;
    let avatarUrl: string | undefined = undefined;

    if (avatar && avatar.size > 0) {
      // In a real implementation, you would upload the avatar to a storage service
      // and get back a URL. For this example, we'll just simulate it.
      avatarUrl = `/placeholder.svg?height=128&width=128&text=${encodeURIComponent(name.charAt(0))}`;
    }

    // Update user data
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        patient: {
          upsert: {
            create: {
              allergies,
              bloodType: bloodType as BloodType,
              emergencyContact: emergencyContactName,
              emergencyPhone: emergencyContactPhone,
              emergencyRelation: emergencyContactRelation,
            },
            update: {
              allergies,
              bloodType: bloodType as BloodType,
              emergencyContact: emergencyContactName,
              emergencyPhone: emergencyContactPhone,
              emergencyRelation: emergencyContactRelation,
            },
          },
        },
        profile: {
          upsert: {
            create: {
              bio,
              address,
              city,
              state,
              zipCode,
              country,
              genre: gender as UserGenre,
              avatarUrl,
            },
            update: {
              bio,
              address,
              city,
              state,
              zipCode,
              country,
              genre: gender as UserGenre,
              ...(avatarUrl && { avatarUrl }),
            },
          },
        },
      },
    });

    revalidatePath("/dashboard/patient/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating patient profile:", error);
    throw new Error("Failed to update patient profile");
  }
}

// Update patient vitals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updatePatientVitals(data: any) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Extract vitals data
    const height = data.height ? Number.parseFloat(data.height) : undefined;
    const weight = data.weight ? Number.parseFloat(data.weight) : undefined;
    const bloodPressureSystolic = data.bloodPressureSystolic
      ? Number.parseInt(data.bloodPressureSystolic)
      : undefined;
    const bloodPressureDiastolic = data.bloodPressureDiastolic
      ? Number.parseInt(data.bloodPressureDiastolic)
      : undefined;
    const heartRate = data.heartRate
      ? Number.parseInt(data.heartRate)
      : undefined;
    const respiratoryRate = data.respiratoryRate
      ? Number.parseInt(data.respiratoryRate)
      : undefined;
    const temperature = data.temperature
      ? Number.parseFloat(data.temperature)
      : undefined;
    const oxygenSaturation = data.oxygenSaturation
      ? Number.parseInt(data.oxygenSaturation)
      : undefined;

    // Create new vitals record
    await prisma.vitalSign.create({
      data: {
        patientId: patient.id,
        height,
        weight,
        bloodPressureSystolic,
        bloodPressureDiastolic,
        heartRate,
        respiratoryRate,
        temperature,
        oxygenSaturation,
      },
    });

    revalidatePath("/dashboard/patient/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating patient vitals:", error);
    throw new Error("Failed to update patient vitals");
  }
}

// Helper function to determine record type based on record data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function determineRecordType(record: any): string {
  // Check if there are prescriptions
  if (record.prescriptions && record.prescriptions.length > 0) {
    return "prescription";
  }

  // Check if there are attachments with specific file types
  if (record.attachments && record.attachments.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileTypes = record.attachments.map((a: any) =>
      a.fileType.toLowerCase()
    );

    if (
      fileTypes.some(
        (type) =>
          type.includes("image") ||
          type.includes("dicom") ||
          type.includes("x-ray")
      )
    ) {
      return "imaging";
    }

    if (
      fileTypes.some(
        (type) =>
          type.includes("lab") ||
          (type.includes("pdf") &&
            record.diagnosis.toLowerCase().includes("analyse"))
      )
    ) {
      return "laboratory";
    }
  }

  // Check diagnosis or notes for keywords
  const diagnosisLower = record.diagnosis.toLowerCase();
  const notesLower = record.notes ? record.notes.toLowerCase() : "";

  if (diagnosisLower.includes("vaccin") || notesLower.includes("vaccin")) {
    return "vaccination";
  }

  if (diagnosisLower.includes("allergie") || notesLower.includes("allergie")) {
    return "allergy";
  }

  if (
    diagnosisLower.includes("chirurgie") ||
    notesLower.includes("chirurgie") ||
    diagnosisLower.includes("opération") ||
    notesLower.includes("opération")
  ) {
    return "surgery";
  }

  if (
    diagnosisLower.includes("dent") ||
    notesLower.includes("dent") ||
    diagnosisLower.includes("dentaire") ||
    notesLower.includes("dentaire")
  ) {
    return "dental";
  }

  if (
    diagnosisLower.includes("oeil") ||
    notesLower.includes("oeil") ||
    diagnosisLower.includes("vision") ||
    notesLower.includes("vision") ||
    diagnosisLower.includes("ophtalmolog") ||
    notesLower.includes("ophtalmolog")
  ) {
    return "ophthalmology";
  }

  // Default to consultation
  return "consultation";
}

// Helper function to generate tags based on record data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateTags(record: any): string[] {
  const tags: string[] = [];

  // Add tag based on record type
  const recordType = determineRecordType(record);
  tags.push(recordType);

  // Add tag for follow-up if needed
  if (record.followUpNeeded) {
    tags.push("suivi-requis");
  }

  // Add tag based on hospital/department if available
  if (record.hospital) {
    tags.push(record.hospital.name);
  }

  if (record.doctor.department) {
    tags.push(record.doctor.department.name);
  }

  // Add tag based on doctor specialization
  tags.push(record.doctor.specialization);

  // Add tags based on diagnosis keywords
  const diagnosisLower = record.diagnosis.toLowerCase();

  if (diagnosisLower.includes("chronique")) {
    tags.push("chronique");
  }

  if (diagnosisLower.includes("urgent") || diagnosisLower.includes("urgence")) {
    tags.push("urgent");
  }

  if (diagnosisLower.includes("contrôle") || diagnosisLower.includes("suivi")) {
    tags.push("contrôle");
  }

  return Array.from(new Set(tags)); // Remove duplicates
}

// Helper function to determine document type based on file type
function getDocumentType(fileType: string): string {
  const type = fileType.toLowerCase();

  if (
    type.includes("image") ||
    type.includes("jpg") ||
    type.includes("png") ||
    type.includes("jpeg")
  ) {
    return "image";
  }

  if (type.includes("pdf")) {
    return "pdf";
  }

  if (type.includes("dicom") || type.includes("x-ray")) {
    return "imaging";
  }

  if (type.includes("doc") || type.includes("word")) {
    return "document";
  }

  if (type.includes("xls") || type.includes("excel") || type.includes("csv")) {
    return "spreadsheet";
  }

  return "file";
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + " B";
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }
}

// Change password
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      throw new Error("User not found or password not set");
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    throw new Error("Failed to change password");
  }
}

// Delete account
export async function deleteAccount() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // For example:
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    throw new Error("Failed to delete account");
  }
}

// Get recent appointments for the current patient
export async function getRecentAppointments() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Get recent appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        status: "COMPLETED", // Only completed appointments
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                profile: {
                  select: {
                    avatarUrl: true,
                  },
                },
              },
            },
            hospital: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
      take: 10, // Get only the 10 most recent appointments
    });

    // Check if there are reviews for each doctor
    const formattedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        // Check if there's a DoctorReview for this doctor
        const review = await prisma.review.findFirst({
          where: {
            doctorId: appointment.doctorId,
          },
        });

        return {
          id: appointment.id,
          doctorId: appointment.doctorId,
          doctorName: appointment.doctor.user.name,
          doctorSpecialty: appointment.doctor.specialization,
          avatar:
            appointment.doctor.user.profile?.avatarUrl ||
            "/placeholder.svg?height=40&width=40",
          location: appointment.doctor.hospital?.name || "Cabinet privé",
          date: appointment.scheduledAt,
          hasReview: review !== null,
        };
      })
    );

    return formattedAppointments;
  } catch (error) {
    console.error("Error fetching recent appointments:", error);
    return [];
  }
}

// Get recent establishments for the current patient
export async function getRecentEstablishments() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Get establishments from patient's appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        status: "COMPLETED",
        hospitalId: {
          not: undefined,
        },
      },
      include: {
        hospital: true,
      },
      orderBy: {
        scheduledAt: "desc",
      },
      distinct: ["hospitalId"],
      take: 10,
    });

    // Check if there are reviews for each establishment
    const establishmentsWithReviews = await Promise.all(
      appointments.map(async (appointment) => {
        if (!appointment.hospital) return null;

        // Check for reviews using the Review model (not DoctorReview)
        const review = await prisma.review.findFirst({
          where: {
            authorId: userId,
            hospitalId: appointment.hospitalId,
            targetType: "HOSPITAL",
          },
        });

        return {
          id: appointment.hospital.id,
          name: appointment.hospital.name,
          type: appointment.hospital.status || "Hôpital",
          image:
            appointment.hospital.logoUrl ||
            "/placeholder.svg?height=40&width=40",
          lastVisit: appointment.scheduledAt,
          hasReview: review !== null,
        };
      })
    );

    return establishmentsWithReviews.filter((e) => e !== null) as {
      id: string;
      name: string;
      type: string;
      image: string;
      lastVisit: Date;
      hasReview: boolean;
    }[];
  } catch (error) {
    console.error("Error fetching recent establishments:", error);
    return [];
  }
}

// Submit a review
export async function submitReview(data: {
  type: "doctor" | "hospital";
  doctorId?: string;
  title?: string;
  content?: string;
  rating: number;
  comment?: string;
  targetType?: "DOCTOR" | "HOSPITAL" | "PLATFORM";
  hospitalId?: string;
  isAnonymous: boolean;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    if (data.type === "doctor" && data.doctorId) {
      // For doctor reviews, use the DoctorReview model
      const doctorReview = await prisma.review.create({
        data: {
          doctorId: data.doctorId,
          rating: data.rating,
          authorId: userId,
          targetType: "DOCTOR",
          title: data.title || "Avis sur le médecin",
          content: data.comment || "",
          isAnonymous: data.isAnonymous,
          status: "PENDING",
        },
      });

      revalidatePath("/dashboard/patient/reviews/my-feedback");
      return { success: true, reviewId: doctorReview.id };
    } else if (data.type === "hospital" && data.hospitalId) {
      // For hospital reviews, use the Review model
      const review = await prisma.review.create({
        data: {
          title: data.title || "Avis sur l'établissement",
          content: data.content || "",
          rating: data.rating,
          authorId: userId,
          targetType: data.targetType || "HOSPITAL",
          hospitalId: data.hospitalId,
          status: "PENDING", // Reviews are pending until approved
          isAnonymous: data.isAnonymous,
        },
      });

      revalidatePath("/dashboard/patient/reviews/my-feedback");
      return { success: true, reviewId: review.id };
    } else {
      throw new Error("Invalid review data");
    }
  } catch (error) {
    console.error("Error submitting review:", error);
    throw new Error("Failed to submit review");
  }
}

// Get user reviews
export async function getUserReviews() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) throw new Error("User not authenticated");

    const reviews = await prisma.review.findMany({
      where: {
        authorId: userId,
        OR: [{ targetType: "DOCTOR" }, { targetType: "HOSPITAL" }],
      },
      include: {
        doctor: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        hospital: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reviews.map((review) => {
      if (review.targetType === "DOCTOR") {
        return {
          id: review.id,
          type: "doctor" as const,
          name: review.doctor?.user.name || "Médecin inconnu",
          specialty: review.doctor?.specialization || "Spécialité inconnue",
          rating: review.rating,
          date: review.createdAt.toLocaleDateString("fr-FR"),
          comment: review.content || "",
          image:
            review.doctor?.user.profile?.avatarUrl ||
            "/placeholder.svg?height=40&width=40",
          status: review.status,
        };
      } else {
        return {
          id: review.id,
          type: "hospital" as const,
          title: review.title,
          name: review.hospital?.name || "Établissement",
          specialty: review.hospital?.status || "Hôpital",
          rating: review.rating,
          date: review.createdAt.toLocaleDateString("fr-FR"),
          comment: review.content,
          image:
            review.hospital?.logoUrl || "/placeholder.svg?height=40&width=40",
          status: review.status,
        };
      }
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return [];
  }
}

// Delete a review
export async function deleteReview(reviewId: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) throw new Error("User not authenticated");

    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        authorId: userId,
      },
    });

    if (!review) throw new Error("Review not found or unauthorized");

    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    revalidatePath("/dashboard/patient/reviews/my-feedback");
    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    throw new Error("Failed to delete review");
  }
}

// Doctor-related actions
export async function getMyDoctors() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Get doctors from appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        doctor: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            hospital: true,
            department: true,
            reviews: {
              where: {
                authorId: patient.id,
                targetType: "DOCTOR",
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });

    // Get favorite doctors (this would need to be implemented in your schema)
    // For now, we'll simulate it
    const favoriteIds: string[] = [];

    // Extract unique doctors from appointments
    const doctorMap = new Map();
    appointments.forEach(({ doctorId, doctor, scheduledAt }) => {
      if (!doctorMap.has(doctorId)) {
        const ratings = doctor.reviews.map((r) => r.rating);
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : null;

        doctorMap.set(doctorId, {
          id: doctorId,
          name: doctor.user.name,
          specialty: doctor.specialization,
          hospital: doctor.hospital?.name || "Cabinet privé",
          address: doctor.hospital?.address || "Adresse non spécifiée",
          image: doctor.user.profile?.avatarUrl || "/placeholder.svg",
          rating: avgRating,
          reviewCount: doctor.reviews.length,
          lastVisit: scheduledAt,
          isFavorite: favoriteIds.includes(doctorId),
          hasReview: doctor.reviews.length > 0,
          nextAppointment: null,
        });
      }
    });

    // Get upcoming appointments for these doctors
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        doctorId: {
          in: Array.from(doctorMap.keys()),
        },
        scheduledAt: {
          gt: new Date(),
        },
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    // Update doctors with next appointment
    upcomingAppointments.forEach((appointment) => {
      const doctor = doctorMap.get(appointment.doctorId);
      if (
        doctor &&
        (!doctor.nextAppointment ||
          new Date(appointment.scheduledAt) < new Date(doctor.nextAppointment))
      ) {
        doctor.nextAppointment = appointment.scheduledAt;
      }
    });

    return Array.from(doctorMap.values());
  } catch (error) {
    console.error("Error fetching my doctors:", error);
    return [];
  }
}

export async function toggleFavoriteDoctor() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // This would need to be implemented in your schema
    // For now, we'll just return a simulated response
    return { isFavorite: true };
  } catch (error) {
    console.error("Error toggling favorite doctor:", error);
    throw new Error("Failed to update favorite status");
  }
}

export async function getDoctorDetails(doctorId: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Get doctor details
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        hospital: true,
        department: true,
        availabilities: true,
        reviews: {
          where: { targetType: "DOCTOR" },
          include: {
            author: { include: { profile: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Check if doctor is a favorite (would need to be implemented in your schema)
    const isFavorite = false;

    // Get past appointments with this doctor
    const pastAppointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        doctorId: doctorId,
        status: AppointmentStatus.COMPLETED,
      },
      orderBy: {
        scheduledAt: "desc",
      },
      take: 5,
    });

    // Get upcoming appointments with this doctor
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        doctorId: doctorId,
        scheduledAt: {
          gt: new Date(),
        },
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
      take: 3,
    });

    // Get prescriptions from this doctor
    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctorId: doctorId,
        patientId: patient.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    const ratings = doctor.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;

    const dayNames = [
      "dimanche",
      "lundi",
      "mardi",
      "mercredi",
      "jeudi",
      "jendredi",
      "samedi",
    ];

    const availability: Record<string, string> = {};
    for (let i = 0; i <= 6; i++) {
      const slots = doctor.availabilities.filter(
        (a) => a.dayOfWeek === i && a.isActive
      );
      availability[dayNames[i]] =
        slots.length > 0
          ? slots.map((s) => `${s.startTime} - ${s.endTime}`).join(", ")
          : "Fermé";
    }

    // Format doctor details
    return {
      id: doctor.id,
      name: doctor.user.name,
      specialty: doctor.specialization,
      subspecialty: "",
      hospital: doctor.hospital?.name || "Cabinet privé",
      department: doctor.department?.name || "",
      address: doctor.hospital?.address || "Adresse non spécifiée",
      phone: doctor.user.phone || "",
      email: doctor.user.email,
      image: doctor.user.profile?.avatarUrl || "/placeholder.svg",
      rating: avgRating,
      reviewCount: doctor.reviews.length,
      experience: doctor.experience || "",
      bio: doctor.education || "Aucune biographie disponible",
      education: doctor.education ? [doctor.education] : [],
      languages: ["Français"],
      availability: availability,
      isFavorite: isFavorite,
      consultations: pastAppointments.map((appointment) => ({
        id: appointment.id,
        date: appointment.scheduledAt,
        type: appointment.type || "Consultation",
        reason: appointment.reason || "Consultation générale",
        notes: appointment.notes || "",
      })),
      prescriptions: prescriptions.map((prescription) => ({
        id: prescription.id,
        date: prescription.createdAt,
        medications: [prescription.medicationName],
        duration: prescription.duration || "1 mois",
      })),
      nextAppointment: upcomingAppointments[0]?.scheduledAt || null,
      reviews: doctor.reviews.map((review) => ({
        id: review.id,
        author: review.isAnonymous ? "Patient anonyme" : review.author.name,
        date: review.createdAt,
        rating: review.rating,
        comment: review.content || "",
      })),
    };
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    throw new Error("Failed to fetch doctor details");
  }
}

export async function submitDoctorReview(data: {
  doctorId: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  title: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Check if patient has already reviewed this doctor
    const existingReview = await prisma.review.findFirst({
      where: {
        authorId: patient.id,
        doctorId: data.doctorId,
        targetType: "DOCTOR",
      },
    });

    if (existingReview) {
      // Update existing review
      await prisma.review.update({
        where: {
          id: existingReview.id,
        },
        data: {
          rating: data.rating,
          content: data.comment,
          isAnonymous: data.isAnonymous,
          status: "PENDING",
        },
      });
    } else {
      // Create new review
      await prisma.review.create({
        data: {
          doctorId: data.doctorId,
          authorId: userId,
          rating: data.rating,
          content: data.comment,
          isAnonymous: data.isAnonymous,
          targetType: "DOCTOR",
          status: "PENDING",
          title: data.title, // Add a default or dynamic title
        },
      });
    }

    revalidatePath("/dashboard/patient/my-doctors");
    return { success: true };
  } catch (error) {
    console.error("Error submitting doctor review:", error);
    throw new Error("Failed to submit review");
  }
}

export async function getHospitals(params: {
  query?: string;
  specialties?: string[];
  minRating?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
  favoritesOnly?: boolean;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
    if (!userId) throw new Error("User not authenticated");

    const patient = await prisma.patient.findFirst({
      where: { userId },
    });
    if (!patient) throw new Error("Patient not found");

    const {
      query,
      sortBy,
      page = 1,
      limit = 9,
      favoritesOnly,
      specialties,
    } = params;

    const skip = (page - 1) * limit;

    // Get list of favorite hospital IDs if filtering by favorites
    let favoriteHospitalIds: string[] = [];
    if (favoritesOnly) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          favoriteHospitals: true,
        },
      });
      favoriteHospitalIds = user?.favoriteHospitals.map((h) => h.id) || [];
    }

    // Build where filter
    const where: Prisma.HospitalWhereInput = {
      ...(query && {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
          { country: { contains: query, mode: "insensitive" } },
        ],
      }),
      ...(specialties &&
        specialties.length > 0 && {
          doctors: {
            some: {
              OR: specialties.map((spec) => ({
                specialization: {
                  equals: spec,
                  mode: "insensitive" as const,
                },
              })),
            },
          },
        }),
      ...(favoritesOnly && {
        id: {
          in: favoriteHospitalIds,
        },
      }),
    };

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        include: {
          departments: true,
          doctors: true,
          reviews: {
            include: {
              author: {
                select: {
                  name: true,
                  id: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: sortBy === "name" ? { name: "asc" } : { createdAt: "desc" },
      }),
      prisma.hospital.count({ where }),
    ]);

    if (sortBy === "rating") {
      hospitals.sort((a, b) => {
        const avgA =
          a.reviews.reduce((sum, r) => sum + r.rating, 0) /
          (a.reviews.length || 1);
        const avgB =
          b.reviews.reduce((sum, r) => sum + r.rating, 0) /
          (b.reviews.length || 1);
        return avgB - avgA;
      });
    }

    const result = hospitals.map((hospital) => {
      const specialties = new Set<string>();
      hospital.departments.forEach((d) => d.name && specialties.add(d.name));
      hospital.doctors.forEach(
        (d) => d.specialization && specialties.add(d.specialization)
      );

      const ratings = hospital.reviews.map((r) => r.rating);
      const totalReviews = ratings.length || 1;
      const avgRating = ratings.reduce((sum, r) => sum + r, 0) / totalReviews;

      const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
        const count = ratings.filter((r) => r === star).length;
        const percentage = Math.round((count / totalReviews) * 100);
        return {
          star,
          count,
          percentage,
        };
      });

      return {
        id: hospital.id,
        name: hospital.name,
        status: hospital.status,
        address: hospital.address,
        phone: hospital.phone,
        email: hospital.email,
        website: hospital.website,
        image: hospital.logoUrl || "/placeholder.svg?height=300&width=300",
        description: hospital.description || "Aucune description disponible",
        specialties: Array.from(specialties),
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: hospital.reviews.length,
        doctors: hospital.doctors.length,
        isFavorite: favoriteHospitalIds.includes(hospital.id),
        ratingDistribution,
        reviews: hospital.reviews.map((review) => ({
          id: review.id,
          author: review.isAnonymous
            ? "Patient anonyme"
            : review.author
              ? review.author.name
              : "Inconnu",
          date: review.createdAt,
          rating: review.rating,
          comment: review.content || "",
        })),
      };
    });

    return {
      data: result,
      total,
    };
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return { data: [], total: 0 };
  }
}

export async function getHospitalDetails(hospitalId: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Get hospital details
    const hospital = await prisma.hospital.findUnique({
      where: {
        id: hospitalId,
      },
      include: {
        departments: true,
        doctors: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            reviews: true,
          },
          take: 5,
        },
        reviews: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!hospital) {
      throw new Error("Hospital not found");
    }

    // Check if hospital is a favorite (would need to be implemented in your schema)
    const isFavorite = false;

    // Calculate specialties from departments and doctors
    const specialties = new Set<string>();
    hospital.departments.forEach((dept) => {
      if (dept.name) specialties.add(dept.name);
    });
    hospital.doctors.forEach((doctor) => {
      if (doctor.specialization) specialties.add(doctor.specialization);
    });

    // Format hospital details
    return {
      id: hospital.id,
      name: hospital.name,
      status: hospital.status,
      address: hospital.address || "Adresse non spécifiée",
      phone: hospital.phone || "",
      email: hospital.email || "",
      website: hospital.website || "",
      image: hospital.logoUrl || "/placeholder.svg",
      description: hospital.description || "Aucune description disponible",
      specialties: Array.from(specialties),
      rating:
        hospital.reviews.length > 0
          ? hospital.reviews.reduce((sum, r) => sum + r.rating, 0) /
            hospital.reviews.length
          : 0, // This would come from an aggregation of reviews
      reviewCount: hospital.reviews.length,
      doctors: hospital.doctors.length,
      isFavorite: isFavorite,
      reviews: hospital.reviews.map((review) => ({
        id: review.id,
        author: review.isAnonymous
          ? "Patient anonyme"
          : review.author.name || "Utilisateur",
        date: review.createdAt,
        rating: review.rating,
        comment: review.content || "",
      })),
      topDoctors: hospital.doctors.slice(0, 5).map((doctor) => ({
        id: doctor.id,
        name: doctor.user.name,
        specialty: doctor.specialization,
        image: doctor.user.profile?.avatarUrl || "/placeholder.svg",
        rating:
          doctor.reviews.length > 0
            ? doctor.reviews.reduce((sum, r) => sum + r.rating, 0) /
              doctor.reviews.length
            : 0,
      })),
    };
  } catch (error) {
    console.error("Error fetching hospital details:", error);
    throw new Error("Failed to fetch hospital details");
  }
}

export async function submitHospitalReview(data: {
  hospitalId: string;
  title: string;
  content: string;
  rating: number;
  isAnonymous: boolean;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Check if user has already reviewed this hospital
    const existingReview = await prisma.review.findFirst({
      where: {
        authorId: userId,
        hospitalId: data.hospitalId,
        targetType: ReviewTargetType.HOSPITAL,
      },
    });

    if (existingReview) {
      // Update existing review
      await prisma.review.update({
        where: {
          id: existingReview.id,
        },
        data: {
          title: data.title,
          content: data.content,
          rating: data.rating,
          isAnonymous: data.isAnonymous,
          status: ReviewStatus.PENDING, // Reset approval status
        },
      });
    } else {
      // Create new review
      await prisma.review.create({
        data: {
          title: data.title,
          content: data.content,
          rating: data.rating,
          authorId: userId,
          hospitalId: data.hospitalId,
          targetType: ReviewTargetType.HOSPITAL,
          status: ReviewStatus.PENDING,
          isAnonymous: data.isAnonymous,
        },
      });
    }

    revalidatePath("/dashboard/patient/hospitals");
    return { success: true };
  } catch (error) {
    console.error("Error submitting hospital review:", error);
    throw new Error("Failed to submit review");
  }
}

export async function getSpecializationOptions(): Promise<
  { label: string; value: string }[]
> {
  const specializations = await prisma.doctor.findMany({
    distinct: ["specialization"],
    select: {
      specialization: true,
    },
    where: {
      specialization: {
        not: "",
      },
    },
    orderBy: {
      specialization: "asc",
    },
  });

  return specializations.map((s) => ({
    label: s.specialization,
    value: s.specialization.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export async function getFavoritesSpecializationOptions(): Promise<
  { label: string; value: string }[]
> {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const specializations = await prisma.doctor.findMany({
    where: {
      favoritedBy: {
        some: { id: userId },
      },
      specialization: {
        not: "",
      },
    },
    distinct: ["specialization"],
    select: {
      specialization: true,
    },
    orderBy: {
      specialization: "asc",
    },
  });

  return specializations.map((s) => ({
    label: s.specialization,
    value: s.specialization.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export async function getHospitalDoctorSpecializationOptions(params?: {
  favoritesOnly?: boolean;
}): Promise<{ label: string; value: string }[]> {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  let favoriteHospitalIds: string[] = [];

  if (params?.favoritesOnly) {
    const userWithFavorites = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        favoriteHospitals: {
          select: { id: true },
        },
      },
    });

    favoriteHospitalIds =
      userWithFavorites?.favoriteHospitals.map((h) => h.id) || [];

    if (favoriteHospitalIds.length === 0) {
      return [];
    }
  }

  const specializations = await prisma.doctor.findMany({
    where: {
      hospitalId: {
        not: null,
        ...(params?.favoritesOnly ? { in: favoriteHospitalIds } : {}),
      },
      specialization: {
        not: "",
      },
    },
    distinct: ["specialization"],
    select: {
      specialization: true,
    },
    orderBy: {
      specialization: "asc",
    },
  });

  return specializations.map((s) => ({
    label: s.specialization,
    value: s.specialization.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export async function searchDoctors(params: {
  query?: string;
  specialty?: string;
  gender?: string;
  minRating?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
    if (!userId) throw new Error("User not authenticated");

    // Construct Prisma where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { AND: [] };

    if (params.query) {
      query.AND.push({
        OR: [
          { user: { name: { contains: params.query, mode: "insensitive" } } },
          { specialization: { contains: params.query, mode: "insensitive" } },
          {
            hospital: { name: { contains: params.query, mode: "insensitive" } },
          },
        ],
      });
    }

    if (params.specialty && params.specialty !== "all") {
      query.AND.push({
        specialization: {
          equals: params.specialty,
          mode: "insensitive",
        },
      });
    }

    if (params.gender && params.gender !== "") {
      query.AND.push({
        user: {
          profile: {
            genre: params.gender === "MALE" ? UserGenre.MALE : UserGenre.FEMALE,
          },
        },
      });
    }

    const page = params.page || 1;
    const limit = params.limit || 9;
    const skip = (page - 1) * limit;

    // Fetch doctors from DB
    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where: query,
        include: {
          user: { include: { profile: true } },
          hospital: true,
          department: true,
          reviews: {
            take: 3,
            orderBy: { createdAt: "desc" },
          },
          availabilities: true,
        },
        orderBy: getOrderBy(params.sortBy),
        skip,
        take: limit,
      }),
      prisma.doctor.count({ where: query }),
    ]);

    // Sort manually by rating if needed
    if (params.sortBy === "rating") {
      doctors.sort((a, b) => {
        const avgA =
          a.reviews.reduce((sum, r) => sum + r.rating, 0) /
          (a.reviews.length || 1);
        const avgB =
          b.reviews.reduce((sum, r) => sum + r.rating, 0) /
          (b.reviews.length || 1);
        return avgB - avgA;
      });
    }

    // Format and return
    const formattedDoctors = doctors.map((doctor) => {
      const today = new Date();
      const daysToGenerate = 7;

      const groupedSlots: Record<string, string[]> = {};

      for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const isoDate = format(date, "yyyy-MM-dd");
        const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)

        const slotsForDay = doctor.availabilities
          .filter((a) => a.dayOfWeek === dayOfWeek && a.isActive)
          .flatMap((a) => generateTimeSlots(a.startTime, a.endTime));

        if (slotsForDay.length) {
          groupedSlots[isoDate] = slotsForDay;
        }
      }

      const slots = Object.entries(groupedSlots).map(([date, times]) => ({
        date,
        times,
      }));

      const nextAvailable = slots[0]?.times?.[0]
        ? `${slots[0].date}T${slots[0].times[0]}:00`
        : null;

      return {
        id: doctor.id,
        name: doctor.user.name,
        specialty: doctor.specialization,
        gender: doctor.user.profile?.genre || UserGenre.MALE,
        hospital:
          doctor.hospital?.name || "Cabinet privé | Médécin Indépendant",
        address: doctor.hospital?.address || "Adresse non spécifiée",
        avatar: doctor.user.profile?.avatarUrl || "/placeholder.svg",
        isIndependant: doctor.isIndependent,
        rating:
          doctor.reviews.length > 0
            ? doctor.reviews.reduce((sum, r) => sum + r.rating, 0) /
              doctor.reviews.length
            : 0,
        reviewCount: doctor.reviews.length,
        experience: doctor.experience || 0,
        consultationFee: doctor.consultationFee?.toNumber() || 0,
        isFavorite: false,
        availability: {
          nextAvailable,
          slots,
        },
        reviews: doctor.reviews.map((review) => ({
          id: review.id,
          author: review.isAnonymous ? "Patient anonyme" : "Utilisateur",
          date: isValid(review.createdAt)
            ? format(review.createdAt, "d MMMM yyyy", { locale: fr })
            : "Date invalide",
          rating: review.rating,
          comment: review.content || "",
        })),
      };
    });

    return {
      data: formattedDoctors,
      total,
    };
  } catch (error) {
    console.error("Error searching doctors:", error);
    return [];
  }
}

// Helper function to get order by clause for doctor search
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOrderBy(sortBy?: string): Record<string, any> {
  switch (sortBy) {
    case "experience":
      return { experience: "desc" };
    case "price_low":
      return { consultationFee: "asc" };
    case "price_high":
      return { consultationFee: "desc" };
    case "availability":
      return { user: { name: "asc" } }; // fallback
    default:
      return { user: { name: "asc" } };
  }
}

export async function addDoctorToFavoritesDoctors({
  doctorId,
}: {
  doctorId: string;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  await prisma.user.update({
    where: { id: userId },
    data: {
      favoriteDoctors: {
        connect: { id: doctorId },
      },
    },
  });
}

export async function removeDoctorToFavoritesDoctors({
  doctorId,
}: {
  doctorId: string;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  await prisma.user.update({
    where: { id: userId },
    data: {
      favoriteDoctors: {
        disconnect: { id: doctorId },
      },
    },
  });
}

export async function getFavoriteDoctorIds() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  if (!userId) return [];

  const favorites = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      favoriteDoctors: {
        select: { id: true },
      },
    },
  });

  return favorites?.favoriteDoctors.map((d) => d.id) ?? [];
}

export async function getFavoritesDoctors(params: {
  query?: string;
  specialty?: string;
  gender?: string;
  minRating?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
    if (!userId) throw new Error("User not authenticated");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      AND: [
        {
          favoritedBy: {
            some: { id: userId },
          },
        },
      ],
    };

    if (params.query) {
      query.AND.push({
        OR: [
          { user: { name: { contains: params.query, mode: "insensitive" } } },
          { specialization: { contains: params.query, mode: "insensitive" } },
          {
            hospital: {
              name: { contains: params.query, mode: "insensitive" },
            },
          },
        ],
      });
    }

    if (params.specialty && params.specialty !== "all") {
      query.AND.push({
        specialization: {
          equals: params.specialty,
          mode: "insensitive",
        },
      });
    }

    if (params.gender && params.gender !== "") {
      query.AND.push({
        user: {
          profile: {
            genre: params.gender === "MALE" ? UserGenre.MALE : UserGenre.FEMALE,
          },
        },
      });
    }

    const page = params.page || 1;
    const limit = params.limit || 9;
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where: query,
        include: {
          user: { include: { profile: true } },
          hospital: true,
          department: true,
          reviews: {
            take: 3,
            orderBy: { createdAt: "desc" },
          },
          availabilities: true,
          favoritedBy: true, // Just to ensure relation exists
        },
        orderBy: getOrderBy(params.sortBy),
        skip,
        take: limit,
      }),
      prisma.doctor.count({ where: query }),
    ]);

    // Sort manually by rating if needed
    if (params.sortBy === "rating") {
      doctors.sort((a, b) => {
        const avgA =
          a.reviews.reduce((sum, r) => sum + r.rating, 0) /
          (a.reviews.length || 1);
        const avgB =
          b.reviews.reduce((sum, r) => sum + r.rating, 0) /
          (b.reviews.length || 1);
        return avgB - avgA;
      });
    }

    const formattedDoctors = doctors.map((doctor) => {
      const today = new Date();
      const daysToGenerate = 7;
      const groupedSlots: Record<string, string[]> = {};

      for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const isoDate = format(date, "yyyy-MM-dd");
        const dayOfWeek = date.getDay();

        const slotsForDay = doctor.availabilities
          .filter((a) => a.dayOfWeek === dayOfWeek && a.isActive)
          .flatMap((a) => generateTimeSlots(a.startTime, a.endTime));

        if (slotsForDay.length) {
          groupedSlots[isoDate] = slotsForDay;
        }
      }

      const slots = Object.entries(groupedSlots).map(([date, times]) => ({
        date,
        times,
      }));

      const nextAvailable = slots[0]?.times?.[0]
        ? `${slots[0].date}T${slots[0].times[0]}:00`
        : null;

      return {
        id: doctor.id,
        name: doctor.user.name,
        specialty: doctor.specialization,
        gender: doctor.user.profile?.genre || UserGenre.MALE,
        hospital:
          doctor.hospital?.name || "Cabinet privé | Médecin Indépendant",
        address: doctor.hospital?.address || "Adresse non spécifiée",
        avatar: doctor.user.profile?.avatarUrl || "/placeholder.svg",
        isIndependant: doctor.isIndependent,
        rating:
          doctor.reviews.length > 0
            ? doctor.reviews.reduce((sum, r) => sum + r.rating, 0) /
              doctor.reviews.length
            : 0,
        reviewCount: doctor.reviews.length,
        experience: doctor.experience || 0,
        consultationFee: doctor.consultationFee?.toNumber() || 0,
        isFavorite: true, // All are favorites here
        availability: {
          nextAvailable,
          slots,
        },
        reviews: doctor.reviews.map((review) => ({
          id: review.id,
          author: review.isAnonymous ? "Patient anonyme" : "Utilisateur",
          date: isValid(review.createdAt)
            ? format(review.createdAt, "d MMMM yyyy", { locale: fr })
            : "Date invalide",
          rating: review.rating,
          comment: review.content || "",
        })),
      };
    });

    return {
      data: formattedDoctors,
      total,
    };
  } catch (error) {
    console.error("Error fetching favorite doctors:", error);
    return [];
  }
}

export async function checkDoctorInFavorites({
  doctorId,
}: {
  doctorId: string;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      favoriteDoctors: {
        where: { id: doctorId },
      },
    },
  });

  const isFavorite = (user?.favoriteDoctors ?? []).length > 0;

  return isFavorite;
}

export async function addHospitalToFavoritesDoctors({
  hospitalId,
}: {
  hospitalId: string;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  await prisma.user.update({
    where: { id: userId },
    data: {
      favoriteHospitals: {
        connect: { id: hospitalId },
      },
    },
  });
}

export async function removeHospitalToFavoritesHospitals({
  hospitalId,
}: {
  hospitalId: string;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  await prisma.user.update({
    where: { id: userId },
    data: {
      favoriteHospitals: {
        disconnect: { id: hospitalId },
      },
    },
  });
}

export async function getFavoriteHospitalIds() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  if (!userId) return [];

  const favorites = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      favoriteHospitals: {
        select: { id: true },
      },
    },
  });

  return favorites?.favoriteHospitals.map((d) => d.id) ?? [];
}

export interface MedicalRecordWithDetails {
  id: string;
  diagnosis: string;
  treatment: string | null;
  notes: string | null;
  followUpNeeded: boolean;
  followUpDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  doctor: {
    id: string;
    specialization: string;
    user: {
      name: string;
    };
  };
  hospital: {
    id: string;
    name: string;
  } | null;
  appointment: {
    id: string;
    scheduledAt: Date;
    type: string | null;
    reason: string | null;
  } | null;
  attachments: {
    id: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: Date;
  }[];
  prescriptionOrder: {
    id: string;
    issuedAt: Date;
    notes: string | null;
    prescriptions: {
      id: string;
      medicationName: string;
      dosage: string;
      frequency: string;
      duration: string | null;
      instructions: string | null;
      isActive: boolean;
      startDate: Date;
      endDate: Date | null;
    }[];
  }[];
}

export async function getMedicalRecordsByPatientId(): Promise<
  MedicalRecordWithDetails[]
> {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        patientId: userId,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: {
          select: {
            id: true,
            scheduledAt: true,
            type: true,
            reason: true,
          },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileUrl: true,
            fileSize: true,
            uploadedAt: true,
          },
        },
        prescriptionOrder: {
          include: {
            prescriptions: {
              select: {
                id: true,
                medicationName: true,
                dosage: true,
                frequency: true,
                duration: true,
                instructions: true,
                isActive: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return medicalRecords;
  } catch (error) {
    console.error("Error fetching medical records:", error);
    throw new Error("Failed to fetch medical records");
  }
}

export interface MedicalHistoryItem {
  id: string;
  title: string;
  condition: string;
  status: string;
  diagnosedDate: string | null;
  details: string | null;
  createdAt: string;
  updatedAt: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    hospital?: {
      name: string;
    };
  } | null;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
}

export interface GetMedicalHistoryResult {
  success: boolean;
  history?: MedicalHistoryItem[];
  error?: string;
}

export async function getPatientMedicalHistory(): Promise<GetMedicalHistoryResult> {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get patient data
    const patient = await prisma.patient.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Get medical history with related data
    const medicalHistory = await prisma.medicalHistory.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        doctor: {
          include: {
            user: true,
            hospital: {
              select: {
                name: true,
              },
            },
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: [
        {
          status: "asc", // Active conditions first
        },
        {
          diagnosedDate: "desc", // Most recent first
        },
        {
          createdAt: "desc",
        },
      ],
    });

    // Transform the data
    const transformed: MedicalHistoryItem[] = medicalHistory.map((item) => ({
      id: item.id,
      title: item.title,
      condition: item.condition,
      status: item.status,
      diagnosedDate: item.diagnosedDate?.toISOString() || null,
      details: item.details,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      doctor: item.doctor
        ? {
            id: item.doctor.id,
            name: item.doctor.user.name,
            specialization: item.doctor.specialization,
            hospital: item.doctor.hospital
              ? {
                  name: item.doctor.hospital.name,
                }
              : undefined,
          }
        : null,
      createdBy: {
        id: item.createdByUser.id,
        name: item.createdByUser.name,
        role: item.createdByUser.role,
      },
    }));

    return {
      success: true,
      history: transformed,
    };
  } catch (error) {
    console.error("Error fetching medical history:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors du chargement de l'historique médical",
    };
  }
}
