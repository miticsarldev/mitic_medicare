import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getDepartmentById } from "@/app/actions/ui-actions";
import DepartmentDoctors from "@/components/department-doctors";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const department = await getDepartmentById(params.id);

  if (!department) {
    return {
      title: "Médecins non trouvés | MITIC Care",
      description:
        "Le département que vous recherchez n'existe pas ou a été supprimé.",
    };
  }

  return {
    title: `Médecins du département ${department.name} - ${department.hospital.name} | MITIC Care`,
    description: `Découvrez les médecins du département ${department.name} de l'hôpital ${department.hospital.name}. Prenez rendez-vous en ligne avec MITIC Care.`,
  };
}

export default async function DepartmentDoctorsPage({
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
          <DepartmentDoctors department={department} />
        </Suspense>
        <Footer />
      </div>
    </main>
  );
}
