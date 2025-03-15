import { sendVerificationEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/token";
import { UserRole, VerificationToken } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, role } = await req.json();

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

  // Token not found
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

  // Find the user based on the extracted email
  const user = await prisma.user.findUnique({
    where: { email: verificationToken!.identifier },
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

  // If user is already verified, no need to resend a token
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

  // Check if a non-expired verification token already exists
  const existingToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: user.email,
      expires: { gt: new Date() }, // Token must still be valid
    },
  });

  let newToken: VerificationToken;
  if (!existingToken) {
    // Generate a new verification token if none exists
    newToken = await generateVerificationToken(user.email);
  } else {
    // Use the existing token if valid
    newToken = existingToken;
  }

  await sendVerificationEmail(
    user?.name,
    verificationToken.identifier,
    newToken.token,
    role as UserRole
  );

  return NextResponse.json(
    {
      message:
        "Un nouveau lien de vérification a été envoyé à votre adresse email.",
    },
    { status: 201 }
  );
}
