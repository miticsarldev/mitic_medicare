'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Department {
    id: string;
    name: string;
}

interface DoctorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDoctorCreated?: () => void; // Callback après création réussie
    departments?: Department[]; // Optionnel: peut passer les départements en props
}

export default function DoctorModal({ open, onOpenChange, onDoctorCreated, departments: initialDepartments }: DoctorModalProps) {
    const [departments, setDepartments] = useState<Department[]>(initialDepartments || []);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        specialization: '',
        licenseNumber: '',
        education: '',
        experience: '',
        consultationFee: '',
        departmentId: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        bio: '',
        avatarUrl: '',
        genre: '',
    });

    useEffect(() => {
        if (!initialDepartments && open) {
            const fetchDepartments = async () => {
                setLoading(true);
                try {
                    const res = await fetch('/api/hospital_admin/department');
                    const data = await res.json();
                    setDepartments(data.departments || []);
                } catch (error) {
                    console.error('Erreur chargement départements :', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDepartments();
        }
    }, [open, initialDepartments]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const res = await fetch('/api/hospital_admin/doctors/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de la création du médecin.');
            }

            toast({
                title: 'Succès',
                description: 'Le médecin a été créé avec succès.',
                variant: 'default',
            });

            // Réinitialiser le formulaire
            setForm({
                name: '',
                email: '',
                phone: '',
                password: '',
                specialization: '',
                licenseNumber: '',
                education: '',
                experience: '',
                consultationFee: '',
                departmentId: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                bio: '',
                avatarUrl: '',
                genre: '',
            });

            // Fermer le modal et rafraîchir la liste si besoin
            onOpenChange(false);
            if (onDoctorCreated) onDoctorCreated();

        } catch (err) {
            toast({
                title: 'Erreur',
                description: err instanceof Error ? err.message : 'Une erreur est survenue',
                variant: 'destructive',
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Ajouter un nouveau médecin</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Colonne 1 */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nom complet*</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email*</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Téléphone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="password">Mot de passe*</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <Label htmlFor="specialization">Spécialisation*</Label>
                                <Input
                                    id="specialization"
                                    name="specialization"
                                    value={form.specialization}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="departmentId">Département*</Label>
                                <Select
                                    onValueChange={(value) => setForm(prev => ({ ...prev, departmentId: value }))}
                                    value={form.departmentId}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loading ? "Chargement..." : "Sélectionnez un département"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Colonne 2 */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="licenseNumber">Numéro de licence*</Label>
                                <Input
                                    id="licenseNumber"
                                    name="licenseNumber"
                                    value={form.licenseNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="consultationFee">Frais de consultation (FCFA)*</Label>
                                <Input
                                    id="consultationFee"
                                    name="consultationFee"
                                    type="number"
                                    value={form.consultationFee}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                />
                            </div>

                            <div>
                                <Label htmlFor="genre">Genre</Label>
                                <Input
                                    id="genre"
                                    name="genre"
                                    value={form.genre}
                                    onChange={handleChange}
                                    placeholder="Homme, Femme, Autre"
                                />
                            </div>

                            <div>
                                <Label htmlFor="avatarUrl">Photo de profil (URL)</Label>
                                <Input
                                    id="avatarUrl"
                                    name="avatarUrl"
                                    type="url"
                                    value={form.avatarUrl}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="city">Ville</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="country">Pays</Label>
                                <Input
                                    id="country"
                                    name="country"
                                    value={form.country}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Champs en pleine largeur */}
                    <div>
                        <Label htmlFor="address">Adresse</Label>
                        <Input
                            id="address"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="state">État/Région</Label>
                            <Input
                                id="state"
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="zipCode">Code postal</Label>
                            <Input
                                id="zipCode"
                                name="zipCode"
                                value={form.zipCode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="education">Éducation</Label>
                        <Textarea
                            id="education"
                            name="education"
                            value={form.education}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="experience">Expérience</Label>
                        <Textarea
                            id="experience"
                            name="experience"
                            value={form.experience}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitLoading}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitLoading}
                        >
                            {submitLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Création...
                                </>
                            ) : 'Créer le médecin'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}