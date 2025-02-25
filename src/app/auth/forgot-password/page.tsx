"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail,  } from "lucide-react";


export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const router = useRouter();

  const handleNextStep = () => {
    if (step === 1 && email) setStep(2);
    else if (step === 2 && code) setStep(3);
    else if (step === 3 && newPassword === confirmPassword) alert("Mot de passe réinitialisé !");
  };

  const handleResetPassword = () => {
    if (newPassword === confirmPassword) {
      alert("Mot de passe réinitialisé !");
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-100/50 dark:from-background dark:to-blue-950/50">
      <div className="max-w-screen-xl mx-auto">
        <Navbar />
        <main className="container px-4 py-8 md:py-12">
          <div className="max-w-md mx-auto space-y-6">
            <h1 className="text-xl md:text-2xl font-semibold text-center">
              Réinitialisation du mot de passe
            </h1>

            <div className="bg-card dark:bg-card/50 rounded-lg shadow-lg p-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label className="block text-sm font-medium">Adresse email</Label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="Saisissez votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pr-4 py-2"
                      />
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={handleNextStep}>
                    Envoyer le code
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label className="block text-sm font-medium">Code de vérification</Label>
                    <Input
                      type="text"
                      placeholder="Entrez le code reçu"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button className="w-full mt-4" onClick={handleNextStep}>
                    Vérifier le code
                  </Button>
                  <div className="text-sm text-center mt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="text-primary hover:underline"
                    >
                      Modifier mon email
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label className="block text-sm font-medium">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        type={showPassword1 ? "text" : "password"}
                        placeholder="Confirmez le mot de passe"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword1(!showPassword1)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                        {showPassword1 ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label className="block text-sm font-medium">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Input
                        type={showPassword2 ? "text" : "password"}
                        placeholder="Confirmez le mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword2(!showPassword2)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                        {showPassword2 ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  <Button className="w-full mt-4" onClick={handleResetPassword}>
                    Réinitialiser le mot de passe
                  </Button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
