export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Définir le nombre d'éléments par page
const ITEMS_PER_PAGE = 10;

export async function GET(request: Request) {
    try {
        // Vérifier la session utilisateur
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Récupérer les paramètres de requête depuis l'URL
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || ITEMS_PER_PAGE.toString(), 10);
        const searchQuery = searchParams.get('search') || '';

        // Valider les paramètres de pagination
        if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
            return NextResponse.json(
                { error: "Invalid pagination parameters" },
                { status: 400 }
            );
        }

        // Récupérer l'hôpital de l'utilisateur
        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            select: { id: true },
        });

        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        }

        // Calculer le skip pour la pagination
        const skip = (page - 1) * pageSize;

        // Conditions de recherche de base
        const whereClause = {
            hospitalId: hospital.id,
            ...(searchQuery && {
                name: {
                    contains: searchQuery,
                }
            })
        };

        // Récupérer les départements avec pagination, filtrage et count total
        const [departments, totalCount] = await Promise.all([
            prisma.department.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    _count: {
                        select: { doctors: true },
                    },
                },
                skip: skip,
                take: pageSize,
                orderBy: { name: 'asc' }, // Tri par nom par défaut
            }),
            prisma.department.count({
                where: whereClause,
            }),
        ]);

        // Formater les données de réponse
        const formattedDepartments = departments.map((department) => ({
            id: department.id,
            name: department.name,
            description: department.description || "No description",
            doctorCount: department._count.doctors,
        }));

        // Calculer le nombre total de pages
        const totalPages = Math.ceil(totalCount / pageSize);

        return NextResponse.json({ 
            departments: formattedDepartments,
            pagination: {
                currentPage: page,
                pageSize: pageSize,
                totalItems: totalCount,
                totalPages: totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            }
        });
    } catch (error) {
        console.error("Error fetching departments:", error);
        return NextResponse.json(
            { error: "Failed to fetch departments" },
            { status: 500 }
        );
    }
}