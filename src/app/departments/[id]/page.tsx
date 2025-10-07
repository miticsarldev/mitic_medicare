import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getDepartmentById } from "@/app/actions/ui-actions";
import DepartmentDetail from "@/components/department-detail";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const department = await getDepartmentById(params.id);

  if (!department) {
    return {
      title: "Département non trouvé | MITICCARE",
      description:
        "Le département que vous recherchez n'existe pas ou a été supprimé.",
    };
  }

  return {
    title: `${department.name} - ${department.hospital.name} | MITICCARE`,
    description: `Découvrez les informations sur le département ${department.name} de l'hôpital ${department.hospital.name} et ses médecins. Prenez rendez-vous en ligne avec MITICCARE.`,
  };
}

export default async function DepartmentPage({
  params,
}: {
  params: { id: string };
}) {
  const department = await getDepartmentById(params.id);

  if (!department) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="max-w-screen-xl mx-auto">
        <Navbar />
        <Suspense
          fallback={<Skeleton className="h-[600px] w-full rounded-xl mt-6" />}
        >
          <DepartmentDetail department={department} />
        </Suspense>
        <Footer />
      </div>
    </main>
  );
}
