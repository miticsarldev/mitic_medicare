import { AppointmentStatus, AppointmentType } from "@prisma/client";

export type Attachment = {
    id: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: Date;
};

export type Prescription = {
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    isActive: boolean;
    startDate: Date;
    endDate: Date;
};

export type MedicalRecord = {
    id: string;
    diagnosis: string | null;
    treatment: string | null;
    notes: string | null;
    followUpNeeded: boolean | null;
    followUpDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    attachments: Attachment[];
    prescriptions: Prescription[];
};

export type Patient = {
    id: string;
    name: string;
    gender: string;
    email: string;
    phone: string;
    bloodType: string;
    allergies: string;
    medicalNotes: string;
};

export type Doctor = {
    id: string;
    name: string;
    specialization: string | null;
    department: string;
};

export type Appointment = {
    id: string;
    scheduledAt: Date;
    status: AppointmentStatus;
    type: AppointmentType;
    reason: string | null;
    doctor: Doctor;
    patient: Patient;
    medicalRecord: MedicalRecord | null;
};

export type AppointmentsResponse = {
    appointments: Appointment[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

export type UpdateAppointmentData = {
    appointmentId: string;
    action: "confirm" | "canceled" | "complete";
    medicalRecord?: {
        diagnosis: string;
        treatment: string;
        notes: string;
        followUpNeeded: boolean;
        followUpDate?: Date;
        attachments?: Omit<Attachment, "id" | "uploadedAt">[];
        prescriptions?: Omit<Prescription, "id">[];
    };
};