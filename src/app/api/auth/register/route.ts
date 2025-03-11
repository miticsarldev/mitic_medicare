import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/hash";
import prisma from "@/lib/prisma";
// import { generateVerificationToken } from "@/lib/token";

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

    const existingPhone = await prisma.userProfile.findFirst({
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
        password: hashedPassword,
        role: "patient",
        userProfile: {
          create: {
            phone: phoneNumber,
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
        userProfile: true,
        patient: true,
      },
    });

    // Send verification email
    //   const token = generateVerificationToken(normalizedEmail);
    // await sendVerificationEmail(normalizedEmail, token);

    return NextResponse.json(
      { message: "Utilisateur enregistré avec succès.", user: newUser },
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
