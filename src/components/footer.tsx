"use client";

import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";

import { cn } from "@/lib/utils";
import { contactEmail, primaryContactNumber } from "@/constant";

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const whatsappHref1 = `https://wa.me/${primaryContactNumber.replace(/\D/g, "")}`;
  const email = contactEmail;

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const trustBadgeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.2 + i * 0.1,
      },
    }),
  };

  return (
    <footer className={cn("bg-gray-50 dark:bg-gray-900 border-t", className)}>
      {/* Main Footer Content */}
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {/* Column 1: About & Newsletter */}
          <motion.div className="space-y-6" variants={fadeInUp}>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Link href="/" className="flex items-center space-x-1">
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
                </Link>
              </motion.div>
              <motion.p
                variants={fadeInUp}
                className="text-sm text-gray-600 dark:text-gray-400 max-w-xs"
              >
                Plateforme innovante de gestion de santé connectant patients,
                médecins et établissements pour un parcours de soins optimisé et
                personnalisé.
              </motion.p>
            </div>
          </motion.div>

          {/* Column 3: Company & Legal */}
          <motion.div className="space-y-6" variants={fadeInUp}>
            <motion.div variants={fadeInUp}>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Notre Entreprise
              </h3>
              <motion.nav
                className="grid grid-cols-1 gap-2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {[
                  { href: "/about", label: "À Propos de nous" },
                  { href: "/help", label: "Besoin d'aide ?" },
                  {
                    href: "/offres-professionnels",
                    label: "Offres Professionnels",
                  },
                  {
                    href: "/conditions-utilisation",
                    label: "Conditions d'utilisation",
                  },
                  {
                    href: "/politique-confidentialite",
                    label: "Politique de confidentialité",
                  },
                ].map((link, index) => (
                  <motion.div key={index} variants={fadeInUp}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
            </motion.div>
          </motion.div>

          {/* Column 4: Contact & Social */}
          <motion.div className="space-y-6" variants={fadeInUp}>
            <motion.div variants={fadeInUp}>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Contact
              </h3>
              <motion.div
                className="space-y-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div
                  variants={fadeInUp}
                  className="flex items-start space-x-3"
                >
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hamdallaye ACI 2000
                    <br />
                    Bamako, MALI
                  </p>
                </motion.div>
                <motion.a
                  href={whatsappHref1}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeInUp}
                  className="flex items-center space-x-3 group"
                  aria-label="Ouvrir WhatsApp"
                >
                  <SiWhatsapp className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:underline">
                    {primaryContactNumber}
                  </p>
                </motion.a>

                <motion.a
                  href={`mailto:${email}`}
                  variants={fadeInUp}
                  className="flex items-center space-x-3 group"
                  aria-label="Envoyer un email"
                >
                  <Mail className="h-5 w-5 text-primary" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:underline">
                    {email}
                  </p>
                </motion.a>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {[
              {
                icon: <Shield className="h-5 w-5 text-primary" />,
                label: "Données sécurisées",
              },
              {
                icon: (
                  <Image
                    src="/apdp_logo.png"
                    alt="RGPD"
                    width={24}
                    height={24}
                  />
                ),
                label: "Conforme RGPD",
              },
              {
                icon: (
                  <Image src="/hds_logo.png" alt="HDS" width={24} height={24} />
                ),
                label: "Hébergeur de Données de Santé",
              },
              {
                icon: (
                  <Image
                    src="/iso_27001.png"
                    alt="ISO"
                    width={24}
                    height={24}
                  />
                ),
                label: "ISO 27001",
              },
            ].map((badge, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={trustBadgeVariants}
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                {badge.icon}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {badge.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 py-4">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} MITIC. Tous droits réservés.
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
