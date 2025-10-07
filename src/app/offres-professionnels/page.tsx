import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { fetchPricing } from "@/lib/pricing";
import PricingTable from "@/components/pricing/pricing-table";

export const metadata: Metadata = {
  title: "Offres pour les professionnels de santé | MiticCare",
  description:
    "Choisissez le plan MiticCare adapté : Médecin indépendant ou Hôpital. FREE, STANDARD ou PREMIUM avec quotas et avantages clairs.",
};

export default async function Page() {
  const plans = await fetchPricing(); // lit PlanConfig + Limits + Prices
  return (
    <div className="max-w-screen-xl mx-auto">
      <Navbar />

      <section className="relative min-h-[40vh] overflow-hidden">
        {/* BG */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[-8%] top-[-8%] h-72 w-72 rounded-full bg-blue-400/25 blur-3xl" />
          <div className="absolute right-[-5%] bottom-[-8%] h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
        </div>

        <div className="px-4 py-10 md:py-14">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-sky-700 border-sky-200 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800">
              Plateforme pro • Médecins & Hôpitaux
            </span>
            <h1 className="mt-4 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-white dark:to-slate-300 md:text-5xl">
              Découvrir nos offres pour les professionnels de santé
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              Une suite moderne et sécurisée pour la pratique médicale.
              Choisissez votre profil, comparez les plans, et démarrez en
              quelques minutes.
            </p>
          </div>

          <div className="mt-8">
            <PricingTable plans={plans} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
