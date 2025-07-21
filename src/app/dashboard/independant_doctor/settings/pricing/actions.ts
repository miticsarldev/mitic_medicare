"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export type PaymentMethod = "MOBILE_MONEY" | "CREDIT_CARD";

export interface PaymentFormData {
  method: PaymentMethod;
  // Pour Mobile Money
  phoneNumber?: string;
  // Pour Carte bancaire
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

export type SubscriptionStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "TRIAL"
  | "EXPIRED"
  | "PENDING";
export type SubscriptionPlan = "FREE" | "STANDARD" | "PREMIUM";
export type SubscriberType = "DOCTOR" | "HOSPITAL";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  status: PaymentStatus;
  paymentDate: Date;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  subscriberType: SubscriberType;
  doctorId?: string;
  hospitalId?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  amount: number;
  currency: string;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
  payments: SubscriptionPayment[];
}

export interface Doctor {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  subscription?: Subscription;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getDoctorSubscription(): Promise<
  ActionResult<Subscription | null>
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Récupérer le docteur avec son abonnement unique
    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    const subscription = await prisma.subscription.findUnique({
      where: {
        doctorId: doctor?.id,
      },
      include: {
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },
      },
    });

    return {
      success: true,
      data: subscription as Subscription | null,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'abonnement:", error);
    return {
      success: false,
      error: "Impossible de récupérer l'abonnement",
    };
  }
}

export async function getSubscriptionPayments(): Promise<
  ActionResult<SubscriptionPayment[]>
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Récupérer le docteur avec son abonnement et ses paiements
    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        subscription: {
          include: {
            payments: {
              orderBy: {
                paymentDate: "desc",
              },
            },
          },
        },
      },
    });

    if (!doctor || !doctor.subscription) {
      return {
        success: true,
        data: [],
      };
    }

    return {
      success: true,
      data: doctor.subscription.payments as unknown as SubscriptionPayment[],
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements:", error);
    return {
      success: false,
      error: "Impossible de récupérer l'historique des paiements",
    };
  }
}

// export async function createOrUpdateSubscription(
//   plan: SubscriptionPlan
// ): Promise<ActionResult<Subscription>> {
//     const session = await getServerSession(authOptions);

//   if (!session?.user?.id) {
//     throw new Error("Unauthorized");
//   }

//   try {
//     // Récupérer le docteur

//     const doctor = await prisma.doctor.findUnique({
//       where: {
//         userId: session.user.id,
//       },
//       include: {
//         subscription: true,
//       },
//     });

//     if (!doctor) {
//       return {
//         success: false,
//         error: "Profil médecin non trouvé",
//       };
//     }

//     // Définir les prix des plans
//     const planPrices: Record<SubscriptionPlan, number> = {
//       FREE: 0,
//       STANDARD: 49.99,
//       PREMIUM: 99.99,
//     };

//     const amount = planPrices[plan];
//     const startDate = new Date();
//     const endDate = new Date();
//     endDate.setMonth(endDate.getMonth() + 1);

//     let subscription: Subscription;

//     if (doctor.subscription) {
//       // Mettre à jour l'abonnement existant
//       subscription = (await prisma.subscription.update({
//         where: {
//           id: doctor.subscription.id,
//         },
//         data: {
//           plan,
//           status: plan === "FREE" ? "ACTIVE" : "ACTIVE",
//           startDate,
//           endDate,
//           amount,
//           currency: "EUR",
//           updatedAt: new Date(),
//         },
//         include: {
//           payments: {
//             orderBy: {
//               paymentDate: "desc",
//             },
//           },
//         },
//       })) as Subscription;
//     } else {
//       // Créer un nouvel abonnement
//       subscription = (await prisma.subscription.create({
//         data: {
//           doctorId: doctor.id,
//           subscriberType: "DOCTOR",
//           plan,
//           status: "ACTIVE",
//           startDate,
//           endDate,
//           amount,
//           currency: "EUR",
//           autoRenew: plan !== "FREE",
//         },
//         include: {
//           payments: {
//             orderBy: {
//               paymentDate: "desc",
//             },
//           },
//         },
//       })) as Subscription;
//     }

//     // Créer un paiement si ce n'est pas gratuit
//     if (plan !== "FREE") {
//       await prisma.subscriptionPayment.create({
//         data: {
//           subscriptionId: subscription.id,
//           amount,
//           currency: "EUR",
//           paymentMethod: "CREDIT_CARD",
//           status: "COMPLETED",
//           paymentDate: new Date(),
//           transactionId: `txn_${Date.now()}`,
//         },
//       });
//     }

//     return {
//       success: true,
//       data: subscription,
//       message: `Abonnement ${plan} ${doctor.subscription ? "mis à jour" : "créé"} avec succès`,
//     };
//   } catch (error) {
//     console.error(
//       "Erreur lors de la création/mise à jour de l'abonnement:",
//       error
//     );
//     return {
//       success: false,
//       error: "Impossible de traiter l'abonnement",
//     };
//   }
// }

// export async function renewSubscription(): Promise<ActionResult<Subscription>> {
//   const { userId } = await auth();

//   if (!userId) {
//     redirect("/sign-in");
//   }

//   try {
//     // Récupérer le docteur avec son abonnement
//     const doctor = await prisma.doctor.findUnique({
//       where: {
//         user: {
//           id: userId,
//         },
//       },
//       include: {
//         subscription: true,
//       },
//     });

//     if (!doctor || !doctor.subscription) {
//       return {
//         success: false,
//         error: "Aucun abonnement trouvé",
//       };
//     }

//     const subscription = doctor.subscription;

//     // Calculer la nouvelle date de fin (1 an à partir de la date de fin actuelle ou maintenant)
//     const currentEndDate = new Date(subscription.endDate);
//     const now = new Date();
//     const newStartDate = currentEndDate > now ? currentEndDate : now;
//     const newEndDate = new Date(newStartDate);
//     newEndDate.setFullYear(newEndDate.getFullYear() + 1);

//     // Mettre à jour l'abonnement
//     const updatedSubscription = (await prisma.subscription.update({
//       where: {
//         id: subscription.id,
//       },
//       data: {
//         status: "ACTIVE",
//         startDate: newStartDate,
//         endDate: newEndDate,
//         updatedAt: new Date(),
//       },
//       include: {
//         payments: {
//           orderBy: {
//             paymentDate: "desc",
//           },
//         },
//       },
//     })) as Subscription;

//     // Créer un nouveau paiement pour le renouvellement (sauf pour le plan gratuit)
//     if (subscription.plan !== "FREE") {
//       await prisma.subscriptionPayment.create({
//         data: {
//           subscriptionId: subscription.id,
//           amount: subscription.amount,
//           currency: subscription.currency,
//           paymentMethod: "CREDIT_CARD",
//           status: "COMPLETED",
//           paymentDate: new Date(),
//           transactionId: `renewal_${Date.now()}`,
//         },
//       });
//     }

//     return {
//       success: true,
//       data: updatedSubscription,
//       message: "Abonnement renouvelé avec succès",
//     };
//   } catch (error) {
//     console.error("Erreur lors du renouvellement:", error);
//     return {
//       success: false,
//       error: "Impossible de renouveler l'abonnement",
//     };
//   }
// }

// export async function toggleAutoRenewal(): Promise<ActionResult<Subscription>> {
//   const { userId } = await auth();

//   if (!userId) {
//     redirect("/sign-in");
//   }

//   try {
//     // Récupérer le docteur avec son abonnement
//     const doctor = await prisma.doctor.findUnique({
//       where: {
//         user: {
//           id: userId,
//         },
//       },
//       include: {
//         subscription: true,
//       },
//     });

//     if (!doctor || !doctor.subscription) {
//       return {
//         success: false,
//         error: "Aucun abonnement trouvé",
//       };
//     }

//     // Basculer le renouvellement automatique
//     const updatedSubscription = (await prisma.subscription.update({
//       where: {
//         id: doctor.subscription.id,
//       },
//       data: {
//         autoRenew: !doctor.subscription.autoRenew,
//         updatedAt: new Date(),
//       },
//       include: {
//         payments: {
//           orderBy: {
//             paymentDate: "desc",
//           },
//         },
//       },
//     })) as Subscription;

//     return {
//       success: true,
//       data: updatedSubscription,
//       message: `Renouvellement automatique ${updatedSubscription.autoRenew ? "activé" : "désactivé"}`,
//     };
//   } catch (error) {
//     console.error(
//       "Erreur lors de la modification du renouvellement automatique:",
//       error
//     );
//     return {
//       success: false,
//       error: "Impossible de modifier le renouvellement automatique",
//     };
//   }
// }

// export async function updateSubscriptionStatus(
//   status: "ACTIVE" | "INACTIVE" | "EXPIRED"
// ): Promise<ActionResult<Subscription>> {
//   const { userId } = await auth();

//   if (!userId) {
//     redirect("/sign-in");
//   }

//   try {
//     const doctor = await prisma.doctor.findUnique({
//       where: {
//         user: {
//           id: userId,
//         },
//       },
//       include: {
//         subscription: true,
//       },
//     });

//     if (!doctor || !doctor.subscription) {
//       return {
//         success: false,
//         error: "Aucun abonnement trouvé",
//       };
//     }

//     const updatedSubscription = (await prisma.subscription.update({
//       where: {
//         id: doctor.subscription.id,
//       },
//       data: {
//         status,
//         updatedAt: new Date(),
//       },
//       include: {
//         payments: {
//           orderBy: {
//             paymentDate: "desc",
//           },
//         },
//       },
//     })) as Subscription;

//     return {
//       success: true,
//       data: updatedSubscription,
//       message: `Statut de l'abonnement mis à jour: ${status}`,
//     };
//   } catch (error) {
//     console.error("Erreur lors de la mise à jour du statut:", error);
//     return {
//       success: false,
//       error: "Impossible de mettre à jour le statut",
//     };
//   }
// }
