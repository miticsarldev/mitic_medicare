"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Building,
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
import type { Hospital } from "@/types/hospital";
import type { HospitalStatus } from "@prisma/client";

interface UseHospitalColumnsProps {
  openHospitalDetail: (hospital: Hospital) => void;
  openHospitalEdit: (hospital: Hospital) => void;
  openDeleteDialog: (hospital: Hospital) => void;
  handleStatusChange: (hospitalId: string, status: HospitalStatus) => void;
  handleVerificationChange: (hospitalId: string, verified: boolean) => void;
}

export function useHospitalColumns({
  openHospitalDetail,
  openHospitalEdit,
  openDeleteDialog,
  handleStatusChange,
  handleVerificationChange,
}: UseHospitalColumnsProps) {
  const columns = useMemo<ColumnDef<Hospital>[]>(
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
        accessorKey: "logo",
        header: "",
        cell: ({ row }) => (
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={row.original.logoUrl || ""}
              alt={row.original.name}
            />
            <AvatarFallback>
              <Building className="h-4 w-4" />
            </AvatarFallback>
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
            Établissement
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.email}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "city",
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
          <div className="hidden md:block">{row.original.city}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge
              variant={
                row.original.status === "ACTIVE"
                  ? "default"
                  : row.original.status === "INACTIVE"
                    ? "secondary"
                    : "outline"
              }
              className={
                row.original.status === "ACTIVE"
                  ? "bg-green-500 hover:bg-green-600"
                  : row.original.status === "INACTIVE"
                    ? "bg-gray-500 hover:bg-gray-600"
                    : "border-amber-500 text-amber-500 hover:bg-amber-50"
              }
            >
              {row.original.status === "ACTIVE"
                ? "Actif"
                : row.original.status === "INACTIVE"
                  ? "Inactif"
                  : "En attente"}
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
        accessorKey: "doctorsCount",
        header: ({ column }) => (
          <div
            className="items-center cursor-pointer justify-end hidden lg:flex"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Médecins
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right hidden lg:block">
            {row.original.doctors?.length || 0}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
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
            {format(new Date(row.original.createdAt), "dd/MM/yyyy")}
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
                row.original.subscription?.plan === "PREMIUM"
                  ? "border-purple-500 text-purple-500 inline"
                  : row.original.subscription?.plan === "STANDARD"
                    ? "border-blue-500 text-blue-500 inline"
                    : row.original.subscription?.plan === "FREE"
                      ? "border-green-500 text-green-500 inline"
                      : "border-gray-500 text-gray-500 inline"
              }
              style={{ justifyContent: "left" }}
            >
              {row.original.subscription?.plan || "FREE"}
            </Badge>
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const hospital = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openHospitalDetail(hospital)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openHospitalEdit(hospital)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {hospital.status === "ACTIVE" ? (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(hospital.id, "INACTIVE")}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Désactiver
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(hospital.id, "ACTIVE")}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Activer
                  </DropdownMenuItem>
                )}
                {!hospital.isVerified && (
                  <DropdownMenuItem
                    onClick={() => handleVerificationChange(hospital.id, true)}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Vérifier
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => openDeleteDialog(hospital)}
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
      openHospitalDetail,
      openHospitalEdit,
      openDeleteDialog,
      handleStatusChange,
      handleVerificationChange,
    ]
  );

  return columns;
}
