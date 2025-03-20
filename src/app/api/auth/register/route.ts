import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/hash";
import prisma from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, phoneNumber, genre } =
      await req.json();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phoneNumber ||
      genre
    ) {
      return NextResponse.json(
        { error: "Tous les champs sont requis." },
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
        role: "PATIENT",
        profile: {
          create: {
            genre,
          },
        },
        patient: {
          create: {
            dateOfBirth: new Date(),
          },
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
