"use client";

import { useState } from "react";
import { Check, CreditCard, HelpCircle, Shield, Star, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

export default function UpgradeSubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Sample subscription plans
  const plans = [
    {
      id: "free",
      name: "Gratuit",
      description: "Pour les utilisateurs occasionnels",
      price: {
        monthly: "0€",
        annually: "0€",
      },
      features: [
        "3 rendez-vous par mois",
        "Accès au dossier médical de base",
        "Rappels de rendez-vous",
        "Support par email",
      ],
      limitations: [
        "Pas de consultations vidéo",
        "Pas d'accès prioritaire",
        "Support limité",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      description: "Pour un suivi médical complet",
      popular: true,
      price: {
        monthly: "9,99€",
        annually: "99,99€",
      },
      features: [
        "Rendez-vous illimités",
        "Consultations vidéo illimitées",
        "Accès prioritaire aux rendez-vous",
        "Accès aux spécialistes premium",
        "Dossier médical complet et partageable",
        "Rappels personnalisés",
        "Support client 24/7",
      ],
      limitations: [],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setPaymentDialogOpen(true);
  };

  const handlePayment = () => {
    // Payment logic would go here
    toast({
      title: "Abonnement mis à jour",
      description: "Votre abonnement a été mis à jour avec succès",
    });
    setPaymentDialogOpen(false);

    // Redirect to subscription details page
    setTimeout(() => {
      window.location.href = "/dashboard/patient/subscription/details";
    }, 1500);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDiscountPercentage = (plan: any) => {
    const monthlyPrice = Number.parseFloat(
      plan.price.monthly.replace("€", "").replace(",", ".")
    );
    const annualPrice = Number.parseFloat(
      plan.price.annually.replace("€", "").replace(",", ".")
    );
    const monthlyTotal = monthlyPrice * 12;
    const discount = ((monthlyTotal - annualPrice) / monthlyTotal) * 100;
    return Math.round(discount);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Choisissez votre abonnement</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Améliorez votre expérience de santé avec nos plans d&apos;abonnement
          adaptés à vos besoins. Tous les plans incluent l&apos;accès à notre
          plateforme de santé numérique.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <Tabs
          defaultValue="monthly"
          value={billingCycle}
          onValueChange={setBillingCycle}
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Mensuel</TabsTrigger>
            <TabsTrigger value="annually">
              Annuel
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                -20%
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-all hover:shadow-md ${
              plan.popular ? "border-primary shadow-sm" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Populaire
                </div>
              </div>
            )}

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {plan.name}
                {plan.id === "premium" && (
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                )}
                {plan.id === "basic" && (
                  <Shield className="h-5 w-5 text-blue-500" />
                )}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-end">
                  <span className="text-3xl font-bold">
                    {plan.price[billingCycle as keyof typeof plan.price]}
                  </span>
                  {plan.id !== "free" && (
                    <span className="text-muted-foreground ml-1 mb-1">
                      /{billingCycle === "monthly" ? "mois" : "an"}
                    </span>
                  )}
                </div>

                {billingCycle === "annually" && plan.id !== "free" && (
                  <p className="text-sm text-green-600">
                    Économisez {getDiscountPercentage(plan)}% avec la
                    facturation annuelle
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Inclus :</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Limitations :
                  </h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">
                          &times;
                        </span>
                        <span className="text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.id === "free"
                  ? "Continuer avec le plan gratuit"
                  : "Choisir ce plan"}
                {plan.popular && <Zap className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 bg-muted/50 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              Besoin d&apos;aide pour choisir ?
            </h3>
            <p className="text-muted-foreground">
              Notre équipe est disponible pour vous aider à trouver le plan qui
              correspond le mieux à vos besoins.
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Comparer les plans
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voir une comparaison détaillée de tous nos plans</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button>Contacter le support</Button>
        </div>
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finaliser votre abonnement</DialogTitle>
            <DialogDescription>
              Entrez vos informations de paiement pour compléter votre
              abonnement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Récapitulatif</h4>
              <div className="rounded-lg border p-3">
                <div className="flex justify-between">
                  <span className="font-medium">
                    {plans.find((p) => p.id === selectedPlan)?.name}
                  </span>
                  <span>
                    {selectedPlan &&
                      plans.find((p) => p.id === selectedPlan)?.price[
                        billingCycle as keyof (typeof plans)[0]["price"]
                      ]}
                    /{billingCycle === "monthly" ? "mois" : "an"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Méthode de paiement</h4>
              <div className="rounded-lg border p-3 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span>Carte de crédit</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Les informations de paiement seraient collectées de manière
                sécurisée ici.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handlePayment}>Confirmer le paiement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
