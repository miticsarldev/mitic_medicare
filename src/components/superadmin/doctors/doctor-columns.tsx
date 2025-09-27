"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Check,
  Eye,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Doctor } from "@/types/doctor";

interface UseDoctorColumnsProps {
  openDoctorDetail: (doctor: Doctor) => void;
  openDoctorEdit: (doctor: Doctor) => void;
  openDeleteDialog: (doctor: Doctor) => void;
  handleStatusChange: (doctorId: string, status: "active" | "inactive") => void;
  handleVerificationChange: (doctorId: string, verified: boolean) => void;
}

export function useDoctorColumns({
  openDoctorDetail,
  openDoctorEdit,
  openDeleteDialog,
  handleStatusChange,
  handleVerificationChange,
}: UseDoctorColumnsProps) {
  const columns = useMemo<ColumnDef<Doctor>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "avatar",
        header: "",
        cell: ({ row }) => (
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={row.original.user.profile?.avatarUrl}
              alt={row.original.user.name}
            />
            <AvatarFallback>{row.original.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.user.name}</span>
            <span>{row.original.hospital?.name}</span>
            <span className="text-xs">{row.original.specialization}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.user.email}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.user.phone}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "location",
        header: ({ column }) => (
          <div
            className="items-center cursor-pointer hidden md:flex"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Localisation
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="hidden md:block">
            {row.original.user.profile?.city || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge
              variant={row.original.user.isActive ? "default" : "secondary"}
              className={
                row.original.user.isActive
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-500 hover:bg-gray-600"
              }
            >
              {row.original.user.isActive ? "Actif" : "Inactif"}
            </Badge>
            {row.original.isVerified && (
              <Badge
                variant="outline"
                className="border-blue-500 text-blue-500"
              >
                <Check className="mr-1 h-3 w-3" />
                Vérifié
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "patients",
        header: ({ column }) => (
          <div
            className="items-center cursor-pointer justify-end hidden lg:flex"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Patients
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right hidden lg:block">
            {row.original._count?.appointments || 0}
          </div>
        ),
      },
      {
        accessorKey: "rating",
        header: ({ column }) => (
          <div
            className="items-center cursor-pointer justify-end hidden lg:flex"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Note
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right hidden lg:block">
            {row.original.avgRating ? (
              <div className="flex items-center justify-end">
                <span className="mr-1">
                  {row.original.avgRating.toFixed(1)}
                </span>
                <svg
                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 15.585l-7.07 3.707 1.35-7.857L.587 7.11l7.897-1.147L10 0l2.516 5.963 7.897 1.147-5.693 5.325 1.35 7.857z"
                  />
                </svg>
              </div>
            ) : (
              <span className="text-muted-foreground">N/A</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "joinedAt",
        header: ({ column }) => (
          <div
            className="items-center cursor-pointer hidden xl:flex"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Inscription
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="hidden xl:block">
            {format(
              new Date(row.original.user.createdAt || new Date()),
              "dd/MM/yyyy"
            )}
          </div>
        ),
      },
      {
        accessorKey: "subscription",
        header: ({ column }) => (
          <div
            className="items-center cursor-pointer hidden xl:flex"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Abonnement
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="hidden xl:block">
            <Badge
              variant="outline"
              className={
                row.original.subscription?.plan === "FREE"
                  ? "border-purple-500 text-purple-500"
                  : row.original.subscription?.plan === "PREMIUM"
                    ? "border-blue-500 text-blue-500"
                    : row.original.subscription?.plan === "FREE"
                      ? "border-amber-500 text-amber-500"
                      : row.original.subscription?.plan === "STANDARD"
                        ? "border-red-500 text-red-500"
                        : "border-gray-500 text-gray-500"
              }
            >
              {row.original.subscription?.plan || "Medecin d'Hopital"}
            </Badge>
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const doctor = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openDoctorDetail(doctor)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDoctorEdit(doctor)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {doctor.user.isActive ? (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(doctor.id, "inactive")}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Désactiver
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(doctor.id, "active")}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Activer
                  </DropdownMenuItem>
                )}
                {!doctor.isVerified && (
                  <DropdownMenuItem
                    onClick={() => handleVerificationChange(doctor.id, true)}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Vérifier
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => openDeleteDialog(doctor)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [
      openDoctorDetail,
      openDoctorEdit,
      openDeleteDialog,
      handleStatusChange,
      handleVerificationChange,
    ]
  );

  return columns;
}
