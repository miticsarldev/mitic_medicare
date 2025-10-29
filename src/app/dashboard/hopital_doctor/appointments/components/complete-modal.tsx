"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Plus,
  X,
  Upload,
  File,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Appointment } from "@/types/appointment";
import { useEdgeStore } from "@/lib/edgestore";
import { useState } from "react";

const formSchema = z.object({
  diagnosis: z.string().min(1, "Le diagnostic est requis"),
  treatment: z.string().min(1, "Le traitement est requis"),
  notes: z.string().optional(),
  followUpNeeded: z.boolean().default(false),
  followUpDate: z.date().optional(),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileUrl: z.string(),
        fileSize: z.number(),
      })
    )
    .optional(),
  prescriptions: z
    .array(
      z.object({
        medicationName: z.string().min(1, "Le nom du médicament est requis"),
        dosage: z.string().min(1, "La posologie est requise"),
        frequency: z.string().min(1, "La fréquence est requise"),
        duration: z.string().min(1, "La durée est requise"),
        instructions: z.string().optional(),
        isActive: z.boolean().default(true),
        startDate: z.string().min(1, "La date de début est requise"),
        endDate: z.string().min(1, "La date de fin est requise"),
      })
    )
    .optional(),
});
type MedicalFormValues = z.infer<typeof formSchema>;

interface CompleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

export function CompleteModal({
  open,
  onOpenChange,
  appointment,
  onSubmit,
  defaultValues,
}: CompleteModalProps & { defaultValues?: MedicalFormValues }) {
  const { edgestore } = useEdgeStore();
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadingFileNames, setUploadingFileNames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MedicalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      diagnosis: "",
      treatment: "",
      notes: "",
      followUpNeeded: false,
      prescriptions: [],
      attachments: [],
    },
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    setUploadingFileNames(Array.from(files).map((file) => file.name));

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const res = await edgestore.publicFiles.upload({
          file,
          options: {
            temporary: false,
          },
        });
        return {
          fileName: file.name,
          fileType: file.type,
          fileUrl: res.url,
          fileSize: file.size,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const currentAttachments = form.getValues("attachments") || [];
      form.setValue("attachments", [...currentAttachments, ...uploadedFiles]);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploadingFiles(false);
      setUploadingFileNames([]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const currentAttachments = form.getValues("attachments") || [];
    form.setValue(
      "attachments",
      currentAttachments.filter((_, i) => i !== index)
    );
  };

  const handleAddPrescription = () => {
    form.setValue("prescriptions", [
      ...(form.watch("prescriptions") || []),
      {
        medicationName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        isActive: true,
        startDate: "",
        endDate: "",
      },
    ]);
  };

  const handleRemovePrescription = (index: number) => {
    form.setValue(
      "prescriptions",
      form.watch("prescriptions")?.filter((_, i) => i !== index) || []
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compléter le rendez-vous</DialogTitle>
          <DialogDescription>
            Veuillez remplir les informations médicales pour finaliser ce
            rendez-vous avec {appointment.patient.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              setSubmitting(true);
              try {
                await Promise.resolve(onSubmit(data));
              } finally {
                setSubmitting(false);
              }
            })}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnostic</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Entrez le diagnostic..."
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
                        {...field}
                        placeholder="Décrivez le traitement..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes supplémentaires</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ajoutez des notes si nécessaire..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="followUpNeeded"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Suivi nécessaire</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("followUpNeeded") && (
                  <FormField
                    control={form.control}
                    name="followUpDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de suivi</FormLabel>
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
                                  <span>Choisissez une date</span>
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
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Pièces jointes</h3>
              <div className="space-y-4">
                {/* Show uploading files */}
                {uploadingFileNames.map((fileName, index) => (
                  <div
                    key={`uploading-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      <div>
                        <p className="font-medium text-blue-900">{fileName}</p>
                        <p className="text-sm text-blue-600">
                          Upload en cours...
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Show uploaded files */}
                {form.watch("attachments")?.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{attachment.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {attachment.fileType} •{" "}
                          {(attachment.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(attachment.fileUrl, "_blank")
                        }
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    disabled={uploadingFiles}
                  />
                  <label
                    htmlFor="file-upload"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                      uploadingFiles && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {uploadingFiles ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploadingFiles
                      ? "Upload en cours..."
                      : "Ajouter des fichiers"}
                  </label>
                  <span className="text-sm text-gray-500">
                    PDF, DOC, DOCX, JPG, PNG, GIF
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Prescriptions</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPrescription}
                >
                  <Plus className="mr-2 h-4 w-4" /> Ajouter une prescription
                </Button>
              </div>

              <div className="space-y-6">
                {form.watch("prescriptions")?.map((_, index) => (
                  <div key={index} className="border p-4 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Prescription #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePrescription(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.medicationName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Médicament</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nom du médicament"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.dosage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posologie</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: 500mg" />
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
                            <FormLabel>Fréquence</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ex: 3 fois par jour"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: 7 jours" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de début</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
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
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.instructions`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Instructions spéciales</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Instructions supplémentaires..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.isActive`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Prescription active</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={submitting || uploadingFiles}>
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                  </span>
                ) : (
                  "Enregistrer et terminer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
