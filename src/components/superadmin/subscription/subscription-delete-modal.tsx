"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { Subscription } from "@/types/subscription";
import { Building, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SubscriptionDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onSuccess: () => void;
}

export default function SubscriptionDeleteModal({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}: SubscriptionDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSubscription = async () => {
    if (!subscription) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/superadmin/subscriptions/${subscription.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete subscription");
      }

      toast({
        title: "Success",
        description: "Subscription deleted successfully",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get subscriber info
  const isDoctor = subscription?.subscriberType === "DOCTOR";
  const subscriberName = isDoctor
    ? subscription?.doctor?.user?.name || "N/A"
    : subscription?.hospital?.name || "N/A";
  const subscriberAvatar = isDoctor
    ? subscription?.doctor?.user?.profile?.avatarUrl
    : subscription?.hospital?.logoUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cet abonnement ? Cette action ne
            peut pas être annulée.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {subscription && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={subscriberAvatar || ""}
                  alt={subscriberName}
                />
                <AvatarFallback>{subscriberName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{subscriberName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800"
                  >
                    {subscription.plan}
                  </Badge>
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
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteSubscription}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
