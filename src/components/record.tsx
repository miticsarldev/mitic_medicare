"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
// import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const prescriptionSchema = z.object({
  medicationName: z.string().min(1, "Le nom du médicament est requis"),
  dosage: z.string().min(1, "La posologie est requise"),
  frequency: z.string().min(1, "La fréquence est requise"),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
});
 interface Appointment {
  id: string; 
  patientName: string;
  scheduledAt: string; 
}
const formSchema = z.object({
  diagnosis: z.string().min(1, "Le diagnostic est requis"),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  followUpNeeded: z.boolean().default(false),
  followUpDate: z.date().optional(),
  prescriptions: z.array(prescriptionSchema).optional(),
});

export function MedicalRecordModal({ 
  appointment,
  onSuccess,
  open,
  onOpenChange
}: {
  appointment: Appointment;
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      diagnosis: "",
      treatment: "",
      notes: "",
      followUpNeeded: false,
      prescriptions: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prescriptions"
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/hospital_doctor/history/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          ...data,
          followUpDate: data.followUpDate?.toISOString(),
          prescriptions: data.prescriptions?.map(p => ({
            ...p,
            startDate: p.startDate.toISOString(),
            endDate: p.endDate?.toISOString()
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du dossier");
      }

      toast({
        title: "Succès",
        description: "Le dossier médical a été créé avec succès.",
      });

      onSuccess();
      onOpenChange(false);

    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dossier médical pour {appointment.patientName}</DialogTitle>
          <DialogDescription>
            Rendez-vous du {format(new Date(appointment.scheduledAt), "PPP")}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="diagnosis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diagnostic *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez le diagnostic..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="treatment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Traitement</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez le traitement..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="followUpNeeded"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormLabel>Suivi nécessaire</FormLabel>
                  </FormItem>
                )}
              />
              
              {form.watch("followUpNeeded") && (
                <FormField
                  control={form.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Choisir une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date <= new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Prescriptions</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({
                  medicationName: "",
                  dosage: "",
                  frequency: "",
                  startDate: new Date()
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une prescription
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune prescription ajoutée</p>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <h5 className="font-medium">Prescription #{index + 1}</h5>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`prescriptions.${index}.medicationName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Médicament *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom du médicament" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.dosage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posologie *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 500mg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.frequency`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fréquence *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 3 fois par jour" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`prescriptions.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 7 jours" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de début *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Choisir une date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.endDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de fin</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Choisir une date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => {
                                    const startDate = form.getValues(`prescriptions.${index}.startDate`);
                                    return date < (startDate || new Date());
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`prescriptions.${index}.instructions`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Instructions spéciales..."
                              className="min-h-[60px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes complémentaires</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ajoutez des notes supplémentaires..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer le dossier"}
            </Button>
          </div>
         </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}