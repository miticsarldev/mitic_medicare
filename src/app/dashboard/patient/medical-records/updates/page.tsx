/* eslint-disable @next/next/no-img-element */
"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Check,
  ChevronLeft,
  FileText,
  FlaskConical,
  ImageIcon,
  Info,
  Pill,
  Plus,
  Stethoscope,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Type definitions
type RecordType =
  | "consultation"
  | "laboratory"
  | "imaging"
  | "prescription"
  | "vaccination"
  | "surgery"
  | "allergy"
  | "dental"
  | "ophthalmology";
type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
};

// Helper function to get icon for record type
const getRecordTypeIcon = (type: RecordType) => {
  switch (type) {
    case "consultation":
      return <Stethoscope className="h-5 w-5" />;
    case "laboratory":
      return <FlaskConical className="h-5 w-5" />;
    case "imaging":
      return <ImageIcon className="h-5 w-5" />;
    case "prescription":
      return <Pill className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

// Helper function to get color for record type
const getRecordTypeColor = (type: RecordType) => {
  switch (type) {
    case "consultation":
      return "text-blue-500 bg-blue-50";
    case "laboratory":
      return "text-purple-500 bg-purple-50";
    case "imaging":
      return "text-amber-500 bg-amber-50";
    case "prescription":
      return "text-emerald-500 bg-emerald-50";
    case "vaccination":
      return "text-teal-500 bg-teal-50";
    case "surgery":
      return "text-red-500 bg-red-50";
    case "allergy":
      return "text-orange-500 bg-orange-50";
    case "dental":
      return "text-cyan-500 bg-cyan-50";
    case "ophthalmology":
      return "text-indigo-500 bg-indigo-50";
    default:
      return "text-gray-500 bg-gray-50";
  }
};

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

export default function UploadMedicalRecordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [recordType, setRecordType] = useState<RecordType | "">("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [doctor, setDoctor] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [facility, setFacility] = useState("");
  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `file-${Date.now()}-${i}`;

      // Create file preview for images
      let preview: string | undefined = undefined;
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file);
      }

      newFiles.push({
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        preview,
      });
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  // Remove uploaded file
  const removeFile = (id: string) => {
    const updatedFiles = uploadedFiles.filter((file) => file.id !== id);
    setUploadedFiles(updatedFiles);
  };

  // Add a new tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitDialogOpen(true);
    }, 1500);
  };

  // Go back to medical records page
  const goBack = () => {
    router.push("/dashboard/patient/medical-records");
  };

  // Check if current step is valid
  const isStepValid = () => {
    if (step === 1) {
      return recordType !== "" && title.trim() !== "" && date !== undefined;
    }
    if (step === 2) {
      return (
        doctor.trim() !== "" &&
        specialty.trim() !== "" &&
        facility.trim() !== ""
      );
    }
    if (step === 3) {
      return summary.trim() !== "";
    }
    if (step === 4) {
      return uploadedFiles.length > 0;
    }
    return true;
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Ajouter un document médical
            </h2>
            <p className="text-muted-foreground">
              Ajoutez un nouveau document à votre dossier médical
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Étapes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                <button
                  className={`flex items-center gap-3 border-l-2 px-4 py-3 text-left ${
                    step === 1
                      ? "border-l-primary bg-primary/5 font-medium"
                      : "border-l-transparent hover:bg-accent"
                  }`}
                  onClick={() => setStep(1)}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      step > 1
                        ? "bg-primary text-primary-foreground"
                        : "border border-input"
                    }`}
                  >
                    {step > 1 ? <Check className="h-3 w-3" /> : <span>1</span>}
                  </div>
                  <span>Informations générales</span>
                </button>
                <button
                  className={`flex items-center gap-3 border-l-2 px-4 py-3 text-left ${
                    step === 2
                      ? "border-l-primary bg-primary/5 font-medium"
                      : "border-l-transparent hover:bg-accent"
                  }`}
                  onClick={() => (recordType ? setStep(2) : null)}
                  disabled={!recordType}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      step > 2
                        ? "bg-primary text-primary-foreground"
                        : step === 2
                        ? "border border-input"
                        : "border border-input text-muted-foreground"
                    }`}
                  >
                    {step > 2 ? <Check className="h-3 w-3" /> : <span>2</span>}
                  </div>
                  <span
                    className={
                      step < 2 && !recordType ? "text-muted-foreground" : ""
                    }
                  >
                    Professionnel de santé
                  </span>
                </button>
                <button
                  className={`flex items-center gap-3 border-l-2 px-4 py-3 text-left ${
                    step === 3
                      ? "border-l-primary bg-primary/5 font-medium"
                      : "border-l-transparent hover:bg-accent"
                  }`}
                  onClick={() => (step > 2 ? setStep(3) : null)}
                  disabled={step < 3}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      step > 3
                        ? "bg-primary text-primary-foreground"
                        : step === 3
                        ? "border border-input"
                        : "border border-input text-muted-foreground"
                    }`}
                  >
                    {step > 3 ? <Check className="h-3 w-3" /> : <span>3</span>}
                  </div>
                  <span className={step < 3 ? "text-muted-foreground" : ""}>
                    Détails médicaux
                  </span>
                </button>
                <button
                  className={`flex items-center gap-3 border-l-2 px-4 py-3 text-left ${
                    step === 4
                      ? "border-l-primary bg-primary/5 font-medium"
                      : "border-l-transparent hover:bg-accent"
                  }`}
                  onClick={() => (step > 3 ? setStep(4) : null)}
                  disabled={step < 4}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      step > 4
                        ? "bg-primary text-primary-foreground"
                        : step === 4
                        ? "border border-input"
                        : "border border-input text-muted-foreground"
                    }`}
                  >
                    {step > 4 ? <Check className="h-3 w-3" /> : <span>4</span>}
                  </div>
                  <span className={step < 4 ? "text-muted-foreground" : ""}>
                    Documents
                  </span>
                </button>
                <button
                  className={`flex items-center gap-3 border-l-2 px-4 py-3 text-left ${
                    step === 5
                      ? "border-l-primary bg-primary/5 font-medium"
                      : "border-l-transparent hover:bg-accent"
                  }`}
                  onClick={() => (step > 4 ? setStep(5) : null)}
                  disabled={step < 5}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      step > 5
                        ? "bg-primary text-primary-foreground"
                        : step === 5
                        ? "border border-input"
                        : "border border-input text-muted-foreground"
                    }`}
                  >
                    {step > 5 ? <Check className="h-3 w-3" /> : <span>5</span>}
                  </div>
                  <span className={step < 5 ? "text-muted-foreground" : ""}>
                    Finalisation
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "Informations générales"}
                {step === 2 && "Professionnel de santé"}
                {step === 3 && "Détails médicaux"}
                {step === 4 && "Documents"}
                {step === 5 && "Finalisation"}
              </CardTitle>
              <CardDescription>
                {step === 1 &&
                  "Renseignez les informations de base du document"}
                {step === 2 &&
                  "Informations sur le professionnel de santé concerné"}
                {step === 3 && "Détails sur le contenu médical"}
                {step === 4 && "Ajoutez les documents associés"}
                {step === 5 && "Vérifiez et complétez les informations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: General Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="record-type">
                      Type de document{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={recordType}
                      onValueChange={(value) =>
                        setRecordType(value as RecordType)
                      }
                    >
                      <SelectTrigger id="record-type">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">
                          Consultation
                        </SelectItem>
                        <SelectItem value="laboratory">
                          Analyse de laboratoire
                        </SelectItem>
                        <SelectItem value="imaging">
                          Imagerie médicale
                        </SelectItem>
                        <SelectItem value="prescription">Ordonnance</SelectItem>
                        <SelectItem value="vaccination">Vaccination</SelectItem>
                        <SelectItem value="surgery">Chirurgie</SelectItem>
                        <SelectItem value="allergy">Allergie</SelectItem>
                        <SelectItem value="dental">Dentaire</SelectItem>
                        <SelectItem value="ophthalmology">
                          Ophtalmologie
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Titre <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ex: Consultation cardiologie"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">
                      Date <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="date"
                        >
                          {date ? (
                            format(date, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionnez une date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Step 2: Healthcare Professional */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor">
                      Nom du médecin <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="doctor"
                      placeholder="Ex: Dr. Sophie Martin"
                      value={doctor}
                      onChange={(e) => setDoctor(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialty">
                      Spécialité <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="specialty"
                      placeholder="Ex: Cardiologie"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facility">
                      Établissement <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="facility"
                      placeholder="Ex: Hôpital Saint-Louis"
                      value={facility}
                      onChange={(e) => setFacility(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Medical Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="summary">
                      Résumé <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="summary"
                      placeholder="Décrivez le contenu du document médical"
                      className="min-h-[100px]"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recommendations">Recommandations</Label>
                    <Textarea
                      id="recommendations"
                      placeholder="Recommandations médicales (optionnel)"
                      className="min-h-[100px]"
                      value={recommendations}
                      onChange={(e) => setRecommendations(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 rounded-full hover:bg-secondary"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        placeholder="Ajouter un tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={addTag} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">
                        Déposez vos fichiers ici
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Glissez-déposez vos fichiers ou cliquez pour parcourir
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <Button asChild>
                          <label>
                            <input
                              type="file"
                              className="sr-only"
                              multiple
                              onChange={handleFileUpload}
                            />
                            Parcourir
                          </label>
                        </Button>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Formats acceptés: PDF, JPG, PNG</p>
                              <p>Taille maximale: 10 MB par fichier</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">
                        Fichiers téléchargés ({uploadedFiles.length})
                      </h4>
                      <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              {file.type.startsWith("image/") ? (
                                <div className="h-10 w-10 overflow-hidden rounded-md">
                                  <img
                                    src={
                                      file.preview ||
                                      "/placeholder.svg?height=40&width=40"
                                    }
                                    alt={file.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Finalization */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      {recordType && (
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${getRecordTypeColor(
                            recordType as RecordType
                          )}`}
                        >
                          {getRecordTypeIcon(recordType as RecordType)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-medium">{title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {date && format(date, "d MMMM yyyy", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Informations générales
                        </h4>
                        <div className="rounded-lg border p-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Type
                            </span>
                            <span className="text-sm font-medium capitalize">
                              {recordType}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Date
                            </span>
                            <span className="text-sm">
                              {date &&
                                format(date, "d MMMM yyyy", { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Professionnel de santé
                        </h4>
                        <div className="rounded-lg border p-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Médecin
                            </span>
                            <span className="text-sm">{doctor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Spécialité
                            </span>
                            <span className="text-sm">{specialty}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Établissement
                            </span>
                            <span className="text-sm">{facility}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {tags.length > 0 ? (
                            tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Aucun tag
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Résumé</h4>
                        <div className="rounded-lg border p-3">
                          <p className="text-sm">{summary}</p>
                        </div>
                      </div>

                      {recommendations && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Recommandations
                          </h4>
                          <div className="rounded-lg border p-3">
                            <p className="text-sm">{recommendations}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Documents ({uploadedFiles.length})
                        </h4>
                        <div className="rounded-lg border p-3 max-h-[200px] overflow-y-auto">
                          {uploadedFiles.length > 0 ? (
                            <div className="space-y-2">
                              {uploadedFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center gap-2"
                                >
                                  <FileText className="h-4 w-4 text-primary" />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {formatFileSize(file.size)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Aucun document
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button
                variant="outline"
                onClick={() => (step > 1 ? setStep(step - 1) : goBack())}
              >
                {step > 1 ? "Précédent" : "Annuler"}
              </Button>
              <Button
                onClick={() => {
                  if (step < 5) {
                    setStep(step + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={!isStepValid() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">◌</span>
                    Enregistrement...
                  </>
                ) : step < 5 ? (
                  "Suivant"
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <AlertDialog
        open={isSubmitDialogOpen}
        onOpenChange={setIsSubmitDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Document ajouté avec succès</AlertDialogTitle>
            <AlertDialogDescription>
              Votre document médical a été ajouté à votre dossier avec succès.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={goBack}>
              Retour aux documents
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsSubmitDialogOpen(false);
                // Reset form
                setRecordType("");
                setTitle("");
                setDate(new Date());
                setDoctor("");
                setSpecialty("");
                setFacility("");
                setSummary("");
                setRecommendations("");
                setUploadedFiles([]);
                setTags([]);
                setStep(1);
              }}
            >
              Ajouter un autre document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
