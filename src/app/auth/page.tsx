import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Lock } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import LoginForm from "@/components/login-form";
import RegisterForm from "@/components/register-form";
import { ClientAnimationWrapper } from "@/components/client-animation-wrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";

const AuthTabs = () => {
  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="login">Se connecter</TabsTrigger>
        <TabsTrigger value="register">S&apos;inscrire</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <LoginForm />
      </TabsContent>
      <TabsContent value="register">
        <RegisterForm />
      </TabsContent>
    </Tabs>
  );
};

export default async function AuthPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <Navbar />

        {/* Main Content */}
        <main className="mx-auto px-4 py-2 md:py-4 lg:py-8">
          <div className="flex flex-col-reverse items-center lg:flex-row lg:items-start justify-between gap-8 lg:gap-12">
            {/* Left Column - Image and Text */}
            <ClientAnimationWrapper
              className="w-full lg:w-1/2 max-w-xl"
              initialAnimation={{ opacity: 0, x: -20 }}
              animateAnimation={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center lg:text-left mb-8">
                <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 dark:bg-primary/20">
                  Plateforme de santé sécurisée
                </Badge>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                  Votre santé, notre priorité
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto lg:mx-0">
                  Rejoignez la plateforme qui connecte patients et
                  professionnels de santé pour un parcours de soins simplifié et
                  personnalisé.
                </p>
              </div>

              <div className="relative">
                <div className="hidden sm:block z-20 absolute -top-10 -left-10 w-40 h-40 bg-primary rounded-full blur-3xl" />
                <div className="hidden sm:block z-20 absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl" />

                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/healthcare-professional.webp"
                    alt="Professionnels de santé"
                    width={800}
                    height={600}
                    priority
                    className="w-full h-auto object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                    <div className="text-white">
                      <h3 className="text-xl font-bold mb-2">
                        Plateforme médicale de confiance
                      </h3>
                      <p className="text-white/80 mb-4">
                        Plus de 2 millions de patients et 50 000 professionnels
                        de santé nous font confiance
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium">
                            Données sécurisées
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium">
                            Conforme RGPD
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium">
                            Hébergeur agréé
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ClientAnimationWrapper>

            {/* Right Column - Auth Forms */}
            <ClientAnimationWrapper
              className="w-full lg:w-1/2 max-w-md"
              initialAnimation={{ opacity: 0, x: 20 }}
              animateAnimation={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center gap-0.5">
                      <div className="relative w-auto h-6">
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
                    </div>
                  </div>

                  <AuthTabs />
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Connexion sécurisée et chiffrée
                  </span>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  En vous inscrivant, vous acceptez nos{" "}
                  <Link
                    href="/conditions-utilisation"
                    className="text-primary hover:underline"
                  >
                    Conditions d&apos;utilisation
                  </Link>{" "}
                  et notre{" "}
                  <Link
                    href="/politique-confidentialite"
                    className="text-primary hover:underline"
                  >
                    Politique de confidentialité
                  </Link>
                </p>

                <div className="mt-6 flex justify-center">
                  <Link
                    href="/offres-professionnels"
                    className="text-sm text-primary hover:underline flex items-center"
                  >
                    Découvrir nos offres pour les professionnels de santé
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </ClientAnimationWrapper>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
