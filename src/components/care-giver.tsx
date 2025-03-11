"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  HeartPulse,
  Shield,
  Star,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CareGiver() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [isHovered, setIsHovered] = useState(false);

  const benefits = [
    {
      icon: <HeartPulse className="h-5 w-5 text-primary" />,
      title: "Soins optimisés",
      description:
        "Dispensez les meilleurs soins possibles à vos patients grâce à nos outils avancés",
    },
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: "Gain de temps",
      description:
        "Réduisez vos tâches administratives et consacrez plus de temps à vos patients",
    },
    {
      icon: <Calendar className="h-5 w-5 text-primary" />,
      title: "Gestion simplifiée",
      description:
        "Gérez facilement vos rendez-vous, dossiers patients et communications",
    },
    {
      icon: <Award className="h-5 w-5 text-primary" />,
      title: "Revenus optimisés",
      description:
        "Augmentez les revenus de votre activité grâce à une meilleure organisation",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-16 px-4 bg-gradient-to-br dark:from-gray-900 dark:to-indigo-950"
    >
      <div className="mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-gray-800"
        >
          {/* Background pattern */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center p-6 md:p-10">
            <div className="w-full lg:w-5/12 mb-8 lg:mb-0 lg:pr-10">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative z-10 rounded-2xl overflow-hidden shadow-lg"
                >
                  <Image
                    src="/professional-user.webp"
                    alt="Professionnel de santé utilisant MediCare"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>

                <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-3 z-20">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">
                      +410 000 soignants
                    </span>
                  </div>
                </div>

                <div className="absolute -top-4 -left-4 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-3 z-20">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-7/12">
              <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 dark:bg-primary/20">
                Pour les professionnels de santé
              </Badge>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Vous êtes <span className="text-primary">Soignant</span> ?
              </h2>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                Découvrez MediCare Pro et transformez votre pratique quotidienne
                avec notre plateforme conçue par et pour les professionnels de
                santé.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white gap-2 px-6 py-6 rounded-xl text-lg font-medium"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    Découvrir MediCare Pro
                    <motion.div
                      animate={{ x: isHovered ? 5 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </Button>
                </motion.div>

                <Link
                  href="#testimonials"
                  className="text-primary font-medium hover:underline"
                >
                  Voir les témoignages
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Données sécurisées et conformes RGPD & HDS
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 flex flex-wrap justify-between items-center gap-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Utilisé par plus de 410 000 soignants en France
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm flex items-center">
                <CardContent className="p-3 flex items-center gap-2">
                  <Image
                    src="/hopital.webp"
                    alt="Hôpital"
                    width={40}
                    height={40}
                    className="rounded-full w-auto h-auto"
                  />
                  <span className="text-sm font-medium">Hôpitaux</span>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm flex items-center">
                <CardContent className="p-3 flex items-center gap-2">
                  <Image
                    src="/clinic.webp"
                    alt="Clinique"
                    width={40}
                    height={40}
                    className="rounded-full w-auto h-auto"
                  />
                  <span className="text-sm font-medium">Cliniques</span>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm flex items-center">
                <CardContent className="p-3 flex items-center gap-2">
                  <Image
                    src="/doctors.webp"
                    alt="Médecin"
                    width={40}
                    height={40}
                    style={{ width: "auto", height: "auto" }}
                    className="rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">Médecins libéraux</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
