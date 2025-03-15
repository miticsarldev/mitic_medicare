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
      institutionName,
      institutionType,
      institutionPhone,
      institutionEmail,
      institutionAddress,
      institutionCity,
      institutionState,
      institutionZipCode,
      institutionCountry,
    } = await req.json();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !speciality ||
      !licenseNumber ||
      !institutionName ||
      !institutionType ||
      !institutionPhone ||
      !institutionEmail ||
      !institutionAddress ||
      !institutionCity ||
      !institutionState ||
      !institutionZipCode ||
      !institutionCountry
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

    const existingPhone = await prisma.userProfile.findFirst({
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

    // Check for existing hospital by email or phone number or name
    const existingInstitution = await prisma.institution.findFirst({
      where: {
        name: {
          equals: institutionName.toLowerCase(),
          mode: "insensitive",
        },
      },
    });
    if (existingInstitution) {
      return NextResponse.json(
        { error: "Nom de l'institution déjà utilisé." },
        { status: 400 }
      );
    }

    const existingInstitutionEmail = await prisma.institution.findFirst({
      where: {
        email: institutionEmail,
      },
    });
    if (existingInstitutionEmail) {
      return NextResponse.json(
        { error: "Adresse e-mail de l'institution déjà utilisée." },
        { status: 400 }
      );
    }

    const existingInstitutionPhone = await prisma.institution.findFirst({
      where: {
        phone: institutionPhone,
      },
    });
    if (existingInstitutionPhone) {
      return NextResponse.json(
        { error: "Numéro de téléphone de l'institution déjà utilisé." },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();
    const adminName = `${firstName} ${lastName}`.trim();

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Step 1: Create the user first
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: adminName,
          email: normalizedEmail,
          password: hashedPassword,
          role: "hospital_admin",
          userProfile: {
            create: {
              phone,
              institutionType,
            },
          },
        },
      });

      await tx.institution.create({
        data: {
          adminId: user.id,
          name: institutionName,
          type: institutionType,
          phone: institutionPhone,
          email: institutionEmail,
          address: institutionAddress,
          city: institutionCity,
          state: institutionState,
          zipCode: institutionZipCode,
          country: institutionCountry,
        },
      });

      await tx.doctor.create({
        data: {
          userId: user.id,
          specialization: speciality,
          licenseNumber,
        },
      });

      return user;
    });

    // Send verification email
    const token = await generateVerificationToken(normalizedEmail);
    await sendVerificationEmail(
      adminName,
      normalizedEmail,
      token.token,
      "hospital_admin",
      institutionName
    );

    return NextResponse.json(
      {
        message: "Institution et son administrateur enregistré avec succès.",
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
