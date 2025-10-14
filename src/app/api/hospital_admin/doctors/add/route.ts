export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json(
        {
          error:
            "Accès refusé : Vous devez être administrateur d'hôpital pour effectuer cette action",
        },
        { status: 401 }
      );
    }

    // Récupérer l'hôpital avec son abonnement
    const hospital = await prisma.hospital.findUnique({
      where: { adminId: session.user.id },
      include: {
        subscription: true,
        doctors: {
          select: { id: true },
        },
      },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hôpital non trouvé : Aucun hôpital associé à votre compte" },
        { status: 404 }
      );
    }

    // Vérification du quota
    const data = await req.json();
    const {
      name,
      email,
      phone,
      password,
      specialization,
      licenseNumber,
      education,
      experience,
      consultationFee,
      departmentId,
      address,
      city,
      state,
      zipCode,
      country,
      bio,
      avatarUrl,
      genre,
    } = data;

    // Validation des champs obligatoires
    const requiredFields = [
      "name",
      "email",
      "phone",
      "password",
      "specialization",
      "licenseNumber",
    ];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Champs manquants : ${missingFields.join(", ")} sont requis` },
        { status: 400 }
      );
    }

    // Vérification de l'unicité de l'email et du téléphone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      const conflictField = existingUser.email === email ? "email" : "phone";
      return NextResponse.json(
        {
          error: `${conflictField} déjà utilisé : Ce ${conflictField} est déjà associé à un compte existant`,
        },
        { status: 409 }
      );
    }

    // Vérification du N° Ordre des Médecins
    const existingDoctor = await prisma.doctor.findUnique({
      where: { licenseNumber },
    });

    if (existingDoctor) {
      return NextResponse.json(
        {
          error:
            "N° Ordre des Médecins déjà utilisé : Ce N° Ordre des Médecins médicale est déjà enregistré",
        },
        { status: 409 }
      );
    }

    // Vérification du département si fourni
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department || department.hospitalId !== hospital.id) {
        return NextResponse.json(
          {
            error:
              "Département invalide : Le département spécifié n'existe pas ou n'appartient pas à votre hôpital",
          },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Création transactionnelle pour garantir l'intégrité des données
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          emailVerified: null,
          role: "HOSPITAL_DOCTOR",
          isApproved: true, // Auto-approval pour les médecins créés par l'admin
        },
      });

      // 2. Créer le profil utilisateur
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          address: address || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null,
          country: country || null,
          bio: bio || null,
          avatarUrl: avatarUrl || null,
          genre: genre || null,
        },
      });

      // 3. Créer le médecin
      const doctor = await prisma.doctor.create({
        data: {
          userId: user.id,
          hospitalId: hospital.id,
          departmentId: departmentId || null,
          specialization,
          licenseNumber,
          education: education || null,
          experience: experience || null,
          consultationFee: consultationFee ? parseFloat(consultationFee) : null,
          isVerified: true,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      return doctor;
    });

    // Send verification email
    const token = await generateVerificationToken(email);
    await sendVerificationEmail(name, email, token.token);

    return NextResponse.json(
      {
        message: "Médecin créé avec succès",
        doctor: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création du médecin :", error);
    return NextResponse.json(
      {
        error:
          "Erreur serveur : Une erreur est survenue lors de la création du médecin",
      },
      { status: 500 }
    );
  }
}
