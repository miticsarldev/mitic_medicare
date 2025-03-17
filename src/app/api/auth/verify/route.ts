import prisma from "@/lib/prisma";
import {
  InstitutionSubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from "@prisma/client";
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

  // should check for role
  // Assign Free Subscription to Patient (If not already assigned)
  if (role === "patient") {
    const existingSubscription = await prisma.patientSubscription.findFirst({
      where: { patientId: user?.patient?.id },
    });

    if (!existingSubscription) {
      await prisma.patientSubscription.create({
        data: {
          patientId: user.patient!.id!,
          plan: "free",
          status: "active",
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 3)
          ),
        },
      });
    }
  } else if (role === "independent_doctor") {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: user?.id },
    });

    const existingSubscription =
      await prisma.independantDoctorSubscription.findFirst({
        where: { doctorId: doctor?.id },
      });

    if (!existingSubscription && doctor) {
      await prisma.independantDoctorSubscription.create({
        data: {
          doctorId: doctor?.id,
          plan: "free",
          status: "active",
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
        },
      });
    }
  } else if (role === "hospital_admin") {
    // Implementation of the institution subscription
    const userInstitution = await prisma.institution.findUnique({
      where: { adminId: user?.id },
    });

    const institutionId = userInstitution?.id;

    if (institutionId) {
      const existingSubscription =
        await prisma.institutionSubscription.findFirst({
          where: { institutionId },
        });

      if (!existingSubscription) {
        await prisma.institutionSubscription.create({
          data: {
            institutionId,
            plan: InstitutionSubscriptionPlan.free,
            status: SubscriptionStatus.active,
            startDate: new Date(),
            endDate: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ),
          },
        });
      }
    }
  }

  // Set expires token after verification
  await prisma.verificationToken.update({
    where: { token },
    data: { expires: new Date() },
  });

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
