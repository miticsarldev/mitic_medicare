import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/utils/hash";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password, specialization, licenseNumber } =
      await req.json();

    if (!email || !password || !name || !specialization || !licenseNumber) {
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

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "independent_doctor",
        Doctor: {
          create: {
            specialization,
            licenseNumber,
            institutionType: "independent_doctor",
          },
        },
      },
    });

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
