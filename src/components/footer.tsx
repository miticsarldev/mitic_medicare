import type React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Shield,
  Twitter,
  Youtube,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("bg-gray-50 dark:bg-gray-900 border-t", className)}>
      {/* Main Footer Content */}
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: About & Newsletter */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-1">
                <div className="relative w-auto h-6">
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
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                Plateforme innovante de gestion de santé connectant patients,
                médecins et établissements pour un parcours de soins optimisé et
                personnalisé.
              </p>
            </div>
          </div>

          {/* Column 2: Services */}
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Trouvez votre spécialiste
              </h3>
              <nav className="grid grid-cols-1 gap-2">
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Chirurgien-dentiste
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Ophtalmologue
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Infirmier à domicile
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Médecin généraliste
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Infirmier
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Cardiologue
                </Link>
              </nav>
            </div>
          </div>

          {/* Column 3: Company & Legal */}
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Notre Entreprise
              </h3>
              <nav className="grid grid-cols-1 gap-2">
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  À Propos de nous
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Carrières
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Besoin d&apos;aide ?
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Blog Santé
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Presse
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Partenaires
                </Link>
              </nav>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Informations légales
              </h3>
              <nav className="grid grid-cols-1 gap-2">
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Conditions d&apos;utilisation
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Politique de confidentialité
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Mentions légales
                </Link>
              </nav>
            </div>
          </div>

          {/* Column 4: Contact & Social */}
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hamdallaye ACI 2000
                    <br />
                    Bamako, MALI
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +223 77 77 77 77
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    contact@miticsarlml.com
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Suivez-nous
              </h3>
              <div className="flex space-x-2">
                <Link
                  href="#"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "bg-white dark:bg-gray-800 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary border-gray-200 dark:border-gray-700"
                  )}
                >
                  <Facebook className="h-4 w-4" />
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link
                  href="#"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "bg-white dark:bg-gray-800 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary border-gray-200 dark:border-gray-700"
                  )}
                >
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link
                  href="#"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "bg-white dark:bg-gray-800 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary border-gray-200 dark:border-gray-700"
                  )}
                >
                  <Instagram className="h-4 w-4" />
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link
                  href="#"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "bg-white dark:bg-gray-800 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary border-gray-200 dark:border-gray-700"
                  )}
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
                <Link
                  href="#"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "bg-white dark:bg-gray-800 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary border-gray-200 dark:border-gray-700"
                  )}
                >
                  <Youtube className="h-4 w-4" />
                  <span className="sr-only">YouTube</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Données sécurisées
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Image src="/apdp_logo.png" alt="RGPD" width={24} height={24} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Conforme RGPD
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Image src="/hds_logo.png" alt="HDS" width={24} height={24} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hébergeur de Données de Santé
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Image src="/iso_27001.png" alt="ISO" width={24} height={24} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ISO 27001
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} MITIC. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <Link href="#" className="hover:text-primary transition-colors">
                Accessibilité
              </Link>
              <Separator
                orientation="vertical"
                className="h-4 mx-1 bg-gray-300 dark:bg-gray-700"
              />
              <Link href="#" className="hover:text-primary transition-colors">
                Plan du site
              </Link>
              <Separator
                orientation="vertical"
                className="h-4 mx-1 bg-gray-300 dark:bg-gray-700"
              />
              <Link href="#" className="hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
