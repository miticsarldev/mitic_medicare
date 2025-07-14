"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import OrangeMoneyButton from "@/components/OrangeMonneyButton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const PLANS = [
  {
    id: "FREE",
    label: "Basique",
    description: "Jusqu'à 10 patient, support standard",
    pricePerMonth: 5000,
  },
  {
    id: "STANDARD",
    label: "Standard",
    description: "Jusqu'à 50 patient, support prioritaire",
    pricePerMonth: 50000,
  },
  {
    id: "PREMIUM",
    label: "Premium",
    description: "patient illimites, support 24/7",
    pricePerMonth: 150000,
  },
];

export function RenewSubscriptionModal({
  open,
  onOpenChange,
  currentPlan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
}) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [months, setMonths] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const selectedPlanData = PLANS.find((plan) => plan.id === selectedPlan);
  const totalAmount = selectedPlanData
    ? selectedPlanData.pricePerMonth * months
    : 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(
        "/api/independant_doctor/subscription/updateSucription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan: selectedPlan,
            months,
            amount: totalAmount,
          }),
        }
      );

      if (!response.ok) throw new Error("Échec de la demande de mise à jour");

      toast.success("Succès", {
        description: "Votre demande a été envoyée avec succès",
      });
      setRequestSent(true);
    } catch (error) {
      toast.error("Erreur", {
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {requestSent
              ? "Paiement de l'abonnement"
              : "Renouveler l'abonnement"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!requestSent ? (
            <motion.div
              key="request-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 py-4"
            >
              {/* Sélection du plan */}
              <div className="space-y-2">
                <Label>Choisissez un plan</Label>
                <RadioGroup
                  value={selectedPlan}
                  onValueChange={setSelectedPlan}
                  className="grid grid-cols-2 gap-4"
                >
                  {PLANS.map((plan) => (
                    <div key={plan.id}>
                      <RadioGroupItem
                        value={plan.id}
                        id={plan.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={plan.id}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <div className="w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{plan.label}</span>
                            <Badge
                              variant={
                                plan.id === selectedPlan ? "default" : "outline"
                              }
                            >
                              {plan.pricePerMonth.toLocaleString()} XOF/mois
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {plan.description}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Durée en mois */}
              <div className="space-y-2">
                <Label>Durée (mois)</Label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                />
              </div>

              {/* Description du plan sélectionné */}
              {selectedPlanData && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">
                    Détails du plan {selectedPlanData.label}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlanData.description}
                  </p>
                </div>
              )}

              {/* Montant total */}
              <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                <span className="font-medium">Montant total</span>
                <span className="text-2xl font-bold">
                  {totalAmount.toLocaleString()} XOF
                </span>
              </div>

              {/* Bouton de demande */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Envoi en cours..." : "Envoyer la demande"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="payment-section"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 py-4"
            >
              <div className="p-6 text-center">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-12 w-12 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Demande enregistrée avec succès!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Votre demande de mise à jour d&apos;abonnement a été reçue. Vous
                  pouvez maintenant procéder au paiement.
                </p>

                <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg mb-6">
                  <span className="font-medium">Montant à payer</span>
                  <span className="text-2xl font-bold">
                    {totalAmount.toLocaleString()} XOF
                  </span>
                </div>

                <OrangeMoneyButton
                  amount={totalAmount}
                  orderId={`SUB_${Date.now()}`}
                  returnUrl="/dashboard/independant_doctor/settings/pricing"
                  cancelUrl="/dashboard/independant_doctor/settings/pricing"
                  notifUrl="/dashboard/independant_doctor/settings/pricing"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
