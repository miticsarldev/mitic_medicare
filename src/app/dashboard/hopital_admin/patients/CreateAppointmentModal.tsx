import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { AppointmentStatus } from "@prisma/client";
import { toast } from "@/hooks/use-toast";
import { getDoctorSlotsWithTakenStatus } from "@/app/actions/doctor-actions";

type Doctor = {
  id: string;
  name: string;
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

type SlotResult = { all: string[]; taken: string[] };
type SlotResultByWeek = { [day: string]: SlotResult };

export function CreateAppointmentModal({
  patientId,
  appointmentDate,
  addAppointment,
}: {
  patientId: string;
  appointmentDate: Date;
  addAppointment: (newAppointment: Appointment) => void;
}) {
  const [open, setOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [doctorId, setDoctorId] = useState<string | undefined>();
  const [slots, setSlots] = useState<string[]>([]);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [reason, setReason] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Chargement des médecins quand modal ouvert
  useEffect(() => {
    if (!open) return;
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await fetch("/api/hospital_admin/doctors");
        const data = await res.json();
        setDoctors(data.doctors);
        setSelectedSlot(null);
      } catch (err) {
        console.error("Erreur chargement médecins", err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [open]);

  function isSlotResultPerDate(
    res: SlotResult | SlotResultByWeek
  ): res is SlotResult {
    return (
      typeof res === "object" &&
      res !== null &&
      "all" in res &&
      Array.isArray((res as SlotResult).all)
    );
  }

  // Charger les créneaux après sélection du médecin
  useEffect(() => {
    if (!doctorId || !appointmentDate) return;

    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await getDoctorSlotsWithTakenStatus(
          doctorId,
          appointmentDate
        );

        if (isSlotResultPerDate(res)) {
          setSlots(res.all);
          setTakenSlots(res.taken);
        } else {
          console.error("Résultat inattendu (slots par semaine)", res);
          setSlots([]);
          setTakenSlots([]);
        }
      } catch (err) {
        console.error("Erreur chargement créneaux", err);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [doctorId, appointmentDate]);

  const handleSubmit = async () => {
    if (!doctorId || !selectedSlot) {
      toast({
        title: "Champs manquants",
        description: "Veuillez sélectionner un médecin et un créneau horaire.",
      });
      return;
    }

    const [hour, minute] = selectedSlot.split(":").map(Number);
    const finalDate = new Date(appointmentDate);
    finalDate.setHours(hour, minute, 0, 0);

    setLoadingSubmit(true);
    try {
      const res = await fetch("/api/hospital_admin/appointment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          doctorId,
          scheduledAt: finalDate,
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
        description: "Une erreur est survenue lors de la création.",
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

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
          {/* Médecin */}
          <div className="space-y-1">
            <Label>Médecin *</Label>
            {loadingDoctors ? (
              <Loader2 className="animate-spin mx-auto" />
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

          {/* Créneaux horaires */}
          {doctorId && (
            <div className="space-y-1">
              <Label>Heure *</Label>
              {loadingSlots ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {slots.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Aucun créneau disponible pour ce médecin.
                    </div>
                  ) : (
                    slots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? "default" : "outline"}
                        onClick={() => setSelectedSlot(slot)}
                        disabled={takenSlots.includes(slot)}
                      >
                        {slot}
                      </Button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Motif */}
          <div className="space-y-1">
            <Label>Motif</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motif du rendez-vous..."
            />
          </div>

          {doctorId && selectedSlot && (
            <div className="text-sm text-muted-foreground italic">
              Rendez-vous le{" "}
              {appointmentDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              à {selectedSlot}
            </div>
          )}

          {/* Bouton soumission */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loadingSubmit}
          >
            {loadingSubmit ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Créer le rendez-vous"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
