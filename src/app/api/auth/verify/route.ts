import { sendVerificationPendingEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const role = searchParams.get("role") as UserRole | null;

  // missing state
  if (!token || !role) {
    return NextResponse.json(
      { error: "Token manquant." },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  // Find token in database
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  // invalid state
  if (!verificationToken) {
    return NextResponse.json(
      { error: "Token invalide." },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: verificationToken!.identifier },
    include: { patient: true },
  });

  // error state
  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  // If the user is already verified, return a message and do not proceed further
  // already_verified state
  if (user.emailVerified) {
    return NextResponse.json(
      { error: "Votre adresse email est déjà vérifiée." },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  // expired state
  if (verificationToken.expires < new Date()) {
    return NextResponse.json(
      { error: "Token expiré." },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  // Update user to mark email as verified
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Set expires token after verification
  await prisma.verificationToken.update({
    where: { token },
    data: { expires: new Date() },
  });

  if (user.role === "HOSPITAL_ADMIN" || user.role === "INDEPENDENT_DOCTOR") {
    await sendVerificationPendingEmail({
      name: user.name,
      email: user.email,
      role: user.role,
      statusUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/auth`,
      helpUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/help`,
    });
  }

  // success state
  return NextResponse.json(
    {
      message:
        "Email confirmé avec succès ! Veuillez vous connecter pour continuer.",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
