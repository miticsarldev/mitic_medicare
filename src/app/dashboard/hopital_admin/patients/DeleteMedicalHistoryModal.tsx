import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react"; // icône de chargement

interface MedicalHistory {
  id: string;
  title: string;
  condition: string;
  diagnosedDate: string;
  status: string;
  details: string;
  doctor?: {
    id: string;
    specialty: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface DeleteMedicalHistoryModalProps {
  history: MedicalHistory;
  onClose: () => void;
  onDelete: (historyId: string) => void;
}

export const DeleteMedicalHistoryModal: FC<DeleteMedicalHistoryModalProps> = ({
  history,
  onClose,
  onDelete,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/hospital_admin/medical-history/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: history.id }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      onDelete(history.id);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Supprimer l&apos;historique médical</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Êtes-vous sûr de vouloir supprimer l&apos;historique médical{" "}
            <strong>{history.title}</strong> ?<br />
            Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Suppression...
                </div>
              ) : (
                "Supprimer"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
