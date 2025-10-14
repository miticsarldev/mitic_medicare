// app/auth/activation-required/page.tsx
"use client";

import type React from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Building,
  CheckCircle2,
  LifeBuoy,
  LogOut,
  Mail,
  Shield,
  Stethoscope,
  User,
  Menu,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";

const SUPPORT_EMAIL = "contact@miticsarlml.com";

export default function ActivationRequiredPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("info");

  const role = session?.user?.role as
    | "SUPER_ADMIN"
    | "HOSPITAL_ADMIN"
    | "PATIENT"
    | "INDEPENDENT_DOCTOR"
    | "HOSPITAL_DOCTOR"
    | undefined;

  const email = session?.user?.email as string | undefined;

  // Role-based content (badge + hero)
  const userTypeContent: Record<
    NonNullable<typeof role>,
    { title: string; subtitle: string; icon: React.ReactNode; color: string }
  > = {
    SUPER_ADMIN: {
      title: "Espace Super Admin",
      subtitle: "Gestion globale de la plateforme",
      icon: <Shield className="h-5 w-5" />,
      color: "bg-emerald-600",
    },
    HOSPITAL_ADMIN: {
      title: "Espace Admin Hôpital",
      subtitle: "Administration de l’établissement",
      icon: <Building className="h-5 w-5" />,
      color: "bg-indigo-600",
    },
    PATIENT: {
      title: "Espace Patient",
      subtitle: "Accès à vos rendez-vous & dossiers",
      icon: <User className="h-5 w-5" />,
      color: "bg-emerald-600",
    },
    INDEPENDENT_DOCTOR: {
      title: "Espace Médecin Indépendant",
      subtitle: "Gestion de votre pratique",
      icon: <Stethoscope className="h-5 w-5" />,
      color: "bg-blue-600",
    },
    HOSPITAL_DOCTOR: {
      title: "Espace Médecin d’Hôpital",
      subtitle: "Prise en charge des patients",
      icon: <Stethoscope className="h-5 w-5" />,
      color: "bg-cyan-600",
    },
  };

  const content = userTypeContent[role ?? "PATIENT"] ?? userTypeContent.PATIENT;

  const primaryMessage = useMemo(() => {
    switch (role) {
      case "HOSPITAL_DOCTOR":
        return {
          title: "Activation requise par l’administrateur de votre hôpital",
          detail:
            "Votre compte est créé mais inactif. Merci de contacter l’administrateur de votre hôpital afin qu’il active votre accès.",
          ctaLabel: "Contacter mon admin",
          ctaHref: "#", // If you later store hospital admin email in token, replace with mailto:
        };
      case "PATIENT":
        return {
          title: "Votre compte patient nécessite une activation",
          detail: `Merci de contacter notre support à ${SUPPORT_EMAIL} pour finaliser l’activation.`,
          ctaLabel: "Écrire au support",
          ctaHref: `mailto:${SUPPORT_EMAIL}?subject=Activation%20compte%20patient`,
        };
      case "INDEPENDENT_DOCTOR":
      case "HOSPITAL_ADMIN":
        return {
          title: "Activation administrative requise",
          detail: `Votre compte est en attente d’activation. Merci de nous écrire à ${SUPPORT_EMAIL} pour finaliser la mise en service.`,
          ctaLabel: "Contacter le support",
          ctaHref: `mailto:${SUPPORT_EMAIL}?subject=Activation%20compte%20pro`,
        };
      case "SUPER_ADMIN":
        return {
          title: "Compte inactif",
          detail:
            "Votre compte est marqué inactif. Merci de vérifier les réglages d’administration ou de contacter le support.",
          ctaLabel: "Contacter le support",
          ctaHref: `mailto:${SUPPORT_EMAIL}?subject=Activation%20Super%20Admin`,
        };
      default:
        return {
          title: "Activation requise",
          detail: `Merci de contacter ${SUPPORT_EMAIL} pour activer votre compte.`,
          ctaLabel: "Contacter le support",
          ctaHref: `mailto:${SUPPORT_EMAIL}?subject=Activation%20compte`,
        };
    }
  }, [role]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      <div className="max-w-screen-xl mx-auto w-full">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between mx-auto px-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center space-x-0.5">
                <div className="h-6 w-auto rounded-full flex items-center justify-center">
                  <Image
                    src="/logos/logo_mitic_dark.png"
                    alt="Logo"
                    className="h-10 w-auto object-cover"
                    width={40}
                    height={40}
                    priority
                    unoptimized
                  />
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="hidden sm:flex">
                <a href={`mailto:${SUPPORT_EMAIL}`}>
                  <LifeBuoy className="h-4 w-4 mr-2" /> Support
                </a>
              </Button>
              <ModeToggle />
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
                      asChild
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <a href={`mailto:${SUPPORT_EMAIL}`}>
                        <LifeBuoy className="h-4 w-4 mr-2" />
                        Support
                      </a>
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-4 py-2 md:py-4 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left info */}
            <section className="order-2 lg:order-1">
              <div className="text-center lg:text-left mb-6">
                <Badge className={`${content.color} text-white mb-4 px-3 py-1`}>
                  <div className="flex items-center gap-1.5">
                    {content.icon}
                    <span>{content.title}</span>
                  </div>
                </Badge>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Accès non actif — Activation requise
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto lg:mx-0">
                  Votre compte a été créé mais doit être activé avant d’accéder
                  à votre espace.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <InfoCard
                  icon={<AlertTriangle className="h-5 w-5" />}
                  title="Compte inactif"
                  description="Des limitations s’appliquent tant que l’activation n’est pas effectuée."
                />
                <InfoCard
                  icon={<Mail className="h-5 w-5" />}
                  title="Contactez le support"
                  description={`Écrivez à ${SUPPORT_EMAIL} si vous n’avez pas d’administrateur.`}
                />
                <InfoCard
                  icon={<Shield className="h-5 w-5" />}
                  title="Conformité"
                  description="L’activation garantit la conformité et la sécurité des accès."
                />
                <InfoCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  title="Déblocage complet"
                  description="Accédez à toutes les fonctionnalités une fois activé."
                />
              </div>

              <div className="relative">
                <div className="hidden sm:block absolute -top-10 -left-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-20" />
                <div className="hidden sm:block absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20" />

                <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={"/verification.webp"}
                    alt="Activation requise"
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                    <div className="text-white">
                      <h3 className="text-xl font-bold mb-2">
                        {primaryMessage.title}
                      </h3>
                      <p className="text-white/80">{primaryMessage.detail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Right card */}
            <section className="order-1 lg:order-2">
              <Card className="border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                <CardHeader className={`${content.color} text-white p-6`}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-center">
                    Activation du compte requise
                  </CardTitle>
                  <CardDescription className="text-white/80 text-center text-base">
                    Votre compte est actuellement inactif
                  </CardDescription>
                </CardHeader>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="px-6 pt-6">
                    <TabsList className="grid grid-cols-2 mb-6">
                      <TabsTrigger
                        value="info"
                        className="flex items-center gap-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span>Informations</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="contact"
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Contact</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <CardContent className="p-6 pt-2">
                    <TabsContent value="info" className="mt-0 space-y-4">
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-amber-800 dark:text-amber-300">
                              Activation en attente
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                              {email ? (
                                <>
                                  Le compte associé à{" "}
                                  <span className="font-medium">{email}</span>{" "}
                                  est inactif.
                                </>
                              ) : (
                                <>Votre compte est inactif.</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">
                          Étapes suggérées :
                        </h3>
                        <Step
                          number={1}
                          title="Identifiez votre profil"
                          description="Êtes-vous médecin d’hôpital, administrateur, médecin indépendant ou patient ?"
                        />
                        <Step
                          number={2}
                          title="Contactez l’entité appropriée"
                          description={
                            role === "HOSPITAL_DOCTOR"
                              ? "Contactez l’administrateur de votre hôpital pour l’activation."
                              : `Écrivez à ${SUPPORT_EMAIL} pour finaliser votre activation.`
                          }
                        />
                        <Step
                          number={3}
                          title="Réessayez la connexion"
                          description="Une fois l’activation effectuée, reconnectez-vous pour accéder à votre espace."
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="contact" className="mt-0 space-y-6">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Mail className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">
                            Besoin d’aide ?
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Nous vous accompagnons pour activer votre compte.
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg py-3 px-4 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Email enregistré :
                          </p>
                          <p className="font-medium">{email ?? "—"}</p>
                        </div>

                        <Button
                          asChild
                          className={`w-full ${content.color} hover:opacity-90`}
                        >
                          <a href={primaryMessage.ctaHref}>
                            <Mail className="mr-2 h-4 w-4" />
                            {primaryMessage.ctaLabel}
                          </a>
                        </Button>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
                        <p>
                          <span className="font-medium">Astuce :</span> indiquez
                          votre rôle, votre établissement (le cas échéant) et
                          l’email du compte pour accélérer l’activation.
                        </p>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>

                <CardFooter className="flex flex-col space-y-3 p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/auth")}
                  >
                    Retour à la page de connexion
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => signOut({ callbackUrl: "/auth" })}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Toujours bloqué ?{" "}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="underline font-medium"
                    >
                      Contactez le support
                    </a>
                  </div>
                </CardFooter>
              </Card>

              <div className="mt-8 flex justify-center">
                <ActivationAnimation />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
        {number}
      </div>
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function ActivationAnimation() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        repeatDelay: 2,
      }}
      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
      <span className="text-sm font-medium">Activation requise</span>
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: [0, 5, 0] }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 1,
        }}
      >
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </motion.div>
    </motion.div>
  );
}
