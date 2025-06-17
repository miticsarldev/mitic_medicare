import { FC, useState } from "react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

interface EditMedicalHistoryModalProps {
    history: MedicalHistory;
    onClose: () => void;
    onUpdate: (history: MedicalHistory) => void;
}

export const EditMedicalHistoryModal: FC<EditMedicalHistoryModalProps> = ({ 
    history, 
    onClose,
    onUpdate 
}) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        title: history.title,
        condition: history.condition,
        diagnosedDate: history.diagnosedDate ? new Date(history.diagnosedDate) : null,
        status: history.status,
        details: history.details || "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.title.trim()) {
            newErrors.title = "Le titre est requis";
        }
        
        if (!formData.condition.trim()) {
            newErrors.condition = "La condition est requise";
        }
        
        if (!formData.status) {
            newErrors.status = "Le statut est requis";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            const response = await fetch("/api/medical-history", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: history.id,
                    ...formData,
                    diagnosedDate: formData.diagnosedDate?.toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la mise à jour");
            }

            const data = await response.json();
            onUpdate(data.medicalHistorie);
            onClose();
            toast({
                title: "Succès",
                description: "L'historique médical a été mis à jour avec succès.",
                variant: "default",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la mise à jour.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Modifier l'historique médical</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Titre*</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                        />
                        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Condition*</label>
                        <Input
                            value={formData.condition}
                            onChange={(e) => handleChange("condition", e.target.value)}
                        />
                        {errors.condition && <p className="text-sm text-red-500 mt-1">{errors.condition}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Date de diagnostic</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !formData.diagnosedDate && "text-muted-foreground"
                                    )}
                                >
                                    {formData.diagnosedDate ? (
                                        format(formData.diagnosedDate, "PPP")
                                    ) : (
                                        <span>Choisir une date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.diagnosedDate || undefined}
                                    onSelect={(date) => handleChange("diagnosedDate", date)}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Statut*</label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleChange("status", e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="ACTIVE">Actif</option>
                            <option value="RESOLVED">Résolu</option>
                        </select>
                        {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Détails</label>
                        <Textarea
                            value={formData.details}
                            onChange={(e) => handleChange("details", e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button 
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};