"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AppointmentStatus, BloodType, UserGenre } from "@prisma/client";
import { PatientOverviewData } from "./types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { compare, hash } from "bcryptjs";

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
      take: 5,
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

    return {
      patient: patient ?? {},
      nextAppointment: transformedNextAppointment ?? null,
      recentAppointments: transformedRecentAppointments ?? [],
      latestMedicalRecord: transformedLatestMedicalRecord ?? null,
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

export async function getPatientAppointments({
  status,
  search,
  page = 1,
  limit = 10,
}: {
  status?: AppointmentStatus | AppointmentStatus[];
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  try {
    // For demo purposes, if no patientId is provided, we'll use a mock ID
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

    // Calculate pagination
    const skip = (page - 1) * limit;

    console.log(where);

    // Get total count for pagination
    const totalCount = await prisma.appointment.count({ where });
    console.log(totalCount);

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
    await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELED",
        cancelledAt: new Date(),
        cancellationReason: reason || "Cancelled by patient",
        notes: notes ? `${notes}\n\nCancellation notes: ${notes}` : undefined,
      },
    });

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
    };
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw new Error("Failed to fetch appointment details");
  }
}

export async function getPatientMedicalRecords() {
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
        prescriptions: true,
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to a more usable format
    return medicalRecords.map((record) => ({
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
      medications: record.prescriptions.map((prescription) => ({
        id: prescription.id,
        name: prescription.medicationName,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration || "Non spécifié",
        isActive: prescription.isActive,
      })),
      documents: record.attachments.map((attachment) => ({
        id: attachment.id,
        name: attachment.fileName,
        type: getDocumentType(attachment.fileType),
        url: attachment.fileUrl,
        size: formatFileSize(attachment.fileSize),
        uploadedAt: attachment.uploadedAt.toISOString(),
      })),
    }));
  } catch (error) {
    console.error("Error fetching patient medical records:", error);
    return [];
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
        prescriptions: true,
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
      medications: record.prescriptions.map((prescription) => ({
        id: prescription.id,
        name: prescription.medicationName,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration || "Non spécifié",
        isActive: prescription.isActive,
      })),
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
        const review = await prisma.doctorReview.findFirst({
          where: {
            doctorId: appointment.doctorId,
            patientId: patient.id,
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
          not: null,
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
      const doctorReview = await prisma.doctorReview.create({
        data: {
          doctorId: data.doctorId,
          patientId: patient.id,
          rating: data.rating,
          comment: data.comment || "",
          isAnonymous: data.isAnonymous,
          isApproved: false, // Requires approval
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

    // Get doctor reviews (DoctorReview model)
    const doctorReviews = await prisma.doctorReview.findMany({
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get hospital reviews (Review model)
    const hospitalReviews = await prisma.review.findMany({
      where: {
        authorId: userId,
        targetType: "HOSPITAL",
      },
      include: {
        hospital: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format doctor reviews
    const formattedDoctorReviews = doctorReviews.map((review) => ({
      id: review.id,
      type: "doctor" as const,
      name: review.doctor.user.name,
      specialty: review.doctor.specialization,
      rating: review.rating,
      date: review.createdAt.toLocaleDateString("fr-FR"),
      comment: review.comment || "",
      image:
        review.doctor.user.profile?.avatarUrl ||
        "/placeholder.svg?height=40&width=40",
      status: review.isApproved ? "APPROVED" : "PENDING",
    }));

    // Format hospital reviews
    const formattedHospitalReviews = hospitalReviews.map((review) => ({
      id: review.id,
      type: "hospital" as const,
      title: review.title,
      name: review.hospital?.name || "Établissement",
      specialty: review.hospital?.status || "Hôpital",
      rating: review.rating,
      date: review.createdAt.toLocaleDateString("fr-FR"),
      comment: review.content,
      image: review.hospital?.logoUrl || "/placeholder.svg?height=40&width=40",
      status: review.status,
    }));

    // Combine both types of reviews
    return [...formattedDoctorReviews, ...formattedHospitalReviews];
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

    // First try to find and delete a DoctorReview
    const doctorReview = await prisma.doctorReview.findFirst({
      where: {
        id: reviewId,
        patientId: patient.id,
      },
    });

    if (doctorReview) {
      await prisma.doctorReview.delete({
        where: {
          id: reviewId,
        },
      });

      revalidatePath("/dashboard/patient/reviews/my-feedback");
      return { success: true };
    }

    // If not found, try to find and delete a Review
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        authorId: userId,
      },
    });

    if (review) {
      // Delete review responses first (due to foreign key constraints)
      await prisma.reviewResponse.deleteMany({
        where: {
          reviewId: reviewId,
        },
      });

      // Delete the review
      await prisma.review.delete({
        where: {
          id: reviewId,
        },
      });

      revalidatePath("/dashboard/patient/reviews/my-feedback");
      return { success: true };
    }

    throw new Error("Review not found or does not belong to the patient");
  } catch (error) {
    console.error("Error deleting review:", error);
    throw new Error("Failed to delete review");
  }
}
