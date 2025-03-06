import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/utils/hash";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      hospitalName,
      hospitalPhone,
      hospitalAddress,
      hospitalCity,
      hospitalPostalCode,
      hospitalCountry,
    } = await req.json();

    if (!email || !password || !firstName || !lastName || !hospitalName) {
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

    // Step 1: Create the user first
    const newUser = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role: "hospital_admin",
        userProfile: {
          create: {
            phone: phoneNumber,
            institutionType: "hospital",
          },
        },
      },
    });

    // Step 2: Create the hospital and set `adminId` manually
    const newHospital = await prisma.hospital.create({
      data: {
        name: hospitalName,
        address: hospitalAddress,
        city: hospitalCity,
        state: "",
        zipCode: hospitalPostalCode,
        country: hospitalCountry,
        phone: hospitalPhone,
        email: "",
        adminId: newUser.id, // Assigning the created user as admin
      },
    });

    return NextResponse.json(
      {
        message: "Administrateur d'hôpital enregistré avec succès.",
        user: newUser,
        hospital: newHospital,
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
