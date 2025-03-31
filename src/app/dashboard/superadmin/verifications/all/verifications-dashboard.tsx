"use client";

import { useState } from "react";
import {
  Check,
  X,
  Search,
  Filter,
  Building2,
  UserRound,
  Clock,
  ChevronDown,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { type PendingApprovalUser } from "./types";
import { approveUser, rejectUser } from "./actions";

export function VerificationDashboard({
  initialApprovals,
}: {
  initialApprovals: PendingApprovalUser[];
}) {
  const { toast } = useToast();
  const [approvals, setApprovals] =
    useState<PendingApprovalUser[]>(initialApprovals);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<PendingApprovalUser | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Filter approvals based on search and role filter
  const filteredApprovals = approvals.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === null || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const hospitalAdmins = filteredApprovals.filter(
    (user) => user.role === "HOSPITAL_ADMIN"
  );
  const independentDoctors = filteredApprovals.filter(
    (user) => user.role === "INDEPENDENT_DOCTOR"
  );

  const handleViewDetails = (user: PendingApprovalUser) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleConfirmAction = (
    user: PendingApprovalUser,
    action: "approve" | "reject"
  ) => {
    setSelectedUser(user);
    setActionType(action);
    setIsConfirmDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;

    setIsLoading(true);

    try {
      if (actionType === "approve") {
        await approveUser(selectedUser.id);
        toast({
          title: "Utilisateur approuvé",
          description: `${selectedUser.name} a été approuvé avec succès.`,
        });
      } else {
        await rejectUser(selectedUser.id);
        toast({
          title: "Utilisateur rejeté",
          description: `${selectedUser.name} a été rejeté.`,
          variant: "destructive",
        });
      }

      // Update local state
      setApprovals(approvals.filter((user) => user.id !== selectedUser.id));
      setIsConfirmDialogOpen(false);
      setIsDetailsOpen(false);
    } catch (error) {
      console.error("Error performing action:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "HOSPITAL_ADMIN":
        return "Administrateur d'hôpital";
      case "INDEPENDENT_DOCTOR":
        return "Médecin indépendant";
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer par rôle
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedRole(null)}>
              Tous les rôles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedRole("HOSPITAL_ADMIN")}>
              Administrateurs d&apos;hôpitaux
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSelectedRole("INDEPENDENT_DOCTOR")}
            >
              Médecins indépendants
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredApprovals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-primary/10 p-3">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium">
              Aucune demande en attente
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Toutes les demandes d&apos;approbation ont été traitées.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              Tous ({filteredApprovals.length})
            </TabsTrigger>
            <TabsTrigger value="hospital">
              Administrateurs d&apos;hôpitaux ({hospitalAdmins.length})
            </TabsTrigger>
            <TabsTrigger value="doctor">
              Médecins indépendants ({independentDoctors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderUserList(filteredApprovals)}
          </TabsContent>

          <TabsContent value="hospital" className="space-y-4">
            {renderUserList(hospitalAdmins)}
          </TabsContent>

          <TabsContent value="doctor" className="space-y-4">
            {renderUserList(independentDoctors)}
          </TabsContent>
        </Tabs>
      )}

      {/* User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>Détails de la demande</DialogTitle>
                <DialogDescription>
                  Informations détaillées sur la demande d&apos;approbation
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 flex flex-col items-center md:flex-row md:items-start">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="mt-4 flex-1 md:ml-6 md:mt-0">
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="mr-2">
                      {getRoleLabel(selectedUser.role)}
                    </Badge>
                    <Badge variant="secondary">
                      Inscrit{" "}
                      {formatDistanceToNow(new Date(selectedUser.createdAt), {
                        locale: fr,
                        addSuffix: true,
                      })}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium">
                    Informations personnelles
                  </h4>
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Téléphone
                      </span>
                      <span className="font-medium">{selectedUser.phone}</span>
                    </div>
                    {selectedUser.profile && (
                      <>
                        {selectedUser.profile.address && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Adresse
                            </span>
                            <span className="font-medium">
                              {selectedUser.profile.address}
                            </span>
                          </div>
                        )}
                        {selectedUser.profile.city && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Ville
                            </span>
                            <span className="font-medium">
                              {selectedUser.profile.city}
                            </span>
                          </div>
                        )}
                        {selectedUser.profile.country && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Pays
                            </span>
                            <span className="font-medium">
                              {selectedUser.profile.country}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">
                    Informations professionnelles
                  </h4>
                  <div className="space-y-2 rounded-lg border p-3">
                    {selectedUser.role === "INDEPENDENT_DOCTOR" &&
                      selectedUser.doctor && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Spécialisation
                            </span>
                            <span className="font-medium">
                              {selectedUser.doctor.specialization}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Numéro de licence
                            </span>
                            <span className="font-medium">
                              {selectedUser.doctor.licenseNumber}
                            </span>
                          </div>
                          {selectedUser.doctor.experience && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Expérience
                              </span>
                              <span className="font-medium">
                                {selectedUser.doctor.experience}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                    {selectedUser.role === "HOSPITAL_ADMIN" &&
                      selectedUser.hospital && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Nom de l&apos;hôpital
                            </span>
                            <span className="font-medium">
                              {selectedUser.hospital.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Adresse
                            </span>
                            <span className="font-medium">
                              {selectedUser.hospital.address}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Ville
                            </span>
                            <span className="font-medium">
                              {selectedUser.hospital.city}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Téléphone
                            </span>
                            <span className="font-medium">
                              {selectedUser.hospital.phone}
                            </span>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6 flex gap-2 sm:justify-between">
                <Button
                  variant="destructive"
                  onClick={() => handleConfirmAction(selectedUser, "reject")}
                >
                  <X className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
                <Button
                  onClick={() => handleConfirmAction(selectedUser, "approve")}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approuver
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Confirmer l'approbation"
                : "Confirmer le rejet"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Êtes-vous sûr de vouloir approuver cet utilisateur ? Il aura accès à la plateforme."
                : "Êtes-vous sûr de vouloir rejeter cet utilisateur ? Cette action ne peut pas être annulée."}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="mt-2 flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {getInitials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.email}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </span>
              ) : actionType === "approve" ? (
                "Approuver"
              ) : (
                "Rejeter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  function renderUserList(users: PendingApprovalUser[]) {
    return users.map((user) => (
      <Card key={user.id} className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="flex flex-1 items-center gap-2 p-2">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  {user.role === "HOSPITAL_ADMIN" ? (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Building2 className="h-3 w-3" />
                      Admin Hôpital
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <UserRound className="h-3 w-3" />
                      Médecin Indépendant
                    </Badge>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Inscrit{" "}
                    {formatDistanceToNow(new Date(user.createdAt), {
                      locale: fr,
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div className="text-xs font-medium">
                  <Separator orientation="horizontal" className="h-1 my-1" />
                  Hopital (Clinique) :{" "}
                  {user.hospital ? user.hospital.name : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t bg-muted/30 p-4 md:border-l md:border-t-0">
              <Button
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={() => handleViewDetails(user)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Détails
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleConfirmAction(user, "approve")}
                  >
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    Approuver
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleConfirmAction(user, "reject")}
                  >
                    <X className="mr-2 h-4 w-4 text-red-600" />
                    Rejeter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  }
}
