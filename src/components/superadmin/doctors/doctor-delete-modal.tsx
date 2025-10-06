"use client";

import { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import type { Doctor } from "@/types/doctor";

// If you prefer Server Actions instead of the API route,
// import { deleteDoctorDeepTx } from "@/app/actions/doctor-actions";

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
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();

  const emailToConfirm = (doctor?.user.email ?? "").trim().toLowerCase();
  const canDelete =
    !!emailToConfirm &&
    confirm.trim().toLowerCase() === emailToConfirm &&
    !isDeleting &&
    !pending;

  const handleDeleteDoctor = async () => {
    if (!doctor) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/superadmin/doctors/${doctor.id}`, {
        method: "DELETE",
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(json?.error || "Failed to delete doctor");

      // --- OPTION B: via Server Action (uncomment if you prefer actions) ---
      // const res = await deleteDoctorDeepTx(doctor.id);
      // if ((res as any)?.error) throw new Error((res as any).error);

      toast({ title: "Succès", description: "Médecin supprimé." });
      onSuccess?.();
      onClose?.();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Cette action est irréversible et supprimera définitivement ce
            médecin et les données associées.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {doctor && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={doctor.user.profile?.avatarUrl || undefined}
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

          {/* Summary of what will be deleted */}
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
            <p className="font-medium text-amber-900 mb-1">
              Ce qui sera supprimé :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-amber-900">
              <li>Compte utilisateur et profil</li>
              <li>Fiche médecin et disponibilités</li>
              <li>{doctor?._count?.appointments ?? 0} rendez-vous liés</li>
              <li>{doctor?._count?.reviews ?? 0} avis patients</li>
              <li>Abonnement individuel (le cas échéant)</li>
            </ul>
          </div>

          {/* Type-to-confirm */}
          <div className="space-y-2">
            <label className="text-sm">
              Pour confirmer, saisissez l’email du médecin&nbsp;:
              <span className="ml-1 font-medium">{doctor?.user.email}</span>
            </label>
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Tapez l’email exactement pour activer la suppression"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting || pending}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => startTransition(handleDeleteDoctor)}
            disabled={!canDelete}
          >
            {isDeleting || pending
              ? "Suppression..."
              : "Supprimer définitivement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
