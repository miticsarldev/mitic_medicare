"use client";

import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { getProfileLink } from "@/lib/utils";

export function NavUserNavbar({ user }: { user: Session["user"] | null }) {
  const profileLink = getProfileLink(user?.role ?? "SUPER_ADMIN");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full">
        <div className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                user?.userProfile?.avatarUrl
                  ? user?.userProfile?.avatarUrl
                  : "https://github.com/shadcn.png"
              }
              alt={user?.name || "Utilisateur"}
              className="object-contain"
            />
            <AvatarFallback>
              {`${user?.name
                ?.split(" ")
                .map((name) => name.charAt(0).toUpperCase())
                .join("")}`}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user?.name}</span>
            <span className="font-light text-sm text-muted-foreground">
              {user?.role === "SUPER_ADMIN"
                ? "Administrateur"
                : user?.role === "HOSPITAL_ADMIN"
                  ? "Administrateur d'hôpital"
                  : user?.role === "HOSPITAL_DOCTOR"
                    ? "Médecin d'hôpital"
                    : user?.role === "INDEPENDENT_DOCTOR"
                      ? "Médecin Independant"
                      : "Patient"}
            </span>
            <span className="font-light text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center gap-1">
            <Link href="/dashboard" className="flex items-center gap-1">
              <LayoutDashboard className="size-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          {user?.role !== "SUPER_ADMIN" && (
            <DropdownMenuItem className="flex items-center gap-1">
              <Link href={profileLink} className="flex items-center gap-1">
                <UserIcon className="size-4" />
                <span>Mon Profile</span>
              </Link>
            </DropdownMenuItem>
          )}
          {user?.role === "HOSPITAL_ADMIN" && (
            <DropdownMenuItem>
              <Link
                href="/dashboard/hopital_admin/management/details"
                className="flex items-center gap-1"
              >
                <CreditCard />
                <span>Mon hôpital</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
          <LogOut />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
