'use client'
import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Pencil, Loader2, Users, X } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { deleteDoctorAvailability, getDoctorAvailabilities, upsertDoctorAvailability, updateSlotDurationForAllAvailabilities,  updateAvailabilityForMultipleDoctors } from "@/app/actions/doctor-actions";
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
    const [openMultiDoctorDialog, setOpenMultiDoctorDialog] = useState(false);
    const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
    const [multiDoctorFormData, setMultiDoctorFormData] = useState({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30,
        isActive: true,
    });
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
        multiDoctor: false,
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
            setFormData({ ...formData, dayOfWeek: dayId });
        } else if (!usedDays.includes(dayId)) {
            setFormData({ ...formData, dayOfWeek: dayId });
        } else {
            toast({
                title: "Jour indisponible",
                description: "Ce jour a déjà une disponibilité. Veuillez modifier la disponibilité existante.",
                variant: "destructive"
            });
        }
    };

    const MultiSelect = ({
        options,
        value,
        onChange,
        placeholder
    }: {
        options: { value: string, label: string }[],
        value: string[],
        onChange: (values: string[]) => void,
        placeholder?: string
    }) => {
        const toggleValue = (val: string) => {
            if (value.includes(val)) {
                onChange(value.filter(v => v !== val));
            } else {
                onChange([...value, val]);
            }
        };

        return (
            <div className="border rounded-md p-2 min-h-10">
                {value.length === 0 && (
                    <span className="text-muted-foreground">{placeholder}</span>
                )}
                <div className="flex flex-wrap gap-2">
                    {value.map(val => {
                        const option = options.find(o => o.value === val);
                        return (
                            <span
                                key={val}
                                className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm flex items-center"
                            >
                                {option?.label}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleValue(val);
                                    }}
                                    className="ml-2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
                <div className="mt-2 space-y-1">
                    {options.map(option => (
                        <div
                            key={option.value}
                            className={`p-2 text-sm rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${value.includes(option.value) ? 'bg-gray-100 dark:bg-gray-800' : ''
                                }`}
                            onClick={() => toggleValue(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const handleUpdateMultipleDoctorsAvailability = async () => {
        if (selectedDoctors.length === 0) {
            toast({
                title: "Erreur",
                description: "Veuillez sélectionner au moins un médecin",
                variant: "destructive"
            });
            return;
        }

        if (!isValidTime(multiDoctorFormData.startTime, multiDoctorFormData.endTime)) {
            toast({
                title: "Erreur",
                description: "L'heure de fin doit être après l'heure de début",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(prev => ({ ...prev, multiDoctor: true }));
        try {
            const updatedCount = await updateAvailabilityForMultipleDoctors(
                selectedDoctors,
                multiDoctorFormData.dayOfWeek,
                multiDoctorFormData.startTime,
                multiDoctorFormData.endTime,
                multiDoctorFormData.slotDuration,
                multiDoctorFormData.isActive
            );

            toast({
                title: "Succès",
                description: `Disponibilité mise à jour pour ${updatedCount} médecin(s)`,
            });

            if (selectedDoctor) {
                await loadAvailabilities(selectedDoctor);
            }
            setOpenMultiDoctorDialog(false);
            setSelectedDoctors([]);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Échec de la mise à jour des disponibilités",
                variant: "destructive"
            });
            console.error("Erreur lors de la mise à jour multiple:", error);
        } finally {
            setIsLoading(prev => ({ ...prev, multiDoctor: false }));
        }
    };

    return (
        <div className="p-4 space-y-4 mx-auto">
            {isLoading.doctors || isLoading.availabilities ? (
                <div className="space-y-4 mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-60"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full sm:w-72"></div>
                    </div>

                    <div className="flex justify-end animate-pulse">
                        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>

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
                                        Modifier créneaux du medecin
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setMultiDoctorFormData({
                                                dayOfWeek: 1,
                                                startTime: "09:00",
                                                endTime: "17:00",
                                                slotDuration: globalSlotDuration,
                                                isActive: true,
                                            });
                                            setOpenMultiDoctorDialog(true);
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="ml-2"
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        Modifier plusieurs médecins
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

            {/* Dialog pour modifier la disponibilité pour plusieurs médecins */}
            <Dialog open={openMultiDoctorDialog} onOpenChange={setOpenMultiDoctorDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Modifier la disponibilité pour plusieurs médecins</DialogTitle>
                        <DialogDescription>
                            Définissez une nouvelle plage horaire qui sera appliquée aux médecins sélectionnés.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Médecins à modifier</Label>
                            <MultiSelect
                                options={doctors.map(d => ({
                                    value: d.id,
                                    label: `${d.name} (${d.specialization})`
                                }))}
                                value={selectedDoctors}
                                onChange={setSelectedDoctors}
                                placeholder="Sélectionnez un ou plusieurs médecins"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Jour</Label>
                            <Select
                                value={multiDoctorFormData.dayOfWeek.toString()}
                                onValueChange={(val) => setMultiDoctorFormData({
                                    ...multiDoctorFormData,
                                    dayOfWeek: parseInt(val)
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un jour" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS.map(day => (
                                        <SelectItem
                                            key={day.id}
                                            value={day.id.toString()}
                                        >
                                            {day.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Heure de début</Label>
                                <Input
                                    type="time"
                                    value={multiDoctorFormData.startTime}
                                    onChange={e => setMultiDoctorFormData({
                                        ...multiDoctorFormData,
                                        startTime: e.target.value
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Heure de fin</Label>
                                <Input
                                    type="time"
                                    value={multiDoctorFormData.endTime}
                                    onChange={e => setMultiDoctorFormData({
                                        ...multiDoctorFormData,
                                        endTime: e.target.value
                                    })}
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
                                value={multiDoctorFormData.slotDuration}
                                onChange={e => setMultiDoctorFormData({
                                    ...multiDoctorFormData,
                                    slotDuration: parseInt(e.target.value) || 30
                                })}
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                id="multiIsActive"
                                checked={multiDoctorFormData.isActive}
                                onCheckedChange={val => setMultiDoctorFormData({
                                    ...multiDoctorFormData,
                                    isActive: val
                                })}
                            />
                            <Label htmlFor="multiIsActive">Disponibilité active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpenMultiDoctorDialog(false);
                                setSelectedDoctors([]);
                            }}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleUpdateMultipleDoctorsAvailability}
                            disabled={isLoading.multiDoctor}
                        >
                            {isLoading.multiDoctor ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : "Mettre à jour"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}