import type React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  FileCheck,
  Building,
  Lock,
  Shield,
  Users,
  BarChartIcon as ChartBar,
  ClipboardList,
  Network,
} from "lucide-react";

import Navbar from "@/components/navbar";
import { ClientAnimationWrapper } from "@/components/client-animation-wrapper";
import { Badge } from "@/components/ui/badge";
import HospitalAdminRegisterForm from "@/components/hospital-admin-register";
import { Footer } from "@/components/footer";

export default function HospitalAdminRegister() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <Navbar />

        {/* Main Content */}
        <main className="mx-auto px-4 py-2 md:py-4 lg:py-8">
          <div className="flex flex-col-reverse items-center lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12">
            {/* Left Column - Image and Text */}
            <ClientAnimationWrapper
              className="w-full lg:w-1/2 max-w-xl"
              initialAnimation={{ opacity: 0, x: -20 }}
              animateAnimation={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center lg:text-left mb-8">
                <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 dark:bg-primary/20">
                  Espace Administrateur d&apos;Hôpital
                </Badge>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                  Optimisez la gestion de votre établissement
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto lg:mx-0">
                  Rejoignez notre réseau d&apos;établissements de santé et
                  bénéficiez d&apos;outils innovants pour améliorer
                  l&apos;efficacité de votre institution et la qualité des
                  soins.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <BenefitCard
                  icon={<Building className="h-5 w-5 text-primary" />}
                  title="Gestion centralisée"
                  description="Administrez l'ensemble de votre établissement depuis une interface unique et intuitive"
                />
                <BenefitCard
                  icon={<ChartBar className="h-5 w-5 text-primary" />}
                  title="Analyse de performance"
                  description="Suivez les indicateurs clés et optimisez les ressources de votre établissement"
                />
                <BenefitCard
                  icon={<ClipboardList className="h-5 w-5 text-primary" />}
                  title="Gestion des dossiers"
                  description="Centralisez et sécurisez l'ensemble des dossiers médicaux et administratifs"
                />
                <BenefitCard
                  icon={<Network className="h-5 w-5 text-primary" />}
                  title="Réseau médical étendu"
                  description="Connectez-vous avec d'autres établissements et spécialistes pour des références simplifiées"
                />
              </div>

              <div className="relative">
                <div className="hidden sm:block absolute -top-10 -left-10 w-40 h-40 bg-primary rounded-full blur-3xl opacity-20" />
                <div className="hidden sm:block absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20" />

                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/administration_hopitalier.webp"
                    alt="Administration hospitalière moderne"
                    width={800}
                    height={600}
                    priority
                    className="w-full h-auto object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                    <div className="text-white">
                      <h3 className="text-xl font-bold mb-2">
                        Rejoignez notre réseau d&apos;établissements
                      </h3>
                      <p className="text-white/80 mb-4">
                        Plus de 500 hôpitaux et cliniques nous font déjà
                        confiance
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
                            Hébergeur agréé HDS
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ClientAnimationWrapper>

            {/* Right Column - Registration Form */}
            <ClientAnimationWrapper
              className="w-full lg:w-1/2 flex flex-col items-center lg:items-end lg:sticky lg:top-24 self-start"
              initialAnimation={{ opacity: 0, x: 20 }}
              animateAnimation={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-900 lg:w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="px-4 py-4 md:p-6">
                  <div className="flex items-center justify-center mb-2">
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

                  <div className="text-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Inscription Administrateur d&apos;Hôpital
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      Créez votre compte professionnel en quelques étapes
                    </p>
                  </div>

                  <HospitalAdminRegisterForm />
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Lock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Inscription sécurisée et vérifiée
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="h-4 w-4 text-primary" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Vérification des accréditations
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Données protégées
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Support dédié
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vous avez déjà un compte ?{" "}
                  <Link
                    href="/auth"
                    className="text-primary hover:underline font-medium"
                  >
                    Connectez-vous
                  </Link>
                </p>
              </div>
            </ClientAnimationWrapper>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

function BenefitCard({
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
        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
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
