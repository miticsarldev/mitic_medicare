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
import type { Doctor } from "@/types/doctor";

interface DoctorDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onSuccess: () => void;
}

export default function DoctorDeleteModal({
  isOpen,
  onClose,
  doctor,
  onSuccess,
}: DoctorDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteDoctor = async () => {
    if (!doctor) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/superadmin/doctors/${doctor.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete doctor");
      }

      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast({
        title: "Error",
        description: "Failed to delete doctor",
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
            Êtes-vous sûr de vouloir supprimer ce médecin ? Cette action ne peut
            pas être annulée.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {doctor && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={doctor.user.profile?.avatarUrl}
                  alt={doctor.user.name}
                />
                <AvatarFallback>{doctor.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{doctor.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {doctor.user.email}
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
            onClick={handleDeleteDoctor}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
