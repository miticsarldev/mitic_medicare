"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  Info,
  RotateCw,
  Eye,
  Check,
  X,
  Calendar,
  CreditCard,
  BadgeCheck,
  Clock,
  User2,
  Hospital,
  Wallet,
  Mail
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Types basés sur votre schéma Prisma et API
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Doctor = {
  id: string;
  user: User;
  specialization: string;
  isVerified: boolean;
};

type Hospital = {
  id: string;
  admin: User;
  name: string;
  isVerified: boolean;
};

type SubscriptionPayment = {
  id: string;
  paymentMethod: string;
  status: string;
  paymentDate: Date;
  amount: number;
  currency: string;
};

type Subscription = {
  id: string;
  subscriberType: 'DOCTOR' | 'HOSPITAL';
  doctor: Doctor | null;
  hospital: Hospital | null;
  plan: 'FREE' | 'STANDARD' | 'PREMIUM';
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'EXPIRED';
  startDate: Date | null;
  endDate: Date | null;
  amount: number;
  currency: string;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
  payments: SubscriptionPayment[];
};

type SubscriptionCardProps = {
  subscription: Subscription;
  onViewDetails: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch pending subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/superadmin/subscriptions/pending", {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch subscriptions");
        }

        const data = await response.json();
        setSubscriptions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/superadmin/subscriptions/${id}/approve`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve subscription");
      }

      setSubscriptions(subscriptions.filter(sub => sub.id !== id));

      toast({
        title: "Succès",
        description: "L'abonnement a été validé avec succès",
        variant: "default",
      });
    } catch (err) {
      console.error("Approval error:", err);
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedSubscription(null);
      setActionType(null);
    }
  };

  const handleReject = async (id: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/superadmin/subscriptions/${id}/reject`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject subscription");
      }

      setSubscriptions(subscriptions.filter(sub => sub.id !== id));

      toast({
        title: "Succès",
        description: "L'abonnement a été annulé avec succès",
        variant: "default",
      });
    } catch (err) {
      console.error("Rejection error:", err);
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedSubscription(null);
      setActionType(null);
    }
  };

  const handleViewDetails = (id: string) => {
    const subscription = subscriptions.find(sub => sub.id === id);
    console.log("Subscription details:", subscription);
  };

  function SubscriptionCardSkeleton() {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-3">
          <Skeleton className="h-9 w-24" />
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <SubscriptionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Aucun abonnement en attente</AlertTitle>
        <AlertDescription>
          Tous les abonnements ont été traités.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Abonnements en attente
        </h2>
        <Badge variant="outline" className="px-3 py-1">
          {subscriptions.length} en attente
        </Badge>
      </div>

      <Separator />

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onViewDetails={handleViewDetails}
              onApprove={() => {
                setSelectedSubscription(subscription.id);
                setActionType("approve");
              }}
              onReject={() => {
                setSelectedSubscription(subscription.id);
                setActionType("reject");
              }}
            />
          ))}
        </div>
      </ScrollArea>

      <AlertDialog open={!!actionType && !!selectedSubscription}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {actionType === "approve" ? (
                <>
                  <Check className="h-5 w-5" />
                  Valider abonnement
                </>
              ) : (
                <>
                  <X className="h-5 w-5" />
                  Annuler abonnement
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? "Êtes-vous sûr de vouloir valider cet abonnement ?"
                : "Êtes-vous sûr de vouloir annuler cet abonnement ? Cette action est irréversible."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedSubscription(null);
                setActionType(null);
              }}
              disabled={isProcessing}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (actionType === "approve" && selectedSubscription) {
                  handleApprove(selectedSubscription);
                } else if (actionType === "reject" && selectedSubscription) {
                  handleReject(selectedSubscription);
                }
              }}
              disabled={isProcessing}
            >
              {isProcessing && (
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              )}
              {actionType === "approve" ? "Valider" : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SubscriptionCard({ subscription, onViewDetails, onApprove, onReject }: SubscriptionCardProps) {
  const subscriberType = subscription.doctor ? "Médecin" : "Hôpital";
  const lastPayment = subscription.payments?.[0];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {subscriberType === "Médecin" ? (
                <User2 className="h-5 w-5 text-primary" />
              ) : (
                <Hospital className="h-5 w-5 text-primary" />
              )}
              {subscription.doctor ? subscription.doctor.user.name : subscription.hospital ? subscription.hospital.admin.name : 'N/A'}
            </CardTitle>
            <CardDescription className="text-sm flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {subscription.doctor ? subscription.doctor.user.email : subscription.hospital ? subscription.hospital.admin.email : 'N/A'}
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {subscription.plan}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Date de demande
            </p>
            <p>{format(new Date(subscription.createdAt), "PP", { locale: fr })}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              Montant
            </p>
            <p>{subscription.amount} {subscription.currency}</p>
          </div>
          {lastPayment && (
            <>
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  Méthode de paiement
                </p>
                <p>{lastPayment.paymentMethod}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1">
                  {lastPayment.status === "COMPLETED" ? (
                    <BadgeCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  Statut paiement
                </p>
                <Badge variant={lastPayment.status === "COMPLETED" ? "default" : "secondary"}>
                  {lastPayment.status === "COMPLETED" ? "Payé" : "En attente"}
                </Badge>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(subscription.id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Détails
        </Button>
        <div className="space-x-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onReject(subscription.id)}
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={() => onApprove(subscription.id)}
          >
            <Check className="h-4 w-4 mr-2" />
            Valider
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}