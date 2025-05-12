'use client'
import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { deleteDoctorAvailability, getDoctorAvailabilities, upsertDoctorAvailability, updateSlotDurationForAllAvailabilities } from "@/app/actions/doctor-actions";
import { toast } from "@/hooks/use-toast";

type Doctor = {
    id: string;
    name: string;
    specialization: string;
};

type Availability = {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDuration: number;
    isActive: boolean;
    doctorId: string;
};

const DAYS = [
    { id: 0, name: "Dimanche" },
    { id: 1, name: "Lundi" },
    { id: 2, name: "Mardi" },
    { id: 3, name: "Mercredi" },
    { id: 4, name: "Jeudi" },
    { id: 5, name: "Vendredi" },
    { id: 6, name: "Samedi" },
];

export default function DoctorAvailabilityPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSlotDialog, setOpenSlotDialog] = useState(false);
    const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
    const [globalSlotDuration, setGlobalSlotDuration] = useState<number>(30);
    const [formData, setFormData] = useState({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30,
        isActive: true,
    });
    const [isLoading, setIsLoading] = useState({
        doctors: true,
        availabilities: false,
        form: false,
        slots: false,
    });
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        open: boolean;
        availabilityId: string | null;
    }>({ open: false, availabilityId: null });

    const loadDoctors = useCallback(async () => {
        try {
            const res = await fetch("/api/hospital_admin/doctors");
            const data = await res.json();
            setDoctors(data.doctors || []);
            if (data.doctors?.length > 0) {
                setSelectedDoctor(data.doctors[0].id);
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger la liste des médecins",
                variant: "destructive"
            });
            console.error("Erreur chargement médecins :", error);
        } finally {
            setIsLoading(prev => ({ ...prev, doctors: false }));
        }
    }, []);

    const loadAvailabilities = useCallback(async (doctorId: string) => {
        setIsLoading(prev => ({ ...prev, availabilities: true }));
        try {
            const data = await getDoctorAvailabilities(doctorId);
            setAvailabilities(data);
            // Si des disponibilités existent, on prend la durée de créneau de la première
            if (data.length > 0) {
                setGlobalSlotDuration(data[0].slotDuration);
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les disponibilités",
                variant: "destructive"
            });
            console.error("Erreur chargement disponibilités :", error);
        } finally {
            setIsLoading(prev => ({ ...prev, availabilities: false }));
        }
    }, []);

    useEffect(() => {
        loadDoctors();
    }, [loadDoctors]);

    useEffect(() => {
        if (selectedDoctor) {
            loadAvailabilities(selectedDoctor);
        }
    }, [selectedDoctor, loadAvailabilities]);

    const handleSubmit = async () => {
        if (!selectedDoctor) return;
        if (!isValidTime(formData.startTime, formData.endTime)) {
            toast({
                title: "Erreur",
                description: "L'heure de fin doit être après l'heure de début",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(prev => ({ ...prev, form: true }));
        try {
            if (editingAvailability) {
                await upsertDoctorAvailability({
                    ...editingAvailability,
                    ...formData
                });
                toast({
                    title: "Succès",
                    description: "Disponibilité modifiée avec succès",
                });
            } else {
                await upsertDoctorAvailability({
                    doctorId: selectedDoctor,
                    ...formData
                });
                toast({
                    title: "Succès",
                    description: "Disponibilité ajoutée avec succès",
                });
            }
            await loadAvailabilities(selectedDoctor);
            setOpenDialog(false);
            setEditingAvailability(null);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de l'enregistrement",
                variant: "destructive"
            });
            console.error("Erreur lors de l'enregistrement de la disponibilité :", error);
        } finally {
            setIsLoading(prev => ({ ...prev, form: false }));
        }
    };

    const handleUpdateSlotDuration = async () => {
        if (!selectedDoctor) return;

        setIsLoading(prev => ({ ...prev, slots: true }));
        try {
            await updateSlotDurationForAllAvailabilities(selectedDoctor, globalSlotDuration);
            await loadAvailabilities(selectedDoctor);
            toast({
                title: "Succès",
                description: "Durée des créneaux mise à jour pour toutes les disponibilités",
            });
            setOpenSlotDialog(false);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Échec de la mise à jour de la durée des créneaux",
                variant: "destructive"
            });
            console.error("Erreur lors de la mise à jour de la durée des créneaux :", error);
        } finally {
            setIsLoading(prev => ({ ...prev, slots: false }));
        }
    };

    const handleEdit = (availability: Availability) => {
        setEditingAvailability(availability);
        setFormData({
            dayOfWeek: availability.dayOfWeek,
            startTime: availability.startTime,
            endTime: availability.endTime,
            slotDuration: availability.slotDuration,
            isActive: availability.isActive,
        });
        setOpenDialog(true);
    };

    const handleDelete = async (id: string) => {
        setDeleteConfirmation({ open: true, availabilityId: id });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation.availabilityId) return;

        try {
            await deleteDoctorAvailability(deleteConfirmation.availabilityId);
            toast({
                title: "Succès",
                description: "Disponibilité supprimée avec succès",
            });
            if (selectedDoctor) {
                await loadAvailabilities(selectedDoctor);
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Échec de la suppression de la disponibilité",
                variant: "destructive"
            });
            console.error("Erreur lors de la suppression de la disponibilité :", error);
        } finally {
            setDeleteConfirmation({ open: false, availabilityId: null });
        }
    };

    const isValidTime = (start: string, end: string) => {
        return new Date(`1970-01-01T${end}`) > new Date(`1970-01-01T${start}`);
    };

    const getAvailabilityForDay = (dayOfWeek: number) => {
        return availabilities.filter(a => a.dayOfWeek === dayOfWeek && a.isActive);
    };

    const resetForm = () => {
        setFormData({
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "17:00",
            slotDuration: globalSlotDuration,
            isActive: true,
        });
        setEditingAvailability(null);
    };

    const getUsedDays = () => {
        return availabilities.map(a => a.dayOfWeek);
    };

    const handleDayChange = (dayId: number) => {
        const usedDays = getUsedDays();
        if (editingAvailability) {
            // Permet de changer le jour si on est en mode édition
            setFormData({ ...formData, dayOfWeek: dayId });
        } else if (!usedDays.includes(dayId)) {
            // Permet de choisir un jour seulement s'il n'est pas déjà utilisé
            setFormData({ ...formData, dayOfWeek: dayId });
        } else {
            toast({
                title: "Jour indisponible",
                description: "Ce jour a déjà une disponibilité. Veuillez modifier la disponibilité existante.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="p-4 space-y-4 mx-auto">
            {/* affichage de skeleton lors du chargement */}
            {isLoading.doctors || isLoading.availabilities ? (
                <div className="space-y-4 mb-4">
                    {/* Titre + Select */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-60"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full sm:w-72"></div>
                    </div>

                    {/* Bouton ajouter */}
                    <div className="flex justify-end animate-pulse">
                        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>

                    {/* Tableau simulé */}
                    <div className="border rounded-lg overflow-hidden animate-pulse">
                        <div className="grid grid-cols-7 gap-2 p-4">
                            {DAYS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className="h-32 bg-gray-100 dark:bg-gray-800 rounded"
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle className="text-xl font-bold">Disponibilités des médecins</CardTitle>
                            <div className="w-full sm:w-72">
                                <Select
                                    value={selectedDoctor || ""}
                                    onValueChange={setSelectedDoctor}
                                    disabled={isLoading.doctors}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner un médecin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map(doctor => (
                                            <SelectItem key={doctor.id} value={doctor.id}>
                                                {doctor.name} ({doctor.specialization})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {selectedDoctor && (
                            <>
                                <div className="flex justify-between items-center">
                                    <Button
                                        onClick={() => {
                                            resetForm();
                                            setOpenDialog(true);
                                        }}
                                        size="sm"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Ajouter une disponibilité
                                    </Button>
                                    <Button
                                        onClick={() => setOpenSlotDialog(true)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Modifier durée des créneaux
                                    </Button>
                                </div>

                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {DAYS.map(day => (
                                                    <TableHead key={day.id} className="text-center p-2">
                                                        {day.name}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                {DAYS.map(day => {
                                                    const dayAvailabilities = getAvailabilityForDay(day.id);
                                                    return (
                                                        <TableCell key={day.id} className="p-2 align-top h-40">
                                                            {dayAvailabilities.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {dayAvailabilities.map(avail => {

                                                                        return (
                                                                            <div
                                                                                key={avail.id}
                                                                                className="group p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                                                            >
                                                                                <div className="flex justify-between items-center mb-1">
                                                                                    <span className="text-sm font-medium">
                                                                                        {avail.startTime} - {avail.endTime}
                                                                                    </span>
                                                                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-6 w-6"
                                                                                            onClick={() => handleEdit(avail)}
                                                                                        >
                                                                                            <Pencil className="h-3 w-3 text-blue-500" />
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-6 w-6"
                                                                                            onClick={() => handleDelete(avail.id)}
                                                                                        >
                                                                                            <Trash2 className="h-3 w-3 text-red-500" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-xs text-muted-foreground mb-1">
                                                                                    Créneaux de {avail.slotDuration} min
                                                                                </div>

                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground text-center pt-4">
                                                                    Aucune disponibilité
                                                                </p>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Dialog pour ajouter/modifier une disponibilité */}
            <Dialog open={openDialog} onOpenChange={(open) => {
                if (!open) {
                    setEditingAvailability(null);
                    resetForm();
                }
                setOpenDialog(open);
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAvailability ? "Modifier la disponibilité" : "Nouvelle disponibilité"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAvailability ?
                                "Modifiez les détails de cette plage horaire" :
                                "Définissez une nouvelle plage horaire pour ce médecin"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Jour</Label>
                            <Select
                                value={formData.dayOfWeek.toString()}
                                onValueChange={(val) => handleDayChange(parseInt(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un jour" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS.map(day => {
                                        const isDayUsed = getUsedDays().includes(day.id) && !editingAvailability;
                                        return (
                                            <SelectItem
                                                key={day.id}
                                                value={day.id.toString()}
                                                disabled={isDayUsed}
                                                className={isDayUsed ? "opacity-50 cursor-not-allowed" : ""}
                                            >
                                                {day.name}
                                                {isDayUsed && " (déjà utilisé)"}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Heure de début</Label>
                                <Input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Heure de fin</Label>
                                <Input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Durée des créneaux (minutes)</Label>
                            <Input
                                type="number"
                                min="5"
                                max="120"
                                step="5"
                                value={formData.slotDuration}
                                onChange={e => setFormData({ ...formData, slotDuration: parseInt(e.target.value) || 30 })}
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={val => setFormData({ ...formData, isActive: val })}
                            />
                            <Label htmlFor="isActive">Disponibilité active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpenDialog(false);
                                resetForm();
                            }}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading.form}
                        >
                            {isLoading.form ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : editingAvailability ? "Modifier" : "Ajouter"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog pour modifier la durée des créneaux */}
            <Dialog open={openSlotDialog} onOpenChange={setOpenSlotDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modifier la durée des créneaux</DialogTitle>
                        <DialogDescription>
                            Cette modification s&apos;appliquera à toutes les disponibilités existantes pour ce médecin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Nouvelle durée des créneaux (minutes)</Label>
                            <Input
                                type="number"
                                min="5"
                                max="120"
                                step="5"
                                value={globalSlotDuration}
                                onChange={e => setGlobalSlotDuration(parseInt(e.target.value) || 30)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenSlotDialog(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleUpdateSlotDuration}
                            disabled={isLoading.slots}
                        >
                            {isLoading.slots ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : "Mettre à jour"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteConfirmation.open}
                onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, open }))}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette disponibilité ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmation({ open: false, availabilityId: null })}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Confirmer la suppression
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}