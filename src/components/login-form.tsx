"use client";

import { Eye, EyeOff, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Combined schema that accepts either email or phone
const loginSchema = z.object({
  identifier: z.string().refine(
    (val) => {
      // Email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[0-9]{8,15}$/;

      return emailRegex.test(val) || phoneRegex.test(val);
    },
    {
      message: "Veuillez entrer un email ou un numéro de téléphone valide",
    }
  ),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      if (!session.user.emailVerified) {
        localStorage.setItem(
          "mitic-pending-verification",
          JSON.stringify({
            email: session.user.email,
            role: session.user.role,
          })
        );
        router.push(`/auth/email-verification-required`);
      } else if (
        !session.user.isApproved &&
        (session.user.role === "HOSPITAL_ADMIN" ||
          session.user.role === "INDEPENDENT_DOCTOR")
      ) {
        localStorage.setItem(
          "mitic-pending-approval",
          JSON.stringify({
            email: session.user.email,
            role: session.user.role,
          })
        );

        router.push(`/auth/approval-required`);
      } else {
        router.push("/dashboard");
        localStorage.removeItem("mitic-pending-approval");
      }
    }
  }, [session, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
        callbackUrl,
      });

      console.log(result);

      if (result?.ok) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté à votre compte.",
        });

        if (result.url) {
          window.location.href = result.url;
        }
      } else {
        toast({
          variant: "destructive",
          title: "Échec de la connexion",
          description: "Identifiants ou mot de passe incorrects.",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description:
          "Quelque chose s'est mal passé. Veuillez vérifier vos identifiants et réessayer.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-lg md:text-xl font-medium">
        Veuillez saisir vos informations
      </h2>
      <div className="relative">
        <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          {...register("identifier")}
          type="text"
          placeholder="Email ou numéro de téléphone"
          className="w-full pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.identifier && (
          <p className="text-red-500 text-sm mt-1">
            {errors.identifier.message}
          </p>
        )}
      </div>
      <div className="relative">
        <Input
          {...register("password")}
          type={showPassword ? "text" : "password"}
          placeholder="Mot de passe"
          className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>
      {errors.password && (
        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
      )}
      <Button
        type="submit"
        className="w-full bg-[#107ACA]"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </Button>
      <div className="text-center">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Vous avez perdu votre mot de passe ?
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
