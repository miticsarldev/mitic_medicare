export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  Prisma,
  SubscriberType,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorId = params.id;

    // Get doctor details
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            isApproved: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            profile: {
              select: {
                address: true,
                city: true,
                state: true,
                zipCode: true,
                country: true,
                avatarUrl: true,
                genre: true,
                bio: true,
              },
            },
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
            city: true,
            subscription: {
              select: {
                plan: true,
              },
            },
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            subscriberType: true,
          },
        },
        _count: {
          select: {
            appointments: true,
            availabilities: true,
          },
        },
        appointments: {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            patient: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Calculate rating from reviews
    const reviews = await prisma.review.findMany({
      where: { doctorId },
      select: {
        rating: true,
      },
    });

    const avgRating =
      reviews.length > 0
        ? parseFloat(
            (
              reviews.reduce((acc, review) => acc + review.rating, 0) /
              reviews.length
            ).toFixed(1)
          )
        : 0;

    return NextResponse.json({
      ...doctor,
      avgRating,
    });
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorId = params.id;
    const data = await request.json();

    // Fetch doctor by doctor.id (NOT user.id), include linked user & subscription
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true, subscription: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const isIndependent =
      typeof data.isIndependent === "boolean"
        ? data.isIndependent
        : doctor.isIndependent;

    const hospitalId = isIndependent ? null : (data.hospitalId ?? null);
    const verified = !!data.verified;

    // Build user update (hash only if password provided)
    const userUpdate: Prisma.UserUpdateInput = {
      name: data.name ?? doctor.user.name,
      email: data.email ?? doctor.user.email,
      phone: data.phone ?? doctor.user.phone,
      role: isIndependent
        ? UserRole.INDEPENDENT_DOCTOR
        : UserRole.HOSPITAL_DOCTOR,
      isActive: data.status ? data.status === "active" : doctor.user.isActive,
      isApproved:
        typeof data.isApproved === "boolean"
          ? data.isApproved
          : doctor.user.isApproved,
    };
    if (data.password) {
      userUpdate.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: { id: doctor.userId },
      data: userUpdate,
    });

    // Upsert profile
    await prisma.userProfile.upsert({
      where: { userId: doctor.userId },
      update: {
        address: data.address ?? undefined,
        city: data.location ?? undefined,
        state: data.state ?? undefined,
        zipCode: data.zipCode ?? undefined,
        country: data.country ?? undefined,
        bio: data.bio ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
        genre: data.genre ?? undefined,
      },
      create: {
        userId: doctor.userId,
        address: data.address ?? null,
        city: data.location ?? null,
        state: data.state ?? null,
        zipCode: data.zipCode ?? null,
        country: data.country ?? null,
        bio: data.bio ?? null,
        avatarUrl: data.avatarUrl ?? null,
        genre: data.genre ?? null,
      },
    });

    // Update doctor
    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        specialization:
          data.specialty ?? data.specialization ?? doctor.specialization,
        hospitalId,
        licenseNumber: data.licenseNumber ?? doctor.licenseNumber,
        departmentId: data.departmentId ?? null, // if you pass plain id
        education: data.education ?? doctor.education,
        experience: data.experience ?? doctor.experience,
        consultationFee: data.consultationFee ?? doctor.consultationFee,
        isIndependent,
        isVerified: verified,
      },
    });

    // Subscription management
    if (isIndependent) {
      const plan: SubscriptionPlan | undefined = data.subscription;
      if (plan) {
        if (doctor.subscription) {
          // Update existing doctor-level subscription
          await prisma.subscription.update({
            where: { id: doctor.subscription.id },
            data: {
              subscriberType: SubscriberType.DOCTOR,
              plan: plan,
              status: SubscriptionStatus.ACTIVE,
            },
          });
        } else {
          // Create if missing
          await prisma.subscription.create({
            data: {
              subscriberType: SubscriberType.DOCTOR,
              doctorId: doctorId,
              plan: plan,
              status: SubscriptionStatus.ACTIVE,
              startDate: new Date(),
              endDate: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
              ),
              currency: "XOF",
              autoRenew: true,
              amount: new Prisma.Decimal(0),
            },
          });
        }
      }
    } else if (doctor.subscription) {
      // If switching to hospital doctor, remove doctor-level subscription (optional policy)
      await prisma.subscription.delete({
        where: { id: doctor.subscription.id },
      });
    }

    revalidatePath("/dashboard/superadmin/users/doctors");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return NextResponse.json(
      { error: "Failed to update doctor" },
      { status: 500 }
    );
  }
}

// export async function DELETE(
//   _req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "SUPER_ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const id = params.id;

//     // Accept either doctor.id or user.id
//     let doc = await prisma.doctor.findUnique({
//       where: { id },
//       select: { id: true, userId: true },
//     });

//     if (!doc) {
//       doc = await prisma.doctor.findFirst({
//         where: { userId: id },
//         select: { id: true, userId: true },
//       });
//       if (!doc) {
//         return NextResponse.json(
//           { error: "Doctor not found" },
//           { status: 404 }
//         );
//       }
//     }

//     const doctorId = doc.id;
//     const userId = doc.userId;

//     // Single interactive transaction: delete children → doctor → profile → user
//     await prisma.$transaction(async (tx) => {
//       await tx.review.deleteMany({ where: { doctorId } });
//       await tx.appointment.deleteMany({ where: { doctorId } });
//       await tx.doctorAvailability.deleteMany({ where: { doctorId } });
//       await tx.subscription.deleteMany({ where: { doctorId } });

//       await tx.doctor.delete({ where: { id: doctorId } });

//       // In case profile isn't present or FK already cascades, ignore error
//       await tx.userProfile
//         .delete({ where: { userId } })
//         .catch(() => Promise.resolve());

//       await tx.user.delete({ where: { id: userId } });
//     });

//     revalidatePath("/dashboard/superadmin/users/doctors");

//     return NextResponse.json({ success: true });
//   } catch (err: unknown) {
//     if (
//       err instanceof Prisma.PrismaClientKnownRequestError &&
//       err.code === "P2003"
//     ) {
//       return NextResponse.json(
//         {
//           error:
//             "Impossible de supprimer ce médecin car des données associées existent (rendez-vous, dossiers, avis, etc.). " +
//             "Désactivez le compte ou supprimez d'abord les dépendances.",
//         },
//         { status: 409 }
//       );
//     }

//     console.error("Error deleting doctor:", err);
//     return NextResponse.json(
//       { error: "Failed to delete doctor" },
//       { status: 500 }
//     );
//   }
// }

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Accept doctor.id or user.id
    let doc = await prisma.doctor.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!doc) {
      doc = await prisma.doctor.findFirst({
        where: { userId: id },
        select: { id: true, userId: true },
      });
      if (!doc)
        return NextResponse.json(
          { error: "Doctor not found" },
          { status: 404 }
        );
    }

    const doctorId = doc.id;
    const userId = doc.userId;
    const fallbackAuthorId = session.user.id; // reassign createdBy here

    await prisma.$transaction(async (tx) => {
      // 1) Reviews about this doctor + reviews authored by this user
      await tx.review.deleteMany({
        where: { OR: [{ doctorId }, { authorId: userId }] },
      });

      // 2) Prescriptions first (they point to PrescriptionOrder/MedicalRecord)
      await tx.prescription.deleteMany({ where: { doctorId } });

      // 3) Prescription orders next (they point to MedicalRecord)
      await tx.prescriptionOrder.deleteMany({ where: { doctorId } });

      // 4) Medical records (attachments cascade)
      await tx.medicalRecord.deleteMany({ where: { doctorId } });

      // 5) Availabilities (cascade exists, but explicit keeps intent clear)
      await tx.doctorAvailability.deleteMany({ where: { doctorId } });

      // 6) Independent subscription (hospital subs don’t have doctorId)
      await tx.subscription.deleteMany({ where: { doctorId } });

      // 7) Reassign non-nullable MedicalHistory.createdBy -> fallback user
      await tx.medicalHistory.updateMany({
        where: { createdBy: userId },
        data: { createdBy: fallbackAuthorId },
      });

      // 8) Delete the doctor row
      await tx.doctor.delete({ where: { id: doctorId } });

      // 9) Finally delete the user (profile/accounts/sessions join tables cascade)
      await tx.user.delete({ where: { id: userId } });
    });

    revalidatePath("/dashboard/superadmin/users/doctors");

    return NextResponse.json({ success: true });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer ce médecin car des données associées existent. " +
            "Les références ont peut-être été créées par d’autres objets. Réessayez ou contactez l’admin.",
        },
        { status: 409 }
      );
    }
    console.error("Error deleting doctor:", err);
    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 }
    );
  }
}
