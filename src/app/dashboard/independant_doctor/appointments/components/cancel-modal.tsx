"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CancelModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function CancelModal({ open, onOpenChange, onConfirm }: CancelModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Annuler le rendez-vous</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est ireversible.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Non, garder
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Oui, annuler
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}