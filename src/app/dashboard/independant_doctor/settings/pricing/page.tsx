"use client";

import React, { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RenewSubscriptionModal } from "./RenewSubscriptionModal";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  paymentMethod: string;
  status: string;
}

interface SubscriptionData {
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  currentPatients: number;
  maxPatients: number | "Illimité";
  remainingSlots: number | "Illimité";
  canAddMorePatients: boolean;
  daysUntilExpiration: number;
  payments: Payment[];
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap = {
    ACTIVE: { label: "Actif", variant: "default" as const, icon: CheckCircle2 },
    INACTIVE: { label: "Inactif", variant: "secondary" as const },
    TRIAL: { label: "Essai", variant: "outline" as const },
    EXPIRED: { label: "Expiré", variant: "destructive" as const },
    COMPLETED: { label: "Complété", variant: "default" as const },
    PENDING: { label: "En attente", variant: "outline" as const },
    FAILED: { label: "Échoué", variant: "destructive" as const },
  };

  const { label, variant } = statusMap[status as keyof typeof statusMap] || {
    label: status,
    variant: "outline" as const,
    icon: null,
  };

  return (
    <Badge variant={variant} className="gap-1">
      {label}
    </Badge>
  );
};

const PlanBadge = ({ plan }: { plan: string }) => {
  const planMap = {
    FREE: { label: "Gratuit", variant: "secondary" as const },
    STANDARD: { label: "Standard", variant: "default" as const },
    PREMIUM: { label: "Premium", variant: "premium" as const },
  };

  const { label } = planMap[plan as keyof typeof planMap] || { label: plan };

  return <Badge variant="default">{label}</Badge>;
};

export default function SubscriptionSection() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renewModalOpen, setRenewModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/independant_doctor/subscription");
      if (!res.ok) throw new Error(await res.text());
      const responseData = await res.json();
      setData(responseData);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'abonnement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPaid = useMemo(() => {
    return (
      data?.payments.reduce((sum, p) => {
        return p.status === "COMPLETED" ? sum + Number(p.amount) : sum;
      }, 0) || 0
    );
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-2">
                <Skeleton className="h-5 w-24 rounded-lg" />
                <Skeleton className="h-7 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-64 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <p className="text-destructive text-lg font-medium">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <p className="text-muted-foreground text-lg">
          Aucune donnée d&apos;abonnement disponible
        </p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Rafraîchir
        </Button>
      </div>
    );
  }

  const expirationPercentage = Math.max(
    0,
    Math.min(100, 100 - (data.daysUntilExpiration / 30) * 100)
  );

  return (
    <div className="space-y-6">
      {/* En-tête avec statut */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Votre abonnement
          </h2>
          <p className="text-muted-foreground">
            {data.status === "ACTIVE"
              ? `Valide jusqu'au ${format(data.endDate, "PPP", { locale: fr })}`
              : "Abonnement inactif"}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button
            onClick={() => setRenewModalOpen(true)}
            className="min-w-[200px]"
          >
            Renouveler l&lsquo;abonnement
          </Button>
        </div>
      </div>

      {/* Barre de progression d'expiration */}
      {data.status === "ACTIVE" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {data.daysUntilExpiration > 0
                ? `${data.daysUntilExpiration} jours restants`
                : "Expirer"}
            </span>
            <span className="text-sm text-muted-foreground">
              {format(data.startDate, "PPP", { locale: fr })} -{" "}
              {format(data.endDate, "PPP", { locale: fr })}
            </span>
          </div>
          <Progress value={expirationPercentage} className="h-2" />
        </div>
      )}

      {/* Cartes d'informations */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Plan */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Plan actuel</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <PlanBadge plan={data.plan} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.maxPatients === "Illimité" ? "Illimité" : data.maxPatients}{" "}
              patients
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.currentPatients} patients suivis / {data.maxPatients}
            </p>
          </CardContent>
        </Card>

        {/* Statut */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Statut</CardDescription>
            <CardTitle>
              <StatusBadge status={data.status} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.canAddMorePatients ? "Actif" : "Limite atteinte"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.currentPatients} patients suivis / {data.maxPatients}
            </p>
          </CardContent>
        </Card>

        {/* Paiement total */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total payé</CardDescription>
            <CardTitle className="text-xl">
              {totalPaid.toFixed(2)} XOF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.payments.length} paiements
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dernier le{" "}
              {data.payments[0]
                ? format(new Date(data.payments[0].paymentDate), "PPP", {
                    locale: fr,
                  })
                : "-"}
            </p>
          </CardContent>
        </Card>

        {/* Renouvellement */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Renouvellement</CardDescription>
            <CardTitle>
              {data.autoRenew ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  Automatique
                </Badge>
              ) : (
                <Badge variant="outline">Manuel</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.daysUntilExpiration > 0
                ? `${data.daysUntilExpiration} jours`
                : "Expiré"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.autoRenew
                ? "Se renouvellera automatiquement"
                : "Renouvellement manuel nécessaire"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historique des paiements */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
          <CardDescription>
            Toutes les transactions liées à votre abonnement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Montant</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.length > 0 ? (
                data.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {Number(payment.amount).toFixed(2)} {payment.currency}
                    </TableCell>
                    <TableCell className="capitalize">
                      {payment.paymentMethod.toLowerCase()}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.paymentDate), "PP", {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    Aucun paiement enregistré
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Avertissement si limite atteinte */}
      {!data.canAddMorePatients && (
        <div className="flex items-start gap-4 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">
              Limite de patients atteinte
            </h4>
            <p className="text-sm text-yellow-700">
              Vous avez atteint la limite de patients autorisés pour votre plan{" "}
              {data.plan}.
              {data.plan !== "PREMIUM" &&
                " Veuillez mettre à niveau votre abonnement pour suivre plus de patients."}
            </p>
          </div>
        </div>
      )}

      <RenewSubscriptionModal
        open={renewModalOpen}
        onOpenChange={setRenewModalOpen}
        currentPlan={data.plan}
      />
    </div>
  );
}
