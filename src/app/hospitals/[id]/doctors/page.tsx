import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getHospitalById } from "@/app/actions/ui-actions";
import HospitalDoctors from "@/components/hospital-doctors";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const hospital = await getHospitalById(params.id);

  if (!hospital) {
    return {
      title: "Médecins non trouvés | MITIC Care",
      description:
        "L'hôpital que vous recherchez n'existe pas ou a été supprimé.",
    };
  }

  return {
    title: `Médecins de ${hospital.name} | MITIC Care`,
    description: `Découvrez les médecins de ${hospital.name}. Prenez rendez-vous en ligne avec MITIC Care.`,
  };
}

export default async function HospitalDoctorsPage({
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
          <HospitalDoctors hospital={hospital} />
        </Suspense>
        <Footer />
      </div>
    </main>
  );
}
