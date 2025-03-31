"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Building,
  User,
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
import type { Subscription } from "@/types/subscription";

interface UseSubscriptionColumnsProps {
  openSubscriptionDetail: (subscription: Subscription) => void;
  openSubscriptionEdit: (subscription: Subscription) => void;
  openDeleteDialog: (subscription: Subscription) => void;
}

export function useSubscriptionColumns({
  openSubscriptionDetail,
  openSubscriptionEdit,
  openDeleteDialog,
}: UseSubscriptionColumnsProps) {
  const columns = useMemo<ColumnDef<Subscription>[]>(
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
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.id.substring(0, 8)}...
          </div>
        ),
      },
      {
        accessorKey: "subscriberName",
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Abonné
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => {
          const subscription = row.original;
          const isDoctor = subscription.subscriberType === "DOCTOR";
          const name = isDoctor
            ? subscription.doctor?.user?.name || "N/A"
            : subscription.hospital?.name || "N/A";
          const email = isDoctor
            ? subscription.doctor?.user?.email || "N/A"
            : subscription.hospital?.email || "N/A";
          const avatarUrl = isDoctor
            ? subscription.doctor?.user?.profile?.avatarUrl
            : subscription.hospital?.logoUrl;

          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl || ""} alt={name} />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
                <div className="mt-1">
                  {isDoctor ? (
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                    >
                      <User className="mr-1 h-3 w-3" /> Médecin
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-purple-100 text-purple-800 hover:bg-purple-100"
                    >
                      <Building className="mr-1 h-3 w-3" /> Hôpital
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "plan",
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Plan
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => {
          const plan = row.original.plan;
          let badgeClass = "";

          switch (plan) {
            case "FREE":
              badgeClass = "bg-gray-100 text-gray-800";
              break;
            case "BASIC":
              badgeClass = "bg-blue-100 text-blue-800";
              break;
            case "STANDARD":
              badgeClass = "bg-green-100 text-green-800";
              break;
            case "PREMIUM":
              badgeClass = "bg-purple-100 text-purple-800";
              break;
            case "ENTERPRISE":
              badgeClass = "bg-amber-100 text-amber-800";
              break;
            default:
              badgeClass = "bg-gray-100 text-gray-800";
          }

          return (
            <Badge variant="outline" className={badgeClass}>
              {plan}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Statut
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          let badgeVariant:
            | "default"
            | "outline"
            | "secondary"
            | "destructive" = "default";

          switch (status) {
            case "ACTIVE":
              badgeVariant = "default";
              return <Badge className="bg-green-500">Actif</Badge>;
            case "INACTIVE":
              badgeVariant = "secondary";
              return <Badge variant="secondary">Inactif</Badge>;
            case "TRIAL":
              badgeVariant = "outline";
              return (
                <Badge
                  variant="outline"
                  className="border-blue-500 text-blue-500"
                >
                  Essai
                </Badge>
              );
            case "EXPIRED":
              badgeVariant = "destructive";
              return <Badge variant="destructive">Expiré</Badge>;
            default:
              return <Badge variant={badgeVariant}>{status}</Badge>;
          }
        },
      },
      {
        accessorKey: "startDate",
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Début
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => {
          return format(new Date(row.original.startDate), "dd/MM/yyyy", {
            locale: fr,
          });
        },
      },
      {
        accessorKey: "endDate",
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fin
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => {
          return format(new Date(row.original.endDate), "dd/MM/yyyy", {
            locale: fr,
          });
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Montant
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => {
          const amount = Number.parseFloat(row.original.amount.toString());
          const formatted = new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: row.original.currency || "XOF",
          }).format(amount);

          return <div className="font-medium">{formatted}</div>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const subscription = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => openSubscriptionDetail(subscription)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openSubscriptionEdit(subscription)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openDeleteDialog(subscription)}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [openSubscriptionDetail, openSubscriptionEdit, openDeleteDialog]
  );

  return columns;
}
