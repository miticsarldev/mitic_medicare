import { FC } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
    onDelete 
}) => {
    const { toast } = useToast();

    const handleDelete = async () => {
        try {
            const response = await fetch("/api/medical-history", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: history.id,
                }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la suppression");
            }

            onDelete(history.id);
            onClose();
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la suppression.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Supprimer l'historique médical</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p>
                        Êtes-vous sûr de vouloir supprimer l'historique médical <strong>"{history.title}"</strong> ?
                        Cette action est irréversible.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Supprimer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};