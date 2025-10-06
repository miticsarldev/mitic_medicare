import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/hash";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      phone,
      password,
      specialization,
      licenseNumber,
      hospitalId,
    } = await req.json();

    if (
      !email ||
      !phone ||
      !password ||
      !name ||
      !specialization ||
      !licenseNumber ||
      !hospitalId
    ) {
      return NextResponse.json(
        { error: "Tous les champs sont requis." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email déjà utilisé." },
        { status: 400 }
      );
    }

    // Check if user already exists by phone
    const existingUserByPhone = await prisma.user.findUnique({
      where: { phone },
    });
    if (existingUserByPhone) {
      return NextResponse.json(
        { error: "Numéro de téléphone déjà utilisé." },
        { status: 400 }
      );
    }

    // Check if the hospital exists
    const hospitalExists = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });
    if (!hospitalExists) {
      return NextResponse.json(
        { error: "L'hôpital spécifié n'existe pas." },
        { status: 400 }
      );
    }

    // Check if license number is already used
    const existingLicense = await prisma.doctor.findFirst({
      where: { licenseNumber },
    });
    if (existingLicense) {
      return NextResponse.json(
        { error: "N° Ordre de Médecins déjà utilisé." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Step 1: Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "HOSPITAL_DOCTOR",
        profile: {
          create: {},
        },
      },
    });

    // Step 2: Create the doctor profile and associate it with the hospital
    const newDoctor = await prisma.doctor.create({
      data: {
        userId: newUser.id,
        specialization,
        licenseNumber,
        isIndependent: false,
        hospitalId,
      },
    });

    return NextResponse.json(
      {
        message: "Médecin hospitalier enregistré avec succès.",
        user: newUser,
        doctor: newDoctor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur d'inscription du médecin:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
