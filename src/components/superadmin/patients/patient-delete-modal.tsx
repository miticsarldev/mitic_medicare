// components/patients/PatientDeleteModal.tsx
import { useEffect, useMemo, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Patient } from "@/types/patient";

interface PatientDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess: () => void;
}

type DeleteSummary = {
  name: string;
  email: string;
  favorites: { doctors: number; hospitals: number };
  counts: {
    appointments: number;
    medicalRecords: number;
    medicalRecordAttachments: number;
    prescriptionsByRecord: number;
    prescriptionsByPatient: number;
    prescriptionOrdersByRecord: number;
    prescriptionOrdersByPatient: number;
    vitalSigns: number;
    histories: number;
    authoredReviews: number;
    sessions: number;
    accounts: number;
  };
};

export default function PatientDeleteModal({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: PatientDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState<DeleteSummary | null>(null);
  const [ack, setAck] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // load delete summary when opening
  useEffect(() => {
    const run = async () => {
      if (!isOpen || !patient) {
        setSummary(null);
        setAck(false);
        setConfirmText("");
        return;
      }
      setLoadingSummary(true);
      try {
        const res = await fetch(
          `/api/superadmin/patients/delete/${patient.id}?summary=1`
        );
        if (!res.ok) throw new Error("Failed to load delete summary");
        const data = (await res.json()) as DeleteSummary;
        setSummary(data);
      } catch (e) {
        console.error(e);
        setSummary(null);
      } finally {
        setLoadingSummary(false);
      }
    };
    run();
  }, [isOpen, patient]);

  const totalToRemove = useMemo(() => {
    if (!summary) return 0;
    const c = summary?.counts;
    return (
      c?.appointments +
      c?.medicalRecords +
      c?.medicalRecordAttachments +
      c?.prescriptionsByRecord +
      c?.prescriptionsByPatient +
      c?.prescriptionOrdersByRecord +
      c?.prescriptionOrdersByPatient +
      c?.vitalSigns +
      c?.histories +
      c?.authoredReviews +
      c?.sessions +
      c?.accounts +
      summary?.favorites?.doctors +
      summary?.favorites?.hospitals +
      1 // the patient record itself
    );
  }, [summary]);

  const canDelete = ack && confirmText.trim().toUpperCase() === "DELETE";

  const handleDeletePatient = async () => {
    if (!patient) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/superadmin/patients/${patient.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to delete patient");
      }
      toast({
        title: "Supprimé",
        description: "Le patient et toutes ses données ont été supprimés.",
      });
      onSuccess();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Erreur",
        description: error?.message ?? "Échec de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Supprimer définitivement ce patient ?</DialogTitle>
          <DialogDescription>
            Cette action est <b>irréversible</b>. Toutes les données listées
            ci-dessous seront définitivement supprimées.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-3">
          {patient && (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={patient.user.profile?.avatarUrl ?? undefined}
                  alt={patient.user.name}
                />
                <AvatarFallback>
                  {patient.user.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{patient.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.user.email}
                </p>
              </div>
            </div>
          )}

          {loadingSummary ? (
            <div className="text-sm text-muted-foreground">
              Chargement des éléments à supprimer…
            </div>
          ) : summary ? (
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium mb-2">
                Seront supprimés&nbsp;:
              </p>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>{summary?.counts?.appointments} rendez-vous</li>
                <li>
                  {summary?.counts?.medicalRecords} dossiers médicaux &middot;{" "}
                  {summary?.counts?.medicalRecordAttachments} pièces jointes
                </li>
                <li>
                  {summary?.counts?.prescriptionsByRecord +
                    summary?.counts?.prescriptionsByPatient}{" "}
                  prescriptions
                </li>
                <li>
                  {summary?.counts?.prescriptionOrdersByRecord +
                    summary?.counts?.prescriptionOrdersByPatient}{" "}
                  ordonnances
                </li>
                <li>{summary?.counts?.vitalSigns} signes vitaux</li>
                <li>{summary?.counts?.histories} historiques médicaux</li>
                <li>{summary?.counts?.authoredReviews} avis publiés</li>
                <li>
                  Favoris&nbsp;: {summary?.favorites?.doctors} médecins,{" "}
                  {summary?.favorites?.hospitals} hôpitaux
                </li>
                <li>
                  Sessions: {summary?.counts?.sessions}, Comptes OAuth:{" "}
                  {summary?.counts?.accounts}
                </li>
                <li>Le compte utilisateur et le profil liés</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Total éléments à supprimer&nbsp;: <b>{totalToRemove}</b>
              </p>
            </div>
          ) : (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              Impossible de charger le récapitulatif. La suppression tentera
              tout de même de purger les données liées.
            </div>
          )}

          <div className="flex items-start gap-2 pt-1">
            <Checkbox
              id="ack"
              checked={ack}
              onCheckedChange={(v) => setAck(Boolean(v))}
            />
            <label htmlFor="ack" className="text-sm leading-tight">
              Je comprends que cette action est permanente et supprimera toutes
              les données associées à ce patient.
            </label>
          </div>
          <div className="space-y-1">
            <label className="text-sm">
              Tapez <b>DELETE</b> pour confirmer
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeletePatient}
            disabled={!canDelete || isDeleting}
          >
            {isDeleting ? "Suppression…" : "Supprimer définitivement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
