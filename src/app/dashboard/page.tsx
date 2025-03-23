import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Bienvenue sur le dashboard</h1>
      <p>
        Prochainement, nous allons faire une redirection baser sur le role de
        l&apos;utilisateur connecter
      </p>
      {/* <pre>{JSON.stringify(session)}</pre> */}
    </div>
  );
}
