"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Mail,
  MailCheck,
  RefreshCw,
  Shield,
  User,
  Building,
  Stethoscope,
  Loader2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { signOut } from "next-auth/react";

export default function EmailVerificationRequired() {
  const router = useRouter();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [activeTab, setActiveTab] = useState("info");
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem("mitic-pending-verification");
    if (storedData) {
      const { email, role } = JSON.parse(storedData);
      setEmail(email);
      setRole(role);

      signOut({ redirect: false });

      toast({
        title: "Adresse email non vérifiée",
        description:
          "Veuillez vérifier votre adresse email en cliquant sur le lien que nous vous avons envoyé.",
        variant: "destructive",
      });
    }
  }, [router, toast]);

  // User type specific content
  const userTypeContent: Record<
    string,
    {
      title: string;
      description: string;
      icon: React.ReactNode;
      color: string;
      image: string;
    }
  > = {
    patient: {
      title: "Espace Patient",
      description: "Accédez à vos rendez-vous et dossiers médicaux",
      icon: <User className="h-5 w-5" />,
      color: "bg-emerald-500",
      image: "/verification.webp",
    },
    independent_doctor: {
      title: "Espace Médecin Indépendant",
      description: "Gérez votre pratique et vos patients",
      icon: <Stethoscope className="h-5 w-5" />,
      color: "bg-blue-600",
      image: "/verification.webp",
    },
    hospital_admin: {
      title: "Espace Administrateur d'Hôpital",
      description: "Administrez votre établissement de santé",
      icon: <Building className="h-5 w-5" />,
      color: "bg-indigo-600",
      image: "/verification.webp",
    },
  };

  // Get content based on user type
  const content =
    userTypeContent[role as keyof typeof userTypeContent] ||
    userTypeContent.patient;

  useEffect(() => {
    // If countdown is active, decrement it every second
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setIsResending(true);

    try {
      // Call your API to resend verification email
      const response = await fetch("/api/auth/resend-new-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email envoyé avec succès",
          description:
            "Veuillez vérifier votre boîte de réception et vos spams.",
          variant: "default",
        });
        // Set a 60 second countdown before allowing another resend
        setCountdown(60);
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
      setIsResending(false);
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
                    className="h-10 w-auto object-cover"
                    width={40}
                    height={40}
                    priority
                    unoptimized
                  />
                </div>
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

        <main className="flex-1 flex items-center justify-center px-4 py-2 md:py-4 lg:py-8">
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
                  className={`mb-4 px-3 py-1 ${content.color}/10 text-${content.color.replace("bg-", "")} border-${content.color.replace("bg-", "")}/20 dark:${content.color}/20`}
                >
                  <div className="flex items-center gap-1.5">
                    {content.icon}
                    <span>{content.title}</span>
                  </div>
                </Badge>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Vérification de votre email requise
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto lg:mx-0">
                  Pour accéder à votre compte et garantir la sécurité de vos
                  données, veuillez confirmer votre adresse email.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <InfoCard
                  icon={<MailCheck className="h-5 w-5 text-blue-500" />}
                  title="Vérification simple"
                  description="Cliquez sur le lien dans l'email que nous vous avons envoyé"
                />
                <InfoCard
                  icon={<Clock className="h-5 w-5 text-amber-500" />}
                  title="Rapide et efficace"
                  description="La vérification ne prend que quelques secondes"
                />
                <InfoCard
                  icon={<Shield className="h-5 w-5 text-emerald-500" />}
                  title="Sécurité renforcée"
                  description="Protégez vos informations personnelles et médicales"
                />
                <InfoCard
                  icon={<CheckCircle className="h-5 w-5 text-purple-500" />}
                  title="Accès complet"
                  description="Débloquez toutes les fonctionnalités de votre espace"
                />
              </div>

              <div className="relative">
                <div className="hidden sm:block absolute -top-10 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20" />
                <div className="hidden sm:block absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20" />

                <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={content.image || "/placeholder.svg"}
                    alt="Vérification d'email"
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                    <div className="text-white">
                      <h3 className="text-xl font-bold mb-2">
                        Pourquoi vérifier votre email ?
                      </h3>
                      <p className="text-white/80 mb-4">
                        La vérification de votre email nous permet de :
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium">
                            Confirmer votre identité
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium">
                            Sécuriser vos données
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium">
                            Vous tenir informé
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ClientAnimationWrapper>

            {/* Right Column - Verification Card */}
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
                      <MailCheck className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-center">
                    Vérification d&apos;Email Requise
                  </CardTitle>
                  <CardDescription className="text-white/80 text-center text-base">
                    Votre compte a été créé mais nécessite une vérification
                  </CardDescription>
                </CardHeader>

                <Tabs
                  defaultValue="info"
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
                        <AlertCircle className="h-4 w-4" />
                        <span>Informations</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="resend"
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Renvoyer</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <CardContent className="p-6 pt-2">
                    <TabsContent value="info" className="mt-0 space-y-4">
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-amber-800 dark:text-amber-300">
                              Votre email n&apos;est pas encore vérifié
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                              Nous avons envoyé un email de vérification à{" "}
                              <span className="font-medium">
                                {email || "votre adresse email"}
                              </span>
                              . Veuillez cliquer sur le lien dans cet email pour
                              activer votre compte.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">
                          Étapes à suivre :
                        </h3>

                        <div className="space-y-3">
                          <Step
                            number={1}
                            title="Vérifiez votre boîte de réception"
                            description="Consultez l'email que nous vous avons envoyé lors de votre inscription"
                          />
                          <Step
                            number={2}
                            title="Vérifiez vos spams"
                            description="Si vous ne trouvez pas l'email, vérifiez votre dossier de courriers indésirables"
                          />
                          <Step
                            number={3}
                            title="Cliquez sur le lien"
                            description="Ouvrez l'email et cliquez sur le bouton ou lien de vérification"
                          />
                          <Step
                            number={4}
                            title="Connectez-vous"
                            description="Une fois vérifié, vous pourrez vous connecter à votre compte"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="resend" className="mt-0 space-y-6">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Mail className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                        </div>

                        <div>
                          <h3 className="text-lg font-medium">
                            Vous n&apos;avez pas reçu l&apos;email ?
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Nous pouvons vous renvoyer un nouvel email de
                            vérification
                          </p>
                        </div>

                        {email ? (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg py-3 px-4 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Email enregistré :
                            </p>
                            <p className="font-medium">{email}</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg py-3 px-4 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Nous enverrons l&apos;email à l&apos;adresse
                              associée à votre compte
                            </p>
                          </div>
                        )}

                        <Button
                          className={`w-full ${content.color} hover:${content.color}/90`}
                          onClick={handleResendEmail}
                          disabled={isResending || countdown > 0}
                        >
                          {isResending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Envoi en cours...
                            </>
                          ) : countdown > 0 ? (
                            <>
                              <Clock className="mr-2 h-4 w-4" />
                              Réessayer dans {countdown}s
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Renvoyer l&apos;email de vérification
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
                        <p>
                          <span className="font-medium">Conseil :</span> Si vous
                          ne recevez toujours pas l&apos;email après plusieurs
                          tentatives, vérifiez que l&apos;adresse email saisie
                          est correcte ou contactez notre support.
                        </p>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>

                <CardFooter className="flex flex-col space-y-4 p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/auth")}
                  >
                    Retour à la page de connexion
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Besoin d&apos;aide ?{" "}
                      <Link
                        href="/contact"
                        className={`text-${content.color.replace("bg-", "")} hover:underline font-medium`}
                      >
                        Contactez notre support
                      </Link>
                    </p>
                  </div>
                </CardFooter>
              </Card>

              {/* Animated Email Notification */}
              <div className="mt-8 flex justify-center">
                <EmailAnimation />
              </div>
            </ClientAnimationWrapper>
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

function EmailAnimation() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        repeatDelay: 2,
      }}
      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <MailCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
      </div>
      <span className="text-sm font-medium">
        Vérifiez votre boîte de réception
      </span>
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
