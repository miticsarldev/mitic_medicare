import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import HospitalDetail from "@/components/hospital-detail";
import { getHospitalById } from "@/app/actions/ui-actions";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const hospital = await getHospitalById(params.id);

  if (!hospital) {
    return {
      title: "Hôpital non trouvé | MITICCARE",
      description:
        "L'hôpital que vous recherchez n'existe pas ou a été supprimé.",
    };
  }

  return {
    title: `${hospital.name} | MITICCARE`,
    description: `Découvrez les informations sur ${hospital.name}, ses départements et ses médecins. Prenez rendez-vous en ligne avec MITICCARE.`,
  };
}

export default async function HospitalPage({
  params,
}: {
  params: { id: string };
}) {
  const hospital = await getHospitalById(params.id);

  if (!hospital) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="max-w-screen-xl mx-auto">
        <Navbar />
        <Suspense
          fallback={<Skeleton className="h-[600px] w-full rounded-xl mt-6" />}
        >
          <HospitalDetail hospital={hospital} />
        </Suspense>
        <Footer />
      </div>
    </main>
  );
}
