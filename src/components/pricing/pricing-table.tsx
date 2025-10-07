"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Stethoscope,
  CheckCircle2,
  Minus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { PlanDTO } from "@/lib/pricing";
import { BillingInterval, SubscriberType } from "@prisma/client";

function formatAmountXOF(amountStr: string, currency = "XOF") {
  const n = Number(amountStr);
  if (Number.isNaN(n)) return amountStr;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

function prettyLimit(v: number | null, label: string) {
  const value =
    v === null ? "Illimité" : new Intl.NumberFormat("fr-FR").format(v);
  return `${value} ${label}`;
}

function planExtras(code: string) {
  // petits bonus visuels par plan
  if (code === "FREE")
    return ["Essai gratuit", "Accès limité aux fonctionnalités principales"];
  if (code === "STANDARD")
    return [
      "Support standard",
      "Outils essentiels pour cabinet / petite structure",
    ];
  if (code === "PREMIUM")
    return ["Support prioritaire", "Fonctionnalités avancées & reporting"];
  return [];
}

export default function PricingTable({ plans }: { plans: PlanDTO[] }) {
  console.log({ plans });
  const [subscriberType, setSubscriberType] =
    useState<SubscriberType>("DOCTOR");
  const [interval, setInterval] = useState<BillingInterval>("MONTH");

  const filtered = useMemo(() => {
    return plans.map((p) => {
      const price =
        p.prices.find(
          (pr) =>
            pr.subscriberType === subscriberType && pr.interval === interval
        ) ?? p.prices.find((pr) => pr.subscriberType === subscriberType);
      return { plan: p, price };
    });
  }, [plans, subscriberType, interval]);

  return (
    <div className="space-y-6">
      {/* Switchers */}
      <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:gap-6">
        <div className="inline-flex items-center rounded-xl border bg-white/70 p-1 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
          <button
            onClick={() => setSubscriberType("DOCTOR")}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition ${
              subscriberType === "DOCTOR"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Stethoscope className="h-4 w-4" />
            Médecin indépendant
          </button>
          <button
            onClick={() => setSubscriberType("HOSPITAL")}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition ${
              subscriberType === "HOSPITAL"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Hôpital
          </button>
        </div>

        <div className="inline-flex items-center rounded-xl border bg-white/70 p-1 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
          <button
            onClick={() => setInterval("MONTH")}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              interval === "MONTH"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Mensuel
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
        {filtered.map(({ plan, price }, idx) => {
          const highlight = plan.code === "PREMIUM";
          const currency = price?.currency ?? "XOF";
          const amount = price ? formatAmountXOF(price.amount, currency) : "—";
          const extras = planExtras(plan.code);

          return (
            <motion.div
              key={plan.code}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className={`relative rounded-2xl border p-6 shadow-sm backdrop-blur
                ${highlight ? "border-sky-300/70 bg-gradient-to-br from-white/80 to-sky-50/70 dark:from-slate-900/70 dark:to-sky-950/30 dark:border-sky-800" : "border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70"}
              `}
            >
              {highlight && (
                <div className="absolute -right-2 -top-2 inline-flex items-center gap-1 rounded-full bg-sky-600 px-3 py-1 text-xs font-medium text-white shadow">
                  <Sparkles className="h-3.5 w-3.5" />
                  Populaire
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {plan.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {plan.description}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">{amount}</span>
                  <span className="text-xs text-slate-500">
                    / {interval === "YEAR" ? "an" : "mois"}
                  </span>
                </div>
                {!price && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    Tarif non défini pour cet intervalle — affichage indicatif.
                  </p>
                )}
              </div>

              {/* Limits */}
              <ul className="space-y-2">
                {plan.limits ? (
                  <>
                    <FeatureItem
                      text={prettyLimit(
                        plan.limits.maxAppointments,
                        "rendez-vous/mois"
                      )}
                    />
                    <FeatureItem
                      text={prettyLimit(plan.limits.maxPatients, "patients")}
                    />
                    {subscriberType === "HOSPITAL" && (
                      <FeatureItem
                        text={prettyLimit(
                          plan.limits.maxDoctorsPerHospital,
                          "médecins par hôpital"
                        )}
                      />
                    )}
                  </>
                ) : (
                  <li className="flex items-center gap-2 text-slate-500">
                    <Minus className="h-4 w-4" /> Limites non spécifiées
                  </li>
                )}
              </ul>

              {/* Extras */}
              {extras.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {extras.map((e) => (
                    <li
                      key={e}
                      className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                    >
                      <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      {e}
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA */}
              <div className="mt-6">
                <p className="mt-2 text-center text-xs text-slate-500">
                  Pas prêt ?{" "}
                  <Link
                    href="/help#contact"
                    className="text-sky-600 hover:underline"
                  >
                    Parler au support
                  </Link>
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
      <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
      <span>{text}</span>
    </li>
  );
}
