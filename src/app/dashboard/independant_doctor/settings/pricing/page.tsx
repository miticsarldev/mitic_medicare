"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CreditCard,
  Crown,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Star,
  Zap,
  Shield,
  Receipt,
} from "lucide-react";
import {
  getDoctorSubscription,
  getSubscriptionPayments,
  Subscription,
  SubscriptionPayment,
  SubscriptionPlan,
} from "./actions";
import { PaymentModal } from "@/components/payment-modal";

const planFeatures: Record<
  "STANDARD" | "PREMIUM",
  {
    name: string;
    icon: typeof Shield;
    color: string;
    features: string[];
  }
> = {
  STANDARD: {
    name: "Standard",
    icon: Star,
    color: "bg-blue-500",
    features: [
      "Rendez-vous illimités",
      "Dossiers médicaux",
      "Support prioritaire",
      "Analyses de base",
    ],
  },
  PREMIUM: {
    name: "Premium",
    icon: Crown,
    color: "bg-purple-500",
    features: [
      "Toutes les fonctionnalités Standard",
      "Analyses avancées",
      "Télémédecine",
      "Accès API",
      "Support 24/7",
    ],
  },
};

const statusTranslations = {
  ACTIVE: "ACTIF",
  EXPIRED: "EXPIRÉ",
  TRIAL: "ESSAI",
  PENDING: "EN ATTENTE",
  INACTIVE: "INACTIF",
} as const;

const paymentMethodTranslations = {
  CREDIT_CARD: "Carte bancaire",
  BANK_TRANSFER: "Virement bancaire",
  MOBILE_MONEY: "Mobile Money",
} as const;

const paymentStatusTranslations = {
  PENDING: "En attente",
  COMPLETED: "Terminé",
  FAILED: "Échoué",
} as const;

const getStatusIcon = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "EXPIRED":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "TRIAL":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "PENDING":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    default:
      return <XCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "EXPIRED":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "TRIAL":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "PENDING":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
};

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<string>("current");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading] = useState<boolean>(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentTitle, setPaymentTitle] = useState<string>("");
  const [paymentDescription, setPaymentDescription] = useState<string>("");

  // Charger les données au montage du composant
  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [subscriptionResult, paymentsResult] = await Promise.all([
        getDoctorSubscription(),
        getSubscriptionPayments(),
      ]);

      if (subscriptionResult.success) {
        setSubscription(subscriptionResult.data || null);
      }

      if (paymentsResult.success) {
        setPayments(paymentsResult.data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const isSubscriptionExpired = (): boolean => {
    if (!subscription) return false;
    return (
      subscription.status === "EXPIRED" ||
      new Date(subscription.endDate) <= new Date()
    );
  };

  const handleOpenPaymentModal = (
    amount: number,

    title: string,

    description: string
  ) => {
    setPaymentAmount(amount);
    setPaymentTitle(title);
    setPaymentDescription(description);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    // Créer l'enregistrement de paiement dans la base de données

    // Vous pouvez créer une action serveur pour cela

    // console.log("Paiement réussi:", { transactionId, paymentMethod });

    loadSubscriptionData(); // Recharger les données
  };

  const handlePaymentError = (error: string) => {
    console.error("Erreur de paiement:", error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Chargement des abonnements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Abonnement</h1>
          </div>
          <p className="text-gray-400">
            Gérez votre plan d&apos;abonnement et informations de facturation
          </p>
        </div>

        {/* Aperçu de l'abonnement actuel */}
        {subscription && (
          <Card className="mb-8 bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${planFeatures[subscription.plan].color}/10`}
                  >
                    {(() => {
                      const IconComponent =
                        planFeatures[subscription.plan].icon;
                      return (
                        <IconComponent
                          className={`h-5 w-5 text-${planFeatures[subscription.plan].color.split("-")[1]}-400`}
                        />
                      );
                    })()}
                  </div>
                  <div>
                    <CardTitle className="text-white">
                      Plan {planFeatures[subscription.plan].name}
                    </CardTitle>
                    <CardDescription>Votre abonnement actuel</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(subscription.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(subscription.status)}
                    {statusTranslations[subscription.status]}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    {isSubscriptionExpired() ? "Expiré le" : "Expire le"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="font-medium text-white">
                      {formatDate(subscription.endDate)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Montant</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(subscription.amount, subscription.currency)}
                    <span className="text-sm text-gray-400 font-normal">
                      /an
                    </span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Renouvellement automatique
                  </p>
                  <div className="flex items-center gap-2">
                    <RefreshCw
                      className={`h-4 w-4 ${subscription.autoRenew ? "text-green-400" : "text-gray-400"}`}
                    />
                    <p className="font-medium text-white">
                      {subscription.autoRenew ? "Activé" : "Désactivé"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6 bg-gray-800" />

              <div className="flex flex-col sm:flex-row gap-4">
                {isSubscriptionExpired() && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() =>
                      handleOpenPaymentModal(
                        subscription.amount,
                        "Renouvellement d'abonnement",
                        `Renouveler votre plan ${planFeatures[subscription.plan].name}`
                      )
                    }
                    disabled={actionLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renouveler l&apos;abonnement
                  </Button>
                )}
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() =>
                    handleOpenPaymentModal(
                      99.99,
                      "Amélioration d'abonnement",
                      "Passer au plan Premium"
                    )
                  }
                  disabled={actionLoading || subscription.plan === "PREMIUM"}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {subscription.plan === "PREMIUM"
                    ? "Plan Premium actuel"
                    : "Améliorer le plan"}
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                  //   onClick={handleToggleAutoRenewal}
                  disabled={actionLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {subscription.autoRenew ? "Désactiver" : "Activer"} le
                  renouvellement auto
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Onglets */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger
              value="current"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              Plan actuel
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              Historique des paiements
            </TabsTrigger>
            <TabsTrigger
              value="plans"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              Plans disponibles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {subscription ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    Fonctionnalités du plan
                  </CardTitle>
                  <CardDescription>
                    Ce qui est inclus dans votre plan actuel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {planFeatures[subscription.plan].features.map(
                      (feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Aucun abonnement
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Vous n&apos;avez pas encore d&apos;abonnement. Choisissez
                      un plan pour commencer.
                    </p>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => setActiveTab("plans")}
                    >
                      Voir les plans disponibles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <Card key={payment.id} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Receipt className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">
                            Paiement -{" "}
                            {formatCurrency(payment.amount, payment.currency)}
                          </CardTitle>
                          <CardDescription>
                            {formatDate(payment.paymentDate)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(payment.status)}>
                        {paymentStatusTranslations[payment.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Mode de paiement</p>
                        <p className="text-white">
                          {paymentMethodTranslations[payment.paymentMethod]}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Transaction ID</p>
                        <p className="text-white font-mono text-xs">
                          {payment.transactionId || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Statut</p>
                        <p className="text-white">
                          {paymentStatusTranslations[payment.status]}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Date</p>
                        <p className="text-white">
                          {formatDate(payment.paymentDate)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Aucun historique de paiement
                    </h3>
                    <p className="text-gray-400">
                      Vos paiements apparaîtront ici.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(planFeatures).map(([planKey, plan]) => {
                const isCurrentPlan = subscription?.plan === planKey;
                const prices: Record<SubscriptionPlan, number> = {
                  FREE: 0,
                  STANDARD: 15000,
                  PREMIUM: 30000,
                };

                return (
                  <Card
                    key={planKey}
                    className={`bg-gray-900 border-gray-800 relative ${isCurrentPlan ? "ring-2 ring-purple-500" : ""}`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white">
                          Plan actuel
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <div
                        className={`w-12 h-12 rounded-lg ${plan.color}/10 mx-auto mb-4 flex items-center justify-center`}
                      >
                        <plan.icon
                          className={`h-6 w-6 text-${plan.color.split("-")[1]}-400`}
                        />
                      </div>
                      <CardTitle className="text-white text-xl">
                        {plan.name}
                      </CardTitle>
                      <div className="text-3xl font-bold text-white">
                        {formatCurrency(
                          prices[planKey as SubscriptionPlan],
                          "XOF"
                        )}
                        <span className="text-sm text-gray-400 font-normal">
                          /mois
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button
                        className={`w-full ${
                          isCurrentPlan
                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                            : planKey === "PREMIUM"
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                        disabled={isCurrentPlan || actionLoading}
                        // onClick={() => !isCurrentPlan && handleUpgradeSubscription(planKey as SubscriptionPlan)}
                      >
                        {isCurrentPlan
                          ? "Plan actuel"
                          : planKey === "FREE"
                            ? "Rétrograder"
                            : "Choisir ce plan"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        amount={paymentAmount}
        currency="XOF"
        title={paymentTitle}
        description={paymentDescription}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
}
