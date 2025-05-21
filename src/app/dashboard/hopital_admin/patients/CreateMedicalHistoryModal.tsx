'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react'

interface MedicalHistory {
    id: string;
    title: string;
    condition: string;
    diagnosedDate: string;
    status: string;
    details: string;
    doctor?: {
        id: string;
        specialty: string;
        name: string;
        email: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}


interface CreateMedicalHistoryModalProps {
    patientId: string
    addHistorique: (history: MedicalHistory) => void
}

export function CreateMedicalHistoryModal({ patientId, addHistorique }: CreateMedicalHistoryModalProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        condition: '',
        diagnosedDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        details: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (loading) return;

        try {
            setLoading(true);

            const diagnosedDateISO = `${formData.diagnosedDate}T00:00:00Z`;

            const response = await fetch('/api/hospital_admin/medical-history/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId,
                    ...formData,
                    diagnosedDate: diagnosedDateISO
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création');
            }

            const data = await response.json();

            // Appel à la fonction parente
            addHistorique(data.medicalHistorie);

            // Réinitialisation du formulaire
            setFormData({
                title: '',
                condition: '',
                diagnosedDate: new Date().toISOString().split('T')[0],
                status: 'ACTIVE',
                details: ''
            });

            toast({
                title: "Succès",
                description: "Historique créé avec succès",
            });

            setOpen(false);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Échec de la création",
                variant: "destructive"
            });
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Ajouter un historique médical</Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Ajouter un historique médical</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div>
                        <label className="text-sm font-medium">Date de diagnostic</label>
                        <input
                            type="date"
                            name="diagnosedDate"
                            value={formData.diagnosedDate}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <Input
                        name="title"
                        placeholder="Titre"
                        value={formData.title}
                        onChange={handleChange}
                    />

                    <Input
                        name="condition"
                        placeholder="Condition"
                        value={formData.condition}
                        onChange={handleChange}
                    />

                    <div>
                        <label className="text-sm font-medium">Statut</label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Actif</SelectItem>
                                <SelectItem value="RESOLVED">Résolu</SelectItem>
                                <SelectItem value="CHRONIC">Chronique</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Textarea
                        name="details"
                        placeholder="Détails"
                        value={formData.details}
                        onChange={handleChange}
                    />

                    <Button
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Enregistrer'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
