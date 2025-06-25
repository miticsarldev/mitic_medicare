import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Quotas de patients par type d'abonnement
const PATIENT_QUOTAS = {
    FREE: 100,
    BASIC: 250,
    STANDARD: 500,
    PREMIUM: 1000,
    ENTERPRISE: Infinity
};

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = params;

        // 1. Récupérer le rendez-vous avec toutes les relations nécessaires
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: {
                    include: {
                        user: true,
                        appointments: {
                            where: {
                                status: "CONFIRMED",
                                NOT: { id } // Exclure le rdv actuel
                            }
                        }
                    }
                },
                hospital: {
                    include: {
                        subscription: true,
                        appointments: {
                            where: { status: "CONFIRMED" },
                            include: { patient: true }
                        }
                    }
                }
            }
        });

        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        // 2. Vérifier l'abonnement de l'hôpital
        if (!appointment.hospital?.subscription) {
            return NextResponse.json(
                { error: "Hospital subscription required" },
                { status: 403 }
            );
        }

        const currentDate = new Date();
        if (appointment.hospital.subscription.endDate < currentDate ||
            appointment.hospital.subscription.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: "Hospital subscription expired or inactive" },
                { status: 403 }
            );
        }

        // 3. Vérifier si le patient a déjà eu des rendez-vous confirmés
        const isExistingPatient = appointment.patient.appointments.length > 0;

        if (!isExistingPatient) {
            // 4. Calculer le quota seulement pour les nouveaux patients
            const uniquePatients = new Set(
                appointment.hospital.appointments
                    .filter(a => a.status === "CONFIRMED")
                    .map(a => a.patient.id)
            );

            const quota = PATIENT_QUOTAS[appointment.hospital.subscription.plan];

            if (uniquePatients.size >= quota) {
                let message = "";
                if (quota === Infinity) {
                    message = "Unexpected error: Please contact support";
                } else {
                    message = `Patient quota reached: Your ${appointment.hospital.subscription.plan} plan allows maximum ${quota} unique patients. `;
                    message += `You currently have ${uniquePatients.size} patients. `;
                    message += "Please upgrade your subscription to add more patients.";
                }

                return NextResponse.json(
                    { error: message },
                    { status: 403 }
                );
            }
        }

        // 5. Mettre à jour le rendez-vous et créer le patient si nécessaire
        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status: "CONFIRMED" }
        });

        return NextResponse.json({
            success: true,
            appointment: updatedAppointment,
        });

    } catch (error) {
        console.error("Error confirming appointment:", error);
        return NextResponse.json(
            { error: "Failed to confirm appointment" },
            { status: 500 }
        );
    }
}