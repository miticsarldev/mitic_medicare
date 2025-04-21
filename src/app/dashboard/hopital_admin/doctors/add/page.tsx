
'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Department {
    id: string;
    name: string;
}

interface DoctorFormProps {
    onSuccess?: () => void;
}

export default function DoctorForm({ onSuccess }: DoctorFormProps) {
    const [departments, setDepartments] = useState<Department[]>([]);
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
    const [message, setMessage] = useState('');

    useEffect(() => {
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
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        setMessage('');

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

            setMessage('✅ Médecin créé avec succès.');
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

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto p-8 rounded-2xl shadow-xl bg-background text-foreground space-y-6"
        >
            <h2 className="text-2xl font-bold mb-2">Créer un Médecin</h2>

            {message && (
                <div className="text-sm font-medium px-4 py-2 rounded bg-muted text-muted-foreground border">
                    {message}
                </div>
            )}

            {/* Champs à 2 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="name">Nom</Label>
                    <Input name="name" value={form.name} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input name="email" value={form.email} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input name="phone" value={form.phone} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input type="password" name="password" value={form.password} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="specialization">Spécialisation</Label>
                    <Input name="specialization" value={form.specialization} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="licenseNumber">Numéro de licence</Label>
                    <Input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="consultationFee">Frais de consultation (€)</Label>
                    <Input type="number" name="consultationFee" value={form.consultationFee} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Input name="genre" value={form.genre} onChange={handleChange} placeholder="Homme / Femme / Autre" />
                </div>

                <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input name="address" value={form.address} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input name="city" value={form.city} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="state">État</Label>
                    <Input name="state" value={form.state} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="zipCode">Code postal</Label>
                    <Input name="zipCode" value={form.zipCode} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="country">Pays</Label>
                    <Input name="country" value={form.country} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="avatarUrl">Photo de profil (URL)</Label>
                    <Input name="avatarUrl" value={form.avatarUrl} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="departmentId">Département</Label>
                    <Select onValueChange={(value) => setForm((prev) => ({ ...prev, departmentId: value }))}>
                        <SelectTrigger>
                            <SelectValue placeholder={loading ? 'Chargement...' : 'Sélectionner un département'} />
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

            {/* Textareas */}
            <div>
                <Label htmlFor="education">Éducation</Label>
                <Textarea name="education" value={form.education} onChange={handleChange} />
            </div>

            <div>
                <Label htmlFor="experience">Expérience</Label>
                <Textarea name="experience" value={form.experience} onChange={handleChange} />
            </div>

            <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea name="bio" value={form.bio} onChange={handleChange} />
            </div>

            {/* Submit */}
            <div className="pt-4">
                <Button type="submit" disabled={submitLoading} className="w-full md:w-auto">
                    {submitLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Créer'}
                </Button>
            </div>
        </form>
    );
}
