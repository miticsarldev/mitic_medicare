"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  XCircle,
  Lock,
  ArrowRight,
  Home,
  EyeOff,
  Eye,
} from "lucide-react";

import { ClientAnimationWrapper } from "@/components/client-animation-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

type PageStatus =
  | "checking"
  | "invalid"
  | "ready"
  | "submitting"
  | "success"
  | "error";

export default function NewPasswordScreen() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => sp.get("token"), [sp]);

  const [status, setStatus] = useState<PageStatus>("checking");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const hasChecked = useRef<string | null>(null);

  // Validate token and load email
  useEffect(() => {
    const check = async () => {
      if (!token) {
        setStatus("invalid");
        return;
      }
      if (hasChecked.current === token) return;
      hasChecked.current = token;
      try {
        const res = await fetch(
          `/api/auth/new-password?token=${encodeURIComponent(token)}`
        );
        const json = await res.json();
        if (res.ok && json.valid) {
          setEmail(json.email ?? "");
          setStatus("ready");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("error");
      }
    };
    check();
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!password || password.length < 8) {
      toast({
        title: "Mot de passe trop court",
        description: "Au moins 8 caractères.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/auth/new-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Échec");

      toast({
        title: "Mot de passe enregistré",
        description: "Vous pouvez maintenant vous connecter.",
      });
      setStatus("success");
      // Reste cohérent avec la page de vérification
      router.push("/auth");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message ?? "Impossible d'enregistrer le mot de passe",
        variant: "destructive",
      });
      setStatus("error");
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
              {status === "checking" || status === "submitting" ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
              ) : null}

              {status === "invalid" || status === "error" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full">
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
                </div>
              ) : null}

              {status === "ready" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Lock className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              ) : null}

              {status === "success" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
                </div>
              ) : null}
            </div>

            <CardTitle className="text-2xl font-bold">
              {status === "checking" && "Vérification du lien…"}
              {status === "ready" && "Définir un mot de passe"}
              {status === "submitting" && "Enregistrement…"}
              {status === "success" && "Mot de passe enregistré"}
              {status === "invalid" && "Lien invalide ou expiré"}
              {status === "error" && "Erreur"}
            </CardTitle>

            <CardDescription className="text-base mt-2">
              {status === "checking" && "Merci de patienter."}
              {status === "ready" && (
                <>
                  Compte&nbsp;: <span className="font-medium">{email}</span>
                </>
              )}
              {status === "submitting" &&
                "Nous mettons à jour votre mot de passe."}
              {status === "success" && "Vous pouvez maintenant vous connecter."}
              {status === "invalid" &&
                "Demandez un nouveau lien d’invitation ou de réinitialisation."}
              {status === "error" &&
                "Une erreur est survenue. Veuillez réessayer ou contacter le support."}
            </CardDescription>
          </CardHeader>

          {(status === "checking" || status === "submitting") && (
            <CardContent className="pt-4">
              <div className="flex justify-center">
                <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
                  <div className="bg-primary h-2.5 rounded-full animate-pulse w-full" />
                </div>
              </div>
            </CardContent>
          )}

          {status === "ready" && (
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label>Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      minLength={8}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={status === ("submitting" as PageStatus)}
                >
                  {status === ("submitting" as PageStatus)
                    ? "Enregistrement…"
                    : "Enregistrer"}
                </Button>
              </form>
            </CardContent>
          )}

          {(status === "invalid" ||
            status === "error" ||
            status === "success") && (
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              {(status === "invalid" || status === "error") && (
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
              {status === "success" && (
                <Button className="w-full" onClick={() => router.push("/auth")}>
                  Se connecter au tableau de bord{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          )}
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
}

// export default function NewPasswordPage() {
//   return (
//     <Suspense fallback={<Loader size="lg" />}>
//       <NewPasswordScreen />
//     </Suspense>
//   );
// }
