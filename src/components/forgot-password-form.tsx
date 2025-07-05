"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  const handleSendCode = async () => {
    if (!email) {
      setError("Veuillez saisir votre adresse email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Code de vérification envoyé par email");
        setStep(2);
      } else {
        setError(data.error || "Erreur lors de l'envoi du code");
      }
    } catch (error) {
      console.log(error);

      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setError("Veuillez saisir le code de vérification");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Code vérifié avec succès");
        setStep(3);
      } else {
        setError(data.error || "Code de vérification invalide");
      }
    } catch (error) {
      console.log(error);
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Mot de passe réinitialisé avec succès");
        setTimeout(() => {
          router.push("/auth");
        }, 2000);
      } else {
        setError(data.error || "Erreur lors de la réinitialisation");
      }
    } catch (error) {
      console.log(error);
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Saisissez votre email";
      case 2:
        return "Vérifiez votre email";
      case 3:
        return "Nouveau mot de passe";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Nous vous enverrons un code de vérification";
      case 2:
        return "Saisissez le code reçu par email";
      case 3:
        return "Choisissez un nouveau mot de passe sécurisé";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getStepTitle()}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {getStepDescription()}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {step > stepNumber ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                stepNumber
              )}
            </div>
            {stepNumber < 3 && (
              <div
                className={`w-8 h-0.5 ${step > stepNumber ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Email Input */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Adresse email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
          <Button
            className="w-full"
            onClick={handleSendCode}
            disabled={isLoading || !email}
          >
            {isLoading ? "Envoi en cours..." : "Envoyer le code"}
          </Button>
        </div>
      )}

      {/* Step 2: Code Verification */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium">
              Code de vérification
            </Label>
            <div className="relative">
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="pl-10 text-center text-lg tracking-widest"
                maxLength={6}
                disabled={isLoading}
              />
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Code envoyé à {email}
            </p>
          </div>
          <Button
            className="w-full"
            onClick={handleVerifyCode}
            disabled={isLoading || !code}
          >
            {isLoading ? "Vérification..." : "Vérifier le code"}
          </Button>
          <div className="text-center">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-primary hover:underline"
              disabled={isLoading}
            >
              Modifier mon email
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Password Reset */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              Nouveau mot de passe
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword1 ? "text" : "password"}
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword1(!showPassword1)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                disabled={isLoading}
              >
                {showPassword1 ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmer le mot de passe
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword2 ? "text" : "password"}
                placeholder="Confirmez le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                disabled={isLoading}
              >
                {showPassword2 ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Le mot de passe doit contenir :</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Au moins 8 caractères</li>
              <li>Une majuscule et une minuscule</li>
              <li>Un chiffre</li>
            </ul>
          </div>

          <Button
            className="w-full"
            onClick={handleResetPassword}
            disabled={isLoading || !newPassword || !confirmPassword}
          >
            {isLoading
              ? "Réinitialisation..."
              : "Réinitialiser le mot de passe"}
          </Button>
        </div>
      )}
    </div>
  );
}
