"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const DAYS = [
  { id: 0, name: "Dimanche" },
  { id: 1, name: "Lundi" },
  { id: 2, name: "Mardi" },
  { id: 3, name: "Mercredi" },
  { id: 4, name: "Jeudi" },
  { id: 5, name: "Vendredi" },
  { id: 6, name: "Samedi" },
];

type Availability = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
};

type DoctorWithAvailabilities = {
  id: string;
  name: string;
  specialization: string;
  availabilities: {
    day: string;
    dayOfWeek: number;
    availability: Availability | null;
  }[];
};
interface FormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}
export default function DoctorAvailabilityPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorWithAvailabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAvailability, setEditingAvailability] =
    useState<Availability | null>(null);
  const [formData, setFormData] = useState<FormData>({
    dayOfWeek: "1",
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 60,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    availabilityId: "",
  });

  useEffect(() => {
    if (session?.user?.role !== UserRole.INDEPENDENT_DOCTOR) {
      return;
    }

    fetchAvailabilities();
  }, [session, router]);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/independant_doctor/avaibility");

      if (!response.ok) {
        throw new Error("Failed to fetch availabilities");
      }

      const data = await response.json();
      const merged: DoctorWithAvailabilities = {
        id: data.doctor.id,
        name: data.doctor.name,
        specialization: data.doctor.specialization,
        availabilities: data.availabilities,
      };
      setDoctor(merged);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isValidTime(formData.startTime, formData.endTime)) {
      toast({
        title: "Erreur",
        description: "L'heure de fin doit être après l'heure de début",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingAvailability
        ? `/api/independant_doctor/avaibility?id=${editingAvailability.id}`
        : "/api/independant_doctor/avaibility";

      const method = editingAvailability ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingAvailability
            ? {
                id: editingAvailability.id,
                startTime: formData.startTime,
                endTime: formData.endTime,
                slotDuration: formData.slotDuration,
                isActive: formData.isActive,
              }
            : {
                dayOfWeek: formData.dayOfWeek,
                startTime: formData.startTime,
                endTime: formData.endTime,
                slotDuration: formData.slotDuration,
              }
        ),
      });

      if (!response.ok) {
        throw new Error(
          editingAvailability
            ? "Failed to update availability"
            : "Failed to create availability"
        );
      }

      await fetchAvailabilities();
      setOpenDialog(false);
      setEditingAvailability(null);

      toast({
        title: "Succès",
        description: editingAvailability
          ? "Disponibilité mise à jour avec succès"
          : "Disponibilité créée avec succès",
      });
    } catch (err: unknown) {
      let errorMessage = "Une erreur inattendue est survenue";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/independant_doctor/avaibility?id=${deleteConfirmation.availabilityId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete availability");
      }

      await fetchAvailabilities();
      setDeleteConfirmation({ open: false, availabilityId: "" });

      toast({
        title: "Succès",
        description: "Disponibilité supprimée avec succès",
      });
    } catch (err: unknown) {
      let errorMessage = "Une erreur inattendue est survenue";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidTime = (start: string, end: string) => {
    return new Date(`1970-01-01T${end}`) > new Date(`1970-01-01T${start}`);
  };

  const handleEdit = (availability: Availability) => {
    setEditingAvailability(availability);
    setFormData({
      dayOfWeek: availability.dayOfWeek?.toString() || "1",
      startTime: availability.startTime || "09:00",
      endTime: availability.endTime || "17:00",
      slotDuration: availability.slotDuration || 60,
      isActive: availability.isActive ?? true,
    });
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setEditingAvailability(null);
    setFormData({
      dayOfWeek: "1",
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 60,
      isActive: true,
    });
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Médecin non trouvé</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Disponibilités du {doctor.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une disponibilité
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jour</TableHead>
                <TableHead>Disponibilité</TableHead>
                <TableHead>Durée des créneaux</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctor.availabilities.map((day) => (
                <TableRow key={day.dayOfWeek}>
                  <TableCell>{day.day}</TableCell>
                  <TableCell>
                    {day.availability
                      ? `${day.availability.startTime} - ${day.availability.endTime}`
                      : "Non disponible"}
                  </TableCell>
                  <TableCell>
                    {day.availability
                      ? `${day.availability.slotDuration} minutes`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {day.availability ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          day.availability.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {day.availability.isActive ? "Active" : "Inactive"}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {day.availability && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(day.availability!)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setDeleteConfirmation({
                              open: true,
                              availabilityId: day.availability!.id,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog pour ajouter/modifier une disponibilité */}
      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          if (!open) {
            setEditingAvailability(null);
          }
          setOpenDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAvailability
                ? "Modifier la disponibilité"
                : "Nouvelle disponibilité"}
            </DialogTitle>
            <DialogDescription>
              {editingAvailability
                ? "Modifiez les détails de cette plage horaire"
                : "Définissez une nouvelle plage horaire"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!editingAvailability && (
              <div className="space-y-2">
                <Label>Jour</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) =>
                    setFormData({ ...formData, dayOfWeek: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => {
                      const isDayUsed = doctor.availabilities.some(
                        (a) => a.dayOfWeek === day.id && a.availability
                      );
                      return (
                        <SelectItem
                          key={day.id}
                          value={day.id.toString()}
                          disabled={isDayUsed}
                        >
                          {day.name}
                          {isDayUsed && " (déjà utilisé)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure de début</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Heure de fin</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Durée des créneaux (minutes)</Label>
              <Input
                type="number"
                min="15"
                max="120"
                step="5"
                value={formData.slotDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slotDuration: parseInt(e.target.value) || 60,
                  })
                }
              />
            </div>

            {editingAvailability && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isActive: checked,
                    })
                  }
                />
                <Label htmlFor="isActive">Disponibilité active</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : editingAvailability ? (
                "Modifier"
              ) : (
                "Ajouter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteConfirmation.open}
        onOpenChange={(open) =>
          setDeleteConfirmation({
            ...deleteConfirmation,
            open,
          })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette disponibilité ? Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteConfirmation({
                  open: false,
                  availabilityId: "",
                })
              }
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Confirmer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
