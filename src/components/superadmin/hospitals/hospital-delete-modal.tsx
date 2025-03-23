"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building } from "lucide-react";
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
import type { Hospital } from "@/types/hospital";

interface HospitalDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: Hospital | null;
  onSuccess: () => void;
}

export default function HospitalDeleteModal({
  isOpen,
  onClose,
  hospital,
  onSuccess,
}: HospitalDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteHospital = async () => {
    if (!hospital) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/superadmin/hospitals/${hospital.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete hospital");
      }

      toast({
        title: "Success",
        description: "Hospital deleted successfully",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting hospital:", error);
      toast({
        title: "Error",
        description: "Failed to delete hospital",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action
            ne peut pas être annulée.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {hospital && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={hospital.logoUrl || ""} alt={hospital.name} />
                <AvatarFallback>
                  <Building className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{hospital.name}</p>
                <p className="text-sm text-muted-foreground">
                  {hospital.email}
                </p>
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
            onClick={handleDeleteHospital}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
