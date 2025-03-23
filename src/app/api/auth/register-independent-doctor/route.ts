import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/hash";
import prisma from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      speciality,
      licenseNumber,
    } = await req.json();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !speciality ||
      !licenseNumber
    ) {
      return NextResponse.json(
        { error: "Tous les champs sont requis." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email déjà utilisé." },
        { status: 400 }
      );
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      return NextResponse.json(
        { error: "Numéro de téléphone déjà utilisé." },
        { status: 400 }
      );
    }

    const existingLicenseNumber = await prisma.doctor.findFirst({
      where: { licenseNumber },
    });
    if (existingLicenseNumber) {
      return NextResponse.json(
        { error: "Numéro de licence déjà utilisé." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const name = `${firstName} ${lastName}`.trim();
    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          phone,
          password: hashedPassword,
          role: "INDEPENDENT_DOCTOR",
          profile: { create: {} },
        },
      });

      await tx.doctor.create({
        data: {
          userId: user.id,
          specialization: speciality,
          licenseNumber,
          isIndependent: true,
        },
      });

      return user;
    });

    // Send verification email
    const token = await generateVerificationToken(normalizedEmail);

    await sendVerificationEmail(
      newUser.name,
      normalizedEmail,
      token.token,
      "INDEPENDENT_DOCTOR"
    );

    return NextResponse.json(
      { message: "Médecin indépendant enregistré.", user: newUser },
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
