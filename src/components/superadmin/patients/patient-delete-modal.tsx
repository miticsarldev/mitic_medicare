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
import { Patient } from "@/types/patient";

interface PatientDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess: () => void;
}

export default function PatientDeleteModal({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: PatientDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePatient = async () => {
    if (!patient) return;

    console.log("Deleting patient:", patient);

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/superadmin/patients/${patient.user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete patient");
      }

      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Error",
        description: "Failed to delete patient",
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
            Êtes-vous sûr de vouloir supprimer ce patient ? Cette action ne peut
            pas être annulée.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {patient && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={patient.user.profile?.avatarUrl}
                  alt={patient.user.name}
                />
                <AvatarFallback>{patient.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{patient.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.user.email}
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
            onClick={handleDeletePatient}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
