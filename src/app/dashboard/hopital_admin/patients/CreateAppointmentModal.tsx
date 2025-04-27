import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { AppointmentStatus } from "@prisma/client";
import { toast } from "@/hooks/use-toast";

type Doctor = {
    id: string;
    name: string;
    specialization: string;
    isVerified: boolean;
    availableForChat: boolean;
    averageRating: number;
    patientsCount: number;
    phone: string;
    address?: string;
    department?: {
        id: string;
        name: string;
    };
    education?: string;
    experience?: string;
    consultationFee?: string;
    schedule?: { day: string; slots: string[] }[];
};

type Appointment = {
    id: string;
    scheduledAt: Date;
    endTime: Date | null;
    status: AppointmentStatus;
    type?: string;
    reason?: string;
    notes?: string;
    cancellationReason?: string;
    createdAt: Date;
    updatedAt: Date;
    doctor: {
        id: string;
        specialization: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    };
    hospital?: {
        id: string;
        name: string;
        city: string;
    };
};

export function CreateAppointmentModal({
    patientId,
    addAppointment,
}: {
    patientId: string;
    addAppointment: (newAppointment: Appointment) => void;
}) {
    const [open, setOpen] = useState(false);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false); // État de chargement pour la requête

    const [scheduledAt, setScheduledAt] = useState<Date | undefined>();
    const [doctorId, setDoctorId] = useState<string | undefined>();
    const [type, setType] = useState("");
    const [reason, setReason] = useState("");

    useEffect(() => {
        async function fetchDoctors() {
            try {
                const res = await fetch("/api/hospital_admin/doctors");
                const data = await res.json();
                setDoctors(data.doctors);
            } catch (err) {
                console.error("Erreur chargement des médecins", err);
            } finally {
                setLoadingDoctors(false);
            }
        }

        if (open) {
            fetchDoctors();
        }
    }, [open]);

    async function handleSubmit() {
        if (!scheduledAt || !doctorId) {
            alert("Merci de remplir les champs obligatoires.");
            return;
        }

        setLoadingSubmit(true); // Activer l'état de chargement lors de l'envoi

        try {
            const res = await fetch("/api/hospital_admin/appointment/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    patientId,
                    doctorId,
                    scheduledAt,
                    type,
                    reason,
                }),
            });

            if (!res.ok) throw new Error("Erreur lors de la création");

            const newAppointment = await res.json();
            addAppointment(newAppointment.appointment);
            toast({
                title: "Rendez-vous créé avec succès ✅",
                description: "Le rendez-vous a été enregistré.",
            });
            setOpen(false);
        } catch (err) {
            console.error(err);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la création du rendez-vous.",
            });
        } finally {
            setLoadingSubmit(false); // Désactiver l'état de chargement une fois terminé
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Prendre rendez-vous</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Créer un rendez-vous</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Date Picker (avec heure) */}
                    <div className="space-y-1">
                        <Label>Date et heure du rendez-vous *</Label>
                        <input
                            type="datetime-local"
                            value={scheduledAt?.toISOString().slice(0, 16) || ""}
                            onChange={(e) => setScheduledAt(new Date(e.target.value))}
                            className="border rounded-md p-2 w-full"
                        />
                    </div>

                    {/* Sélection médecin */}
                    <div className="space-y-1">
                        <Label>Médecin *</Label>
                        {loadingDoctors ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="animate-spin" />
                            </div>
                        ) : (
                            <Select value={doctorId} onValueChange={setDoctorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir un médecin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctors.map((doc) => (
                                        <SelectItem key={doc.id} value={doc.id}>
                                            {doc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Type de rendez-vous */}
                    <div className="space-y-1">
                        <Label>Type</Label>
                        <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Ex: Consultation" />
                    </div>

                    {/* Motif */}
                    <div className="space-y-1">
                        <Label>Motif</Label>
                        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif du rendez-vous..." />
                    </div>

                    {/* Bouton de soumission */}
                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={loadingSubmit} // Désactiver le bouton pendant le chargement
                    >
                        {loadingSubmit ? <Loader2 className="animate-spin" /> : "Créer le rendez-vous"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
