import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/hash";
import prisma from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";

function isAtLeast18YearsOld(dateString: string): boolean {
  const birthDate = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  return (
    age > 18 ||
    (age === 18 &&
      (m > 0 || (m === 0 && today.getDate() >= birthDate.getDate())))
  );
}

export async function POST(req: Request) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      genre,
      birthDate,
    } = await req.json();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phoneNumber ||
      !birthDate
    ) {
      return NextResponse.json(
        { error: "Tous les champs sont requis." },
        { status: 400 }
      );
    }

    // Vérification de l'âge
    if (!isAtLeast18YearsOld(birthDate)) {
      return NextResponse.json(
        { error: "Vous devez avoir au moins 18 ans pour vous inscrire." },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    const name = `${firstName} ${lastName}`.trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email déjà utilisé." },
        { status: 400 }
      );
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: phoneNumber },
    });

    if (existingPhone) {
      return NextResponse.json(
        { error: "Numéro de téléphone déjà utilisé." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone: phoneNumber,
        password: hashedPassword,
        dateOfBirth: new Date(birthDate),
        role: "PATIENT",
        profile: {
          create: {
            genre,
          },
        },
        patient: {
          create: {},
        },
      },
      include: {
        profile: true,
        patient: true,
      },
    });

    // Send verification email
    const token = await generateVerificationToken(normalizedEmail);
    await sendVerificationEmail(newUser.name, normalizedEmail, token.token);

    return NextResponse.json(
      {
        message:
          "Utilisateur enregistré avec succès. Vérifiez votre email pour confirmer votre compte.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
