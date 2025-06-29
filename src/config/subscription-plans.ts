import type { SubscriptionPlan } from "@prisma/client";

// Define the plan metadata type
export type PlanMetadata = {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  userType: "doctor" | "hospital" | "all";
  isPopular: boolean;
};

// Create a mapping from enum values to their metadata
export const subscriptionPlans: Record<SubscriptionPlan, PlanMetadata> = {
  FREE: {
    name: "Gratuit",
    description: "Accès aux fonctionnalités de base",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Profil de base",
      "Recherche limitée",
      "Fonctionnalités essentielles",
    ],
    userType: "all",
    isPopular: false,
  },
  STANDARD: {
    name: "Standard",
    description: "Accès à toutes les fonctionnalités essentielles",
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    features: [
      "Toutes les fonctionnalités Basique",
      "Gestion avancée des rendez-vous",
      "Dossiers patients électroniques",
      "Téléconsultations limitées",
      "Support technique",
    ],
    userType: "doctor",
    isPopular: true,
  },
  PREMIUM: {
    name: "Premium",
    description: "Accès complet pour les médecins",
    monthlyPrice: 49.99,
    yearlyPrice: 499.99,
    features: [
      "Toutes les fonctionnalités Standard",
      "Téléconsultations illimitées",
      "Prescription électronique",
      "Facturation intégrée",
      "Analyses et statistiques",
      "Support prioritaire",
    ],
    userType: "doctor",
    isPopular: false,
  },
};

// Helper function to get a plan by its enum value
export function getPlan(planType: SubscriptionPlan): PlanMetadata {
  return subscriptionPlans[planType];
}

// Helper function to get all plans
export function getAllPlans(): Array<
  { type: SubscriptionPlan } & PlanMetadata
> {
  return Object.entries(subscriptionPlans).map(([type, metadata]) => ({
    type: type as SubscriptionPlan,
    ...metadata,
  }));
}

// Helper function to get plans by user type
export function getPlansByUserType(
  userType: string
): Array<{ type: SubscriptionPlan } & PlanMetadata> {
  return getAllPlans().filter(
    (plan) => plan.userType === userType || plan.userType === "all"
  );
}
