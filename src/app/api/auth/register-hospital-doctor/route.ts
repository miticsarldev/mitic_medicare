import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/hash";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, specialization, licenseNumber, hospitalId } =
      await req.json();

    if (
      !email ||
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

    // Check if the hospital exists
    const hospitalExists = await prisma.institution.findUnique({
      where: { id: hospitalId },
    });
    if (!hospitalExists) {
      return NextResponse.json(
        { error: "L'hôpital spécifié n'existe pas." },
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
        password: hashedPassword,
        role: "hospital_doctor",
        userProfile: {
          create: {
            institutionType: "hospital",
          },
        },
      },
    });

    // Step 2: Create the doctor profile and associate it with the hospital
    const newDoctor = await prisma.doctor.create({
      data: {
        userId: newUser.id,
        specialization,
        licenseNumber,
        institutionId: hospitalId, // ✅ Correct way to associate the doctor with a hospital
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
