"use client";

import { Eye, EyeOff, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("L'adresse email doit avoir un format valide"),
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
        signOut({ redirect: false }).then(() => {
          localStorage.setItem(
            "mitic-pending-verification",
            JSON.stringify({
              email: session.user.email,
              role: session.user.role,
            })
          );

          router.push(`/auth/email-verification-required`);
        });
      } else if (
        !session.user.isApproved &&
        (session.user.role === "hospital_admin" ||
          session.user.role === "independent_doctor")
      ) {
        signOut({ redirect: false }).then(() => {
          localStorage.setItem(
            "mitic-pending-approval",
            JSON.stringify({
              email: session.user.email,
              role: session.user.role,
            })
          );

          router.push(`/auth/approval-required`);
        });
      } else {
        router.push("/dashboard");
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
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.ok) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté à votre compte.",
        });
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
          "Quelque chose s'est mal passé. Veuillez vérifier vos identifiants et réessayer plus tard.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-lg md:text-xl font-medium">
        Veuillez saisir vos informations
      </h2>
      <div className="relative">
        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          {...register("email")}
          type="email"
          placeholder="Adresse email"
          className="w-full pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          className="text-[#107ACA] border-[#107ACA] focus:ring-[#107ACA]"
        />
        <label htmlFor="remember" className="text-sm font-medium">
          Se souvenir de moi
        </label>
      </div>
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
