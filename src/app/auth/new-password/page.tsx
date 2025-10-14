import { Suspense } from "react";
import NewPasswordScreen from "./content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function Fallback() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    </div>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <NewPasswordScreen />
    </Suspense>
  );
}
