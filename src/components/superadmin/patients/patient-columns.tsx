"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  ArrowUpDown,
  MoreHorizontal,
  User,
  UserCog,
  UserX,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
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
import { Patient } from "@/types/patient";

interface UsePatientColumnsProps {
  openPatientDetail: (patient: Patient) => void;
  openPatientEdit: (patient: Patient) => void;
  openDeleteDialog: (patient: Patient) => void;
}

export function usePatientColumns({
  openPatientDetail,
  openPatientEdit,
  openDeleteDialog,
}: UsePatientColumnsProps) {
  const columns = useMemo<ColumnDef<Patient>[]>(
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
        accessorKey: "name",
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Patient
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => {
          const patient = row.original;

          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={patient.user.profile?.avatarUrl}
                  alt={patient.user.name}
                />
                <AvatarFallback>{patient.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{patient.user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {patient.user.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => (
          <div>
            {row.original.user.isActive ? (
              <Badge className="bg-green-500 hover:bg-green-600">Actif</Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-amber-500 border-amber-500"
              >
                Inactif
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "registrationDate",
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Inscription
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) =>
          format(new Date(row.original.user.createdAt), "dd/MM/yyyy"),
      },
      {
        accessorKey: "lastLogin",
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Dernière mise à jour
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) =>
          format(new Date(row.original.user.updatedAt), "dd/MM/yyyy HH:mm"),
      },
      {
        accessorKey: "appointmentsCount",
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            RDV
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => row.original.appointmentsCount,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const patient = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openPatientDetail(patient)}>
                  <User className="mr-2 h-4 w-4" />
                  Voir les détails
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openPatientEdit(patient)}>
                  <UserCog className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openDeleteDialog(patient)}
                  className="text-destructive"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [openPatientDetail, openPatientEdit, openDeleteDialog]
  );

  return columns;
}
