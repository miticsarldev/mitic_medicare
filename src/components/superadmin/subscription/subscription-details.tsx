"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Edit,
  Building,
  User,
  CreditCard,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Subscription } from "@/types/subscription";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onEdit: (subscription: Subscription) => void;
}

export default function SubscriptionDetailsModal({
  isOpen,
  onClose,
  subscription,
  onEdit,
}: SubscriptionDetailsModalProps) {
  if (!subscription) return null;

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Actif</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactif</Badge>;
      case "TRIAL":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Essai
          </Badge>
        );
      case "EXPIRED":
        return <Badge variant="destructive">Expiré</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Format date helper
  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "d MMMM yyyy", { locale: fr });
  };

  // Format currency helper
  const formatCurrency = (amount: number, currency = "XOF") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Get subscriber info
  const isDoctor = subscription.subscriberType === "DOCTOR";
  const subscriberName = isDoctor
    ? subscription.doctor?.user?.name || "N/A"
    : subscription.hospital?.name || "N/A";
  const subscriberEmail = isDoctor
    ? subscription.doctor?.user?.email || "N/A"
    : subscription.hospital?.email || "N/A";
  const subscriberAvatar = isDoctor
    ? subscription.doctor?.user?.profile?.avatarUrl
    : subscription.hospital?.logoUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={subscriberAvatar || ""}
                  alt={subscriberName}
                />
                <AvatarFallback>{subscriberName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{subscriberName}</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(subscription.status)}
              {isDoctor ? (
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                >
                  <User className="mr-1 h-3 w-3" /> Médecin
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-800 hover:bg-purple-100"
                >
                  <Building className="mr-1 h-3 w-3" /> Hôpital
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription>
            ID: {subscription.id} • Créé le {formatDate(subscription.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Informations de l&apos;abonnement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Plan
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800"
                    >
                      {subscription.plan}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Statut
                  </div>
                  <div>{getStatusBadge(subscription.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Date de début
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(subscription.startDate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Date de fin
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(subscription.endDate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Renouvellement automatique
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    {subscription.autoRenew ? "Activé" : "Désactivé"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Informations de paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Montant
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    {formatCurrency(
                      Number.parseFloat(subscription.amount.toString()),
                      subscription.currency
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Devise
                  </div>
                  <div>{subscription.currency}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Dernière mise à jour
                  </div>
                  <div>{formatDate(subscription.updatedAt)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Subscriber Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Informations de l&apos;abonné
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Nom
                  </div>
                  <div>{subscriberName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Email
                  </div>
                  <div>{subscriberEmail}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Type
                  </div>
                  <div>
                    {isDoctor ? (
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                      >
                        <User className="mr-1 h-3 w-3" /> Médecin
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-100"
                      >
                        <Building className="mr-1 h-3 w-3" /> Hôpital
                      </Badge>
                    )}
                  </div>
                </div>
                {isDoctor && subscription.doctor && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Spécialisation
                    </div>
                    <div>{subscription.doctor.specialization}</div>
                  </div>
                )}
                {!isDoctor && subscription.hospital && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Ville
                    </div>
                    <div>
                      {subscription.hospital.city},{" "}
                      {subscription.hospital.country}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Historique des paiements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription.payments && subscription.payments.length > 0 ? (
                  <div className="space-y-3">
                    {subscription.payments.map((payment, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <div>
                          <div className="font-medium">
                            {formatDate(payment.paymentDate)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payment.paymentMethod} • {payment.status}
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(
                            Number.parseFloat(payment.amount.toString()),
                            payment.currency
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Aucun historique de paiement disponible
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator className="my-4" />

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-medium mb-2">
              Informations supplémentaires
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  ID de l&apos;abonné
                </div>
                <div>
                  {isDoctor
                    ? subscription.doctorId || "N/A"
                    : subscription.hospitalId || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Créé le
                </div>
                <div>{formatDate(subscription.createdAt)}</div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex flex-col gap-2 mt-4">
          <Button
            onClick={() => {
              onClose();
              onEdit(subscription);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier l&apos;abonnement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
