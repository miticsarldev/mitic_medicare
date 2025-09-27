"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileCheck,
  Info,
  Loader2,
  Mail,
  MessageSquare,
  PhoneCall,
  Shield,
  User,
  Building,
  Stethoscope,
  ClipboardCheck,
  FileText,
  CheckSquare,
  Menu,
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
import { ClientAnimationWrapper } from "@/components/client-animation-wrapper";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "next-auth/react";

export default function AccountUnderReview() {
  const router = useRouter();
  const { toast } = useToast();
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  //   const [hasSignOut, setHasSignOut] = useState<boolean>(false);

  useEffect(() => {
    const storedData = localStorage.getItem("mitic-pending-approval");

    if (!storedData) {
      router.replace("/auth");
      return;
    }

    const { email, name, role } = JSON.parse(storedData);
    setEmail(email);
    setRole(role);
    setName(name);

    signOut({ redirect: false });

    toast({
      title: "Compte en attente de vérification",
      description:
        "Notre équipe doit approuver votre compte avant que vous puissiez vous connecter.",
      variant: "destructive",
    });
  }, [router, toast]);

  // User type specific content
  const userTypeContent = {
    independent_doctor: {
      title: "Médecin Indépendant",
      description: "Votre compte est en cours de vérification",
      icon: <Stethoscope className="h-5 w-5" />,
      color: "bg-blue-600",
      textColor: "text-blue-600",
      image: "/verification_.webp",
      estimatedTime: "24 à 48 heures",
      verificationSteps: [
        {
          title: "Vérification des diplômes",
          description: "Nous vérifions l'authenticité de vos diplômes médicaux",
          icon: <FileCheck className="h-5 w-5 text-blue-600" />,
          status: "in-progress",
        },
        {
          title: "Vérification de licence",
          description:
            "Nous confirmons votre numéro de licence auprès des autorités compétentes",
          icon: <ClipboardCheck className="h-5 w-5 text-blue-600" />,
          status: "in-progress",
        },
        {
          title: "Vérification d'identité",
          description:
            "Nous vérifions que vous êtes bien la personne que vous prétendez être",
          icon: <User className="h-5 w-5 text-blue-600" />,
          status: "completed",
        },
      ],
    },
    hospital_admin: {
      title: "Administrateur d'Hôpital",
      description: "Votre établissement est en cours de vérification",
      icon: <Building className="h-5 w-5" />,
      color: "bg-indigo-600",
      textColor: "text-indigo-600",
      image: "/verification_.webp",
      estimatedTime: "2 à 5 jours ouvrés",
      verificationSteps: [
        {
          title: "Vérification de l'établissement",
          description:
            "Nous vérifions l'existence et les accréditations de votre établissement",
          icon: <Building className="h-5 w-5 text-indigo-600" />,
          status: "in-progress",
        },
        {
          title: "Vérification des autorisations",
          description:
            "Nous confirmons que vous êtes autorisé à administrer cet établissement",
          icon: <FileText className="h-5 w-5 text-indigo-600" />,
          status: "in-progress",
        },
        {
          title: "Vérification d'identité",
          description:
            "Nous vérifions que vous êtes bien la personne que vous prétendez être",
          icon: <User className="h-5 w-5 text-indigo-600" />,
          status: "completed",
        },
      ],
    },
  };

  // Get content based on user type
  const content =
    userTypeContent[role as keyof typeof userTypeContent] ||
    userTypeContent.independent_doctor;

  const handleContactSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);

    try {
      // Call your API to send support message
      const response = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          message,
          subject: `Question sur la vérification de compte - ${role}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Message envoyé",
          description:
            "Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.",
          variant: "default",
        });
        setMessage("");
        setContactFormOpen(false);
      } else {
        toast({
          title: "Erreur",
          description:
            data.error || "Une erreur s'est produite. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      <div className="max-w-screen-xl mx-auto">
        {/* Header with logo */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between mx-auto px-4">
            {/* Logo and brand */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center space-x-0.5">
                <div className="h-6 w-auto rounded-full flex items-center justify-center">
                  <Image
                    src="/logos/logo_mitic_dark.png"
                    alt="Logo"
                    className="h-6 w-auto object-cover"
                    width={40}
                    height={40}
                    priority
                    unoptimized
                  />
                </div>
                <span className="font-semibold text-4xl hidden sm:inline-block">
                  <span className="text-foreground">care</span>
                </span>
              </Link>
            </div>

            {/* Actions section */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-[#107ACA] text-[#107ACA] hidden sm:flex"
                size="sm"
              >
                Centre d&apos;aide
              </Button>

              <Link href="/auth">
                <Button className="bg-[#107ACA] hover:bg-[#0A5A8A]" size="sm">
                  Se connecter
                </Button>
              </Link>

              {/* Theme toggle */}
              <ModeToggle />

              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <SheetHeader className="pb-6">
                    <SheetTitle>
                      <Link href="/" className="flex items-center space-x-2">
                        <div className="h-6 w-auto rounded-full flex items-center justify-center">
                          <Image
                            src="/logos/logo_mitic_dark.png"
                            alt="Logo"
                            className="h-6 w-auto object-cover"
                            width={40}
                            height={40}
                            priority
                          />
                        </div>
                        <span className="font-semibold text-4xl">
                          <span className="text-foreground">Care</span>
                        </span>
                      </Link>
                    </SheetTitle>
                    <SheetDescription />
                  </SheetHeader>
                  <nav className="flex flex-col space-y-4">
                    <div className="h-px bg-border my-2" />
                    <Button
                      variant="outline"
                      className="border-[#107ACA] text-[#107ACA] w-full justify-start"
                      size="sm"
                    >
                      Centre d&apos;aide
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Illustration and Info */}
            <ClientAnimationWrapper
              className="order-2 lg:order-1"
              initialAnimation={{ opacity: 0, y: 20 }}
              animateAnimation={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center lg:text-left mb-6">
                <Badge
                  className={`mb-4 px-3 py-1 ${content.color}/10 ${content.textColor} border-${content.color.replace("bg-", "")}/20 dark:${content.color}/20`}
                >
                  <div className="flex items-center gap-1.5">
                    {content.icon}
                    <span>Espace {content.title}</span>
                  </div>
                </Badge>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Votre compte est en cours de vérification
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto lg:mx-0">
                  Merci pour votre inscription ! Nous vérifions actuellement vos
                  informations professionnelles pour garantir la sécurité de
                  notre plateforme.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className={`h-5 w-5 ${content.textColor}`} />
                  <span>Processus de vérification</span>
                </h2>

                <div className="space-y-6">
                  {content.verificationSteps.map((step, index) => (
                    <div key={index} className="relative">
                      {index < content.verificationSteps.length - 1 && (
                        <div
                          className={`absolute left-4 top-10 bottom-0 w-0.5 ${
                            step.status === "completed"
                              ? "bg-green-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        />
                      )}

                      <div className="flex gap-4">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            step.status === "completed"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : step.status === "in-progress"
                                ? `${content.color}/10 dark:${content.color}/20`
                                : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          {step.status === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                          ) : step.status === "in-progress" ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 2,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                              }}
                            >
                              <Loader2
                                className={`h-5 w-5 ${content.textColor}`}
                              />
                            </motion.div>
                          ) : (
                            step.icon
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {step.title}
                            </h3>
                            {step.status === "completed" && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              >
                                Complété
                              </Badge>
                            )}
                            {step.status === "in-progress" && (
                              <Badge
                                variant="outline"
                                className={`${content.color}/10 ${content.textColor} border-${content.color.replace("bg-", "")}/20 dark:${content.color}/20 dark:border-${content.color.replace("bg-", "")}/30`}
                              >
                                En cours
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="hidden sm:block absolute -top-10 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20" />
                <div className="hidden sm:block absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20" />

                <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={content.image || "/placeholder.svg"}
                    alt="Vérification de compte"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                    <div className="text-white">
                      <h3 className="text-xl font-bold mb-2">
                        Pourquoi cette vérification ?
                      </h3>
                      <p className="text-white/80 mb-4">
                        Cette étape est essentielle pour :
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <Shield className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium">
                            Protéger les patients
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <CheckSquare className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium">
                            Garantir le professionnalisme
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <FileCheck className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium">
                            Respecter la réglementation
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ClientAnimationWrapper>

            {/* Right Column - Status Card */}
            <ClientAnimationWrapper
              className="order-1 lg:order-2"
              initialAnimation={{ opacity: 0, y: -20 }}
              animateAnimation={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                <CardHeader className={`${content.color} text-white p-6`}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <ClipboardCheck className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-center">
                    Vérification en cours
                  </CardTitle>
                  <CardDescription className="text-white/80 text-center text-base">
                    Votre compte est en attente d&apos;activation
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-800 dark:text-amber-300">
                          Compte en attente d&apos;activation
                        </h3>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                          Votre email a été vérifié, mais nous devons encore
                          valider vos informations professionnelles avant de
                          vous donner accès complet.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Statut de votre compte</h3>
                      <Badge
                        variant="outline"
                        className={`${content.color}/10 ${content.textColor} border-${content.color.replace("bg-", "")}/20`}
                      >
                        En attente
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Progression
                        </span>
                        <span className="font-medium">33%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`${content.color} h-2 rounded-full w-1/3`}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>Temps estimé : {content.estimatedTime}</span>
                    </div>

                    {name && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Compte pour
                            </p>
                            <p className="font-medium">{name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-3">Questions fréquentes</h3>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="text-sm">
                          Combien de temps dure la vérification ?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-500 dark:text-gray-400">
                          Pour les{" "}
                          {content.title === "Médecin Indépendant"
                            ? "médecins"
                            : "administrateurs d'hôpitaux"}
                          , le processus prend généralement{" "}
                          {content.estimatedTime}. Cela peut varier en fonction
                          de la complexité de la vérification et du volume de
                          demandes.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger className="text-sm">
                          Puis-je accélérer le processus ?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-500 dark:text-gray-400">
                          Non, tous les comptes passent par le même processus de
                          vérification rigoureux pour garantir la sécurité et la
                          conformité. Nous traitons les demandes dans
                          l&apos;ordre de réception.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger className="text-sm">
                          Comment saurai-je que mon compte est activé ?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-500 dark:text-gray-400">
                          Vous recevrez un email de confirmation dès que votre
                          compte sera activé. Vous pourrez alors vous connecter
                          et accéder à toutes les fonctionnalités de votre
                          espace {content.title}.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
                  {!contactFormOpen ? (
                    <Button
                      className={`w-full ${content.color} hover:${content.color}/90 text-white`}
                      onClick={() => setContactFormOpen(true)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contacter le support
                    </Button>
                  ) : (
                    <form
                      onSubmit={handleContactSupport}
                      className="w-full space-y-4"
                    >
                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium mb-1"
                        >
                          Votre message
                        </label>
                        <textarea
                          id="message"
                          rows={3}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Comment pouvons-nous vous aider ?"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setContactFormOpen(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          className={`flex-1 ${content.color} hover:${content.color}/90 text-white`}
                          disabled={isSending || !message.trim()}
                        >
                          {isSending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Envoi...
                            </>
                          ) : (
                            <>
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Envoyer
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4" />
                      <a
                        href="mailto:support@miticcare.com"
                        className="hover:underline"
                      >
                        support@miticcare.com
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PhoneCall className="h-4 w-4" />
                      <a href="tel:+33123456789" className="hover:underline">
                        +33 1 23 45 67 89
                      </a>
                    </div>
                  </div>
                </CardFooter>
              </Card>

              {/* Animated Verification Process */}
              <div className="mt-8 flex justify-center">
                <VerificationAnimation
                  color={content.color.replace("bg-", "")}
                />
              </div>
            </ClientAnimationWrapper>
          </div>
        </main>
      </div>
    </div>
  );
}

function VerificationAnimation({ color }: { color: string }) {
  const circleVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };

  const iconVariants = {
    animate: {
      rotate: [0, 10, 0, -10, 0],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="relative">
      <motion.div
        variants={circleVariants}
        animate="animate"
        className={`absolute inset-0 rounded-full bg-${color}/20`}
      />
      <motion.div
        variants={iconVariants}
        animate="animate"
        className={`relative z-10 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-${color}/20 dark:border-${color}/30`}
      >
        <div
          className={`w-8 h-8 rounded-full bg-${color}/10 flex items-center justify-center`}
        >
          <ClipboardCheck className={`h-4 w-4 text-${color}`} />
        </div>
        <span className="text-sm font-medium">Vérification en cours</span>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Loader2 className={`h-4 w-4 text-${color} animate-spin`} />
        </motion.div>
      </motion.div>
    </div>
  );
}
