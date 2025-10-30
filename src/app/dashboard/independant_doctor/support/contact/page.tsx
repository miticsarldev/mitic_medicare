"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Clock, Loader2, Mail, MessageSquare, Phone, Send } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  subject: z.string().min(5, {
    message: "Le sujet doit contenir au moins 5 caractères.",
  }),
  category: z.string({
    required_error: "Veuillez sélectionner une catégorie.",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Veuillez sélectionner une priorité.",
  }),
  message: z.string().min(20, {
    message: "Le message doit contenir au moins 20 caractères.",
  }),
  attachments: z.any().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [hospitalContact, setHospitalContact] = useState<{
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
  } | null>(null);

  useEffect(() => {
    const fetchHospitalContact = async () => {
      try {
        const res = await fetch("/api/hospital_doctor/hospital");
        const data = await res.json();
        if (res.ok) {
          setHospitalContact({
            phone: data.phone,
            email: data.email,
            address: data.address,
            website: data.website,
          });
        } else {
          console.error("Erreur API:", data.message);
        }
      } catch (err) {
        console.error("Erreur réseau:", err);
      }
    };

    fetchHospitalContact();
  }, []);

  // Default values for the form
  const defaultValues: Partial<ContactFormValues> = {
    subject: "",
    category: "",
    priority: "medium",
    message: "",
  };

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Replace the onSubmit function with this implementation
  async function onSubmit(data: ContactFormValues) {
    setIsLoading(true);

    try {
      console.log("sending email");
      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("category", data.category);
      formData.append("priority", data.priority);
      formData.append("message", data.message);

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch("/api/hospital_doctor/support-email", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      console.log(result);

      if (result.success) {
        toast({
          title: "Message envoyé",
          description: `Votre message a été envoyé avec succès (Ticket #${result.ticketId}). Nous vous répondrons dans les plus brefs délais.`,
        });

        form.reset();
        setAttachments([]);
      } else {
        throw new Error("Erreur lors de l'envoi.");
      }
    } catch (error) {
      console.error("Error", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAttachmentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setAttachments((prev) => [...prev, ...fileArray]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Support hours
  const supportHours = [
    { day: "Lundi - Vendredi", hours: "8h00 - 20h00" },
    { day: "Samedi", hours: "9h00 - 18h00" },
    { day: "Dimanche", hours: "Fermé" },
  ];

  // FAQ categories
  const categories = [
    { id: "technical", name: "Problème technique" },
    { id: "account", name: "Compte & Profil" },
    { id: "appointments", name: "Rendez-vous" },
    { id: "medical", name: "Dossier médical" },
    { id: "subscription", name: "Abonnement & Paiement" },
    { id: "other", name: "Autre" },
  ];

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Support Client</h1>
          <p className="text-muted-foreground">
            Contactez notre équipe pour obtenir de l&apos;aide
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Envoyez-nous un message</CardTitle>
              <CardDescription>
                Remplissez le formulaire ci-dessous pour nous contacter. Notre
                équipe vous répondra dans les plus brefs délais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sujet</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Décrivez brièvement votre problème"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une catégorie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Priorité</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="low" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Basse
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="medium" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Moyenne
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="high" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Haute
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez votre problème en détail..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Soyez aussi précis que possible pour nous aider à
                          résoudre votre problème rapidement.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="attachments"
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pièces jointes (optionnel)</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                multiple
                                className="cursor-pointer"
                                onChange={handleAttachmentChange}
                                value={undefined}
                              />
                            </div>

                            {attachments.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">
                                  Fichiers sélectionnés:
                                </p>
                                <ul className="space-y-1">
                                  {attachments.map((file, index) => (
                                    <li
                                      key={index}
                                      className="flex items-center justify-between text-sm p-2 bg-muted rounded-md"
                                    >
                                      <span className="truncate max-w-[300px]">
                                        {file.name}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeAttachment(index)}
                                        className="h-6 w-6 p-0 text-destructive"
                                      >
                                        &times;
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Vous pouvez joindre des captures d&apos;écran ou
                          d&apos;autres fichiers pour nous aider à comprendre
                          votre problème.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 space-y-6">
          {hospitalContact && (
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Informations de l’hôpital</CardTitle>
                <CardDescription>
                  Voici comment nous contacter :
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hospitalContact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <span>{hospitalContact.phone}</span>
                  </div>
                )}
                {hospitalContact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span>{hospitalContact.email}</span>
                  </div>
                )}
                {hospitalContact.address && (
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-muted-foreground mt-1" />
                    <span>{hospitalContact.address}</span>
                  </div>
                )}
                {hospitalContact.website && (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-muted-foreground" />
                    <Link
                      href={hospitalContact.website}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {hospitalContact.website}
                    </Link>
                  </div>
                )}
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2 font-medium">
                    Heures de support :
                  </p>
                  <ul className="text-sm space-y-1">
                    {supportHours.map((item, index) => (
                      <li key={index}>
                        <Clock className="inline w-4 h-4 mr-2 text-muted-foreground" />
                        {item.day} : {item.hours}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Ressources utiles</CardTitle>
              <CardDescription>
                Consultez nos ressources d&apos;aide
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href="/dashboard/patient/support/faq"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">FAQ</p>
                  <p className="text-sm text-muted-foreground">
                    Réponses aux questions fréquentes
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
