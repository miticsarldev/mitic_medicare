"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Home,
  Mail,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientAnimationWrapper } from "@/components/client-animation-wrapper";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

type VerificationStatus =
  | "loading"
  | "missing"
  | "invalid"
  | "error"
  | "already_verified"
  | "expired"
  | "success";

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const role = useMemo(() => searchParams.get("role"), [searchParams]);

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [title, setTitle] = useState<string>(
    "Vérification de votre adresse email"
  );
  const [description, setDescription] = useState<string>(
    `Votre compte est maintenant actif et votre abonnement gratuit
                  a été activé. Veuillez vous connecter à votre compte pour
                  accéder à votre tableau de bord.`
  );
  const [message, setMessage] = useState(
    "Vérification de votre adresse email en cours..."
  );
  const [resendLoading, setResendLoading] = useState(false);

  const hasRun = useRef<string | null>(null);

  useEffect(() => {
    if (!token || !role) {
      setStatus("missing");
      setMessage(
        "Le lien de vérification est invalide. Aucun token n'a été fourni."
      );
      return;
    }

    if (hasRun.current === token) return; // Prevent duplicate execution
    hasRun.current = token; // Store current token to avoid re-running

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `/api/auth/verify?token=${token}&role=${role}`
        );
        const data = await response.json();

        if (response.ok) {
          // Success case - email verified successfully
          setStatus("success");
          setTitle("Vérification de votre adresse email");
          setMessage(
            data.message ||
              "Votre adresse email a été vérifiée avec succès ! Veuillez vous connecter pour continuer."
          );

          // Show success toast
          toast({
            title: "Vérification réussie",
            description:
              "Votre email a été vérifié et votre abonnement gratuit a été activé. Vous pouvez maintenant vous connecter.",
            variant: "default",
          });
        } else {
          if (data.error === "Token manquant.") {
            setStatus("missing");
            setMessage(
              "Le lien de vérification est invalide. Aucun token n'a été fourni."
            );
          } else if (data.error === "Token invalide.") {
            setStatus("invalid");
            setMessage("Le lien de vérification est invalide.");
          } else if (data.error === "Utilisateur introuvable.") {
            setStatus("error");
            setMessage("Utilisateur introuvable.");
          } else if (data.error === "Votre adresse email est déjà vérifiée.") {
            setStatus("already_verified");
            setMessage("Votre adresse email est déjà vérifiée.");
          } else if (data.error === "Token expiré.") {
            setStatus("expired");
            setMessage(
              "Le lien de vérification a expiré. Veuillez demander un nouveau lien."
            );
          }
        }
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage(
          "Une erreur s'est produite lors de la vérification de votre email. Veuillez réessayer."
        );
      }
    };

    verifyEmail();
  }, [token, role]);

  const handleResendVerification = async () => {
    setResendLoading(true);
    setMessage("Envoi d'un nouveau lien de vérification...");
    setTitle("Envoi d'un nouveau lien de vérification...");
    setDescription(
      "Un nouveau lien de vérification vous sera envoyé par email. Veuillez vérifier votre boîte de réception"
    );

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, role }),
      });
      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(
          data.message ||
            "Un nouveau lien de vérification a été envoyé à votre adresse email."
        );

        toast({
          title: "Lien de vérification envoyé avec succès",
          description:
            data.message ||
            "Un nouveau lien de vérification a été envoyé à votre adresse email.",
        });
      } else {
        setStatus("error");
        setMessage(data.error || "Impossible d'envoyer un nouveau lien.");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Une erreur s'est produite lors de l'envoi du nouveau lien.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30 flex flex-col items-center justify-center p-4">
      <ClientAnimationWrapper
        className="w-full max-w-md"
        initialAnimation={{ opacity: 0, y: 20 }}
        animateAnimation={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-gray-200 dark:border-gray-800 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-20 h-20 relative">
              {status === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
              )}

              {(status === "missing" ||
                status === "invalid" ||
                status === "error") && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full">
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
                </div>
              )}

              {status === "already_verified" && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
                </div>
              )}

              {status === "expired" && (
                <div className="absolute inset-0 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <RefreshCw className="h-12 w-12 text-amber-600 dark:text-amber-500" />
                </div>
              )}

              {status === "success" && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
                </div>
              )}
            </div>

            <CardTitle className="text-2xl font-bold">
              {status === "loading" && "En cours..."}
              {status === "missing" && "Lien invalide"}
              {status === "invalid" && "Lien invalide"}
              {status === "error" && "Erreur de vérification"}
              {status === "already_verified" && "Email déjà vérifiée."}
              {status === "expired" && "Lien expiré"}
              {status === "success" && title}
            </CardTitle>

            <CardDescription className="text-base mt-2">
              {message}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {status === "loading" && (
              <div className="flex justify-center">
                <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
                  <div className="bg-primary h-2.5 rounded-full animate-pulse w-full"></div>
                </div>
              </div>
            )}

            {status === "missing" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-4 text-center">
                <p className="text-red-800 dark:text-red-300 text-sm">
                  Token introuvé. Veuillez cliquer sur le bouton de vérification
                  recu par email.
                </p>
              </div>
            )}

            {status === "invalid" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-4 text-center">
                <p className="text-red-800 dark:text-red-300 text-sm">
                  Ce lien de vérification trouvé est invalide. Veuillez cliquer
                  sur le bouton de vérification recu par email.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-4 text-center">
                <p className="text-red-800 dark:text-red-300 text-sm">
                  Une erreur s’est produite lors de la vérification de votre
                  compte. Utilisateur introuvable. Veuillez contacter
                  l’administrateur.
                </p>
              </div>
            )}

            {status === "already_verified" && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4 text-center">
                <p className="text-green-800 dark:text-green-300 text-sm mb-2">
                  Votre compte a dejà été vérifié. Veuillez vous connecter à
                  votre compte pour accéder à votre tableau de bord.
                </p>
              </div>
            )}

            {status === "expired" && (
              <div className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <p className="text-amber-800 dark:text-amber-300 text-sm mb-2">
                  Le lien de vérification a expiré. Veuillez redemander un
                  nouveau lien de vérification en cliquant sur le bouton
                  ci-dessous.
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4 text-center">
                <p className="text-green-800 dark:text-green-300 text-sm mb-2">
                  {description}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
            {(status === "success" || status === "already_verified") && (
              <Button className="w-full" onClick={() => router.push("/auth")}>
                Se connecter au tableau de bord{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {status === "expired" && (
              <Button
                className="w-full"
                onClick={handleResendVerification}
                disabled={resendLoading}
              >
                {resendLoading
                  ? "Envoi en cours..."
                  : "Demander un nouveau lien"}{" "}
                <Mail className="ml-2 h-4 w-4" />
              </Button>
            )}

            {(status === "error" ||
              status === "missing" ||
              status === "invalid") && (
              <>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => router.push("/")}
                >
                  <Home className="mr-2 h-4 w-4" /> Accueil
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => router.push("/auth")}
                >
                  Se connecter <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Besoin d&apos;aide ?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contactez notre support
            </Link>
          </p>
        </div>
      </ClientAnimationWrapper>
    </div>
  );
};

export default function VerifyPage() {
  return (
    <Suspense fallback={<Loader size="lg" />}>
      <VerifyEmail />
    </Suspense>
  );
}
