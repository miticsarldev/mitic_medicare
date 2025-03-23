"use client";

import * as React from "react";
import {
  HeartPulse,
  Shield,
  Star,
  Stethoscope,
  User,
  UserCheck,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type RoleStyle = {
  name: string;
  icon: React.ElementType;
  gradient: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  description: string;
};

const roleStyles: Record<UserRole, RoleStyle> = {
  PATIENT: {
    name: "Patient",
    icon: HeartPulse,
    gradient: "from-blue-500 to-cyan-400",
    textColor: "text-blue-700",
    bgColor: "bg-blue-100", // Slightly stronger background
    borderColor: "border-blue-300",
    description: "Accès patient",
  },
  HOSPITAL_DOCTOR: {
    name: "Médecin",
    icon: Stethoscope,
    gradient: "from-emerald-500 to-green-400",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-300",
    description: "Accès médecin",
  },
  HOSPITAL_ADMIN: {
    name: "Administrateur",
    icon: Shield,
    gradient: "from-purple-500 to-indigo-400",
    textColor: "text-purple-700",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
    description: "Accès complet",
  },
  INDEPENDENT_DOCTOR: {
    name: "Médecin Indépendant",
    icon: UserCheck,
    gradient: "from-amber-500 to-orange-400",
    textColor: "text-amber-700",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-300",
    description: "Accès médecin indépendant",
  },
  SUPER_ADMIN: {
    name: "Super Administrateur",
    icon: Star,
    gradient: "from-red-500 to-pink-400",
    textColor: "text-red-700",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    description: "Accès établissement & gestion avancée",
  },
};

export function TeamSwitcher() {
  const session = useSession();
  const user = session?.data?.user;

  const roleStyle = user?.role
    ? roleStyles[user.role.toLowerCase()]
    : {
        name: user?.role,
        icon: User,
        gradient: "from-gray-500 to-gray-400",
        textColor: "text-gray-700",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        description: "Utilisateur",
      };

  const RoleIcon = roleStyle.icon;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="group overflow-hidden transition-all duration-300 hover:shadow-md"
        >
          {/* Fond avec dégradé qui apparaît au survol */}
          <div
            className={cn(
              "absolute inset-0 opacity-0 bg-gradient-to-r transition-opacity duration-300 group-hover:opacity-10",
              roleStyle.gradient
            )}
          />

          {/* Avatar avec bordure colorée */}
          <div className="relative">
            <Avatar
              className={cn(
                "size-8 ring-2 ring-offset-2 transition-all duration-300",
                `ring-${roleStyle.borderColor}`,
                "group-hover:ring-offset-4"
              )}
            >
              <AvatarImage
                src={user?.userProfile?.avatarUrl ?? undefined}
                alt={`${user?.name}'s Image`}
              />
              <AvatarFallback
                className={cn(
                  "bg-gradient-to-br text-white font-medium",
                  roleStyle.gradient
                )}
              >
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") ?? "MC"}
              </AvatarFallback>
            </Avatar>

            {/* Icône de rôle en bas à droite de l'avatar */}
            <div
              className={cn(
                "absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center",
                "border-2 border-background",
                "bg-gradient-to-br text-white",
                roleStyle.gradient
              )}
            >
              <RoleIcon className="h-3 w-3" />
            </div>
          </div>

          {/* Informations utilisateur */}
          <div className="grid flex-1 text-left text-sm leading-tight ml-3">
            <span className="truncate font-semibold">{user?.name}</span>
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "px-2 py-0.5 text-xs font-normal transition-colors duration-300",
                  roleStyle.bgColor,
                  roleStyle.textColor,
                  roleStyle.borderColor,
                  "group-hover:bg-white"
                )}
              >
                <RoleIcon className="h-3 w-3 mr-1" />
                {roleStyle.name}
              </Badge>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
