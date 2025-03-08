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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function NavUserNavbar({ user }: { user: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full">
        <div className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative">
          <Avatar>
            <AvatarImage
              src={user?.image || "https://github.com/shadcn.png"}
              alt={user?.name || "Utilisateur"}
            />
            <AvatarFallback>{`${
              user?.name
                ? user?.name
                : ""
                    .split(" ")
                    .map((name) => name.charAt(0).toUpperCase())
                    .join("")
            }`}</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center gap-1">
            <Link href="/dashboard" className="flex items-center gap-1">
              <LayoutDashboard className="size-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-1">
            <Link href="/admin" className="flex items-center gap-1">
              <UserIcon className="size-4" />
              <span>Mon Profile</span>
            </Link>
          </DropdownMenuItem>
          {user?.role === "ADMIN" && (
            <DropdownMenuItem>
              <Link href="/admin" className="flex items-center gap-1">
                <CreditCard />
                <span>Mon entreprise</span>
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
