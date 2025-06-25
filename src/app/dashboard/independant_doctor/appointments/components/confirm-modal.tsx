"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    description?: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function ConfirmModal({ open, onOpenChange, onConfirm }: ConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirmer le rendez-vous</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir confirmer ce rendez-vous ? Cette action ne peut pas être annulée.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={onConfirm}>Confirmer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}