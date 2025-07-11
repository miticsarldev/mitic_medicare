export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== UserRole.INDEPENDENT_DOCTOR) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Récupérer le médecin indépendant
        const doctor = await prisma.doctor.findUnique({
            where: { 
                userId: session.user.id,
                user: {
                    role: UserRole.INDEPENDENT_DOCTOR
                }
            },
            include: {
                availabilities: true,
                user: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        // Formater les disponibilités par jour
        const formattedAvailabilities = dayNames.map((dayName, index) => {
            const dayAvailability = doctor.availabilities.find(a => a.dayOfWeek === index);
            
            return {
                day: dayName,
                dayOfWeek: index,
                availability: dayAvailability ? {
                    id: dayAvailability.id,
                    startTime: dayAvailability.startTime,
                    endTime: dayAvailability.endTime,
                    slotDuration: dayAvailability.slotDuration,
                    isActive: dayAvailability.isActive
                } : null
            };
        });

        return NextResponse.json({
            doctor: {
                id: doctor.id,
                name: doctor.user.name,
                specialization: doctor.specialization
            },
            availabilities: formattedAvailabilities
        });
    } catch (error) {
        console.error("Error fetching doctor availabilities:", error);
        return NextResponse.json(
            { error: "Failed to fetch availabilities" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== UserRole.INDEPENDENT_DOCTOR) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { dayOfWeek, startTime, endTime, slotDuration } = body;

        // Validation des données
        if (dayOfWeek === undefined || !startTime || !endTime || !slotDuration) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Vérifier que l'heure de fin est après l'heure de début
        if (new Date(`1970-01-01T${endTime}`) <= new Date(`1970-01-01T${startTime}`)) {
            return NextResponse.json(
                { error: "End time must be after start time" },
                { status: 400 }
            );
        }

        // Récupérer le médecin
        const doctor = await prisma.doctor.findUnique({
            where: { 
                userId: session.user.id,
                user: {
                    role: UserRole.INDEPENDENT_DOCTOR
                }
            }
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        // Vérifier s'il existe déjà une disponibilité pour ce jour
        const existingAvailability = await prisma.doctorAvailability.findFirst({
            where: {
                doctorId: doctor.id,
                dayOfWeek: parseInt(dayOfWeek)
            }
        });

        if (existingAvailability) {
            return NextResponse.json(
                { error: "Availability already exists for this day" },
                { status: 400 }
            );
        }

        // Créer la nouvelle disponibilité
        const newAvailability = await prisma.doctorAvailability.create({
            data: {
                doctorId: doctor.id,
                dayOfWeek: parseInt(dayOfWeek),
                startTime,
                endTime,
                slotDuration: parseInt(slotDuration),
                isActive: true
            }
        });

        return NextResponse.json(newAvailability, { status: 201 });
    } catch (error) {
        console.error("Error creating availability:", error);
        return NextResponse.json(
            { error: "Failed to create availability" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== UserRole.INDEPENDENT_DOCTOR) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, startTime, endTime, slotDuration, isActive } = body;

        
        if (!id || !startTime || !endTime || !slotDuration || isActive === undefined) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

       
        if (new Date(`1970-01-01T${endTime}`) <= new Date(`1970-01-01T${startTime}`)) {
            return NextResponse.json(
                { error: "End time must be after start time" },
                { status: 400 }
            );
        }

        
        const doctor = await prisma.doctor.findUnique({
            where: { 
                userId: session.user.id,
                user: {
                    role: UserRole.INDEPENDENT_DOCTOR
                }
            }
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        const availability = await prisma.doctorAvailability.findUnique({
            where: { id }
        });

        if (!availability || availability.doctorId !== doctor.id) {
            return NextResponse.json(
                { error: "Availability not found or not owned by doctor" },
                { status: 404 }
            );
        }

        // Mettre à jour la disponibilité
        const updatedAvailability = await prisma.doctorAvailability.update({
            where: { id },
            data: {
                startTime,
                endTime,
                slotDuration: parseInt(slotDuration),
                isActive
            }
        });

        return NextResponse.json(updatedAvailability);
    } catch (error) {
        console.error("Error updating availability:", error);
        return NextResponse.json(
            { error: "Failed to update availability" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== UserRole.INDEPENDENT_DOCTOR) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Availability ID is required" },
                { status: 400 }
            );
        }

        
        const doctor = await prisma.doctor.findUnique({
            where: { 
                userId: session.user.id,
                user: {
                    role: UserRole.INDEPENDENT_DOCTOR
                }
            }
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        const availability = await prisma.doctorAvailability.findUnique({
            where: { id }
        });

        if (!availability || availability.doctorId !== doctor.id) {
            return NextResponse.json(
                { error: "Availability not found or not owned by doctor" },
                { status: 404 }
            );
        }

        // Supprimer la disponibilité
        await prisma.doctorAvailability.delete({
            where: { id }
        });

        return NextResponse.json(
            { message: "Availability deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting availability:", error);
        return NextResponse.json(
            { error: "Failed to delete availability" },
            { status: 500 }
        );
    }
}