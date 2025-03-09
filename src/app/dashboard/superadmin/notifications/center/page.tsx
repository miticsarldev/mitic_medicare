"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  Clock,
  MoreHorizontal,
  Search,
  Settings,
  Trash2,
  Users,
  ShieldAlert,
  Server,
  FileWarning,
  CheckCircle2,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

// Types for notifications
type NotificationPriority = "low" | "medium" | "high" | "critical";
type NotificationType =
  | "system"
  | "user"
  | "security"
  | "maintenance"
  | "error"
  | "success"
  | "info";
type NotificationStatus = "read" | "unread";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  priority: NotificationPriority;
  type: NotificationType;
  status: NotificationStatus;
  sender?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  actions?: {
    label: string;
    url: string;
  }[];
}

// Sample notifications data
const notifications: Notification[] = [
  {
    id: "1",
    title: "Nouvelle mise à jour système disponible",
    message:
      "La version 2.5.0 est disponible. Cette mise à jour inclut des correctifs de sécurité importants et de nouvelles fonctionnalités.",
    timestamp: "2024-03-15T09:30:00",
    priority: "high",
    type: "system",
    status: "unread",
    actions: [
      { label: "Voir les détails", url: "/updates" },
      { label: "Installer maintenant", url: "/updates/install" },
    ],
  },
  {
    id: "2",
    title: "Alerte de sécurité",
    message:
      "Tentatives de connexion multiples détectées depuis une adresse IP inconnue (192.168.1.45).",
    timestamp: "2024-03-15T08:15:00",
    priority: "critical",
    type: "security",
    status: "unread",
    actions: [
      { label: "Voir les détails", url: "/security/alerts" },
      { label: "Bloquer l'IP", url: "/security/block" },
    ],
  },
  {
    id: "3",
    title: "Nouvel utilisateur inscrit",
    message:
      "Dr. Thomas Martin s'est inscrit sur la plateforme. Veuillez vérifier et approuver son compte.",
    timestamp: "2024-03-14T16:45:00",
    priority: "medium",
    type: "user",
    status: "read",
    sender: {
      name: "Dr. Thomas Martin",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Médecin",
    },
    actions: [
      { label: "Voir le profil", url: "/users/profile" },
      { label: "Approuver", url: "/users/approve" },
    ],
  },
  {
    id: "4",
    title: "Maintenance planifiée",
    message:
      "Une maintenance du système est planifiée pour le 20 mars 2024 de 02:00 à 04:00. Le système pourrait être indisponible pendant cette période.",
    timestamp: "2024-03-14T14:30:00",
    priority: "medium",
    type: "maintenance",
    status: "read",
    actions: [{ label: "Voir les détails", url: "/maintenance" }],
  },
  {
    id: "5",
    title: "Erreur de base de données",
    message:
      "Une erreur de connexion à la base de données a été détectée. L'équipe technique a été notifiée.",
    timestamp: "2024-03-14T10:15:00",
    priority: "high",
    type: "error",
    status: "read",
    actions: [{ label: "Voir les logs", url: "/logs" }],
  },
  {
    id: "6",
    title: "Rapport hebdomadaire disponible",
    message:
      "Le rapport d'activité hebdomadaire est maintenant disponible. 15% d'augmentation des inscriptions cette semaine.",
    timestamp: "2024-03-13T09:00:00",
    priority: "low",
    type: "info",
    status: "read",
    actions: [{ label: "Voir le rapport", url: "/reports/weekly" }],
  },
  {
    id: "7",
    title: "Mise à jour des conditions d'utilisation",
    message:
      "Les conditions d'utilisation ont été mises à jour. Veuillez les examiner avant le 30 mars 2024.",
    timestamp: "2024-03-12T15:20:00",
    priority: "medium",
    type: "system",
    status: "read",
    actions: [{ label: "Voir les modifications", url: "/terms" }],
  },
  {
    id: "8",
    title: "Sauvegarde système réussie",
    message:
      "La sauvegarde quotidienne du système a été effectuée avec succès.",
    timestamp: "2024-03-12T03:00:00",
    priority: "low",
    type: "success",
    status: "read",
  },
  {
    id: "9",
    title: "Nouveau ticket de support",
    message:
      "Un nouveau ticket de support a été créé par Sophie Dupont concernant un problème de connexion.",
    timestamp: "2024-03-11T11:45:00",
    priority: "medium",
    type: "user",
    status: "read",
    sender: {
      name: "Sophie Dupont",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Utilisateur",
    },
    actions: [{ label: "Voir le ticket", url: "/support/tickets" }],
  },
  {
    id: "10",
    title: "Pic de trafic détecté",
    message:
      "Un pic de trafic inhabituel a été détecté sur le serveur principal. Les performances pourraient être affectées.",
    timestamp: "2024-03-10T20:30:00",
    priority: "high",
    type: "system",
    status: "read",
    actions: [{ label: "Voir les métriques", url: "/metrics" }],
  },
];

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 24) {
    return diffInHours === 0
      ? "Aujourd'hui"
      : `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
  } else if (diffInHours < 48) {
    return "Hier";
  } else {
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  }
};

// Helper function to get icon based on notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "system":
      return <Server className="h-5 w-5 text-blue-500" />;
    case "user":
      return <Users className="h-5 w-5 text-green-500" />;
    case "security":
      return <ShieldAlert className="h-5 w-5 text-red-500" />;
    case "maintenance":
      return <Settings className="h-5 w-5 text-orange-500" />;
    case "error":
      return <FileWarning className="h-5 w-5 text-red-500" />;
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

// Helper function to get badge based on notification priority
const getPriorityBadge = (priority: NotificationPriority) => {
  switch (priority) {
    case "critical":
      return <Badge className="bg-red-500">Critique</Badge>;
    case "high":
      return <Badge className="bg-orange-500">Haute</Badge>;
    case "medium":
      return <Badge className="bg-yellow-500">Moyenne</Badge>;
    case "low":
      return <Badge className="bg-green-500">Basse</Badge>;
    default:
      return <Badge variant="outline">Inconnue</Badge>;
  }
};

export default function NotificationCenterPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );
  const [notificationsList, setNotificationsList] =
    useState<Notification[]>(notifications);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<
    string | null
  >(null);

  // Filter notifications based on search, priority, type, and status
  const filteredNotifications = notificationsList.filter((notification) => {
    // Filter by tab
    if (activeTab === "unread" && notification.status !== "unread")
      return false;
    if (activeTab === "read" && notification.status !== "read") return false;

    // Filter by search query
    if (
      searchQuery &&
      !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by priority
    if (selectedPriority && notification.priority !== selectedPriority)
      return false;

    // Filter by type
    if (selectedType && notification.type !== selectedType) return false;

    // Filter by status
    if (selectedStatus && notification.status !== selectedStatus) return false;

    return true;
  });

  // Count unread notifications
  const unreadCount = notificationsList.filter(
    (notification) => notification.status === "unread"
  ).length;

  // Handle mark as read
  const handleMarkAsRead = (id: string) => {
    setNotificationsList((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, status: "read" }
          : notification
      )
    );

    toast({
      title: "Notification marquée comme lue",
      description: "La notification a été marquée comme lue avec succès.",
    });
  };

  // Handle mark as unread
  const handleMarkAsUnread = (id: string) => {
    setNotificationsList((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, status: "unread" }
          : notification
      )
    );

    toast({
      title: "Notification marquée comme non lue",
      description: "La notification a été marquée comme non lue avec succès.",
    });
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    setNotificationsList((prevNotifications) =>
      prevNotifications.map((notification) => ({
        ...notification,
        status: "read",
      }))
    );

    toast({
      title: "Toutes les notifications marquées comme lues",
      description:
        "Toutes les notifications ont été marquées comme lues avec succès.",
    });
  };

  // Handle delete notification
  const handleDeleteNotification = (id: string) => {
    setNotificationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete notification
  const confirmDeleteNotification = () => {
    if (notificationToDelete) {
      setNotificationsList((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.id !== notificationToDelete
        )
      );

      toast({
        title: "Notification supprimée",
        description: "La notification a été supprimée avec succès.",
      });

      setNotificationToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle delete selected notifications
  const handleDeleteSelected = () => {
    if (selectedNotifications.length > 0) {
      setNotificationsList((prevNotifications) =>
        prevNotifications.filter(
          (notification) => !selectedNotifications.includes(notification.id)
        )
      );

      toast({
        title: "Notifications supprimées",
        description: `${selectedNotifications.length} notification(s) ont été supprimées avec succès.`,
      });

      setSelectedNotifications([]);
    }
  };

  // Handle select all notifications
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(
        filteredNotifications.map((notification) => notification.id)
      );
    } else {
      setSelectedNotifications([]);
    }
  };

  // Handle select notification
  const handleSelectNotification = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications((prev) => [...prev, id]);
    } else {
      setSelectedNotifications((prev) =>
        prev.filter((notificationId) => notificationId !== id)
      );
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedPriority(null);
    setSelectedType(null);
    setSelectedStatus(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Centre de Notifications
          </h2>
          <p className="text-muted-foreground">
            Gérez et consultez toutes les notifications du système
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog
            open={isSettingsDialogOpen}
            onOpenChange={setIsSettingsDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Préférences
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Préférences de notifications</DialogTitle>
                <DialogDescription>
                  Configurez vos préférences pour les notifications du système.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">
                    Canaux de notification
                  </h4>
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="email-notifications"
                      className="flex flex-col space-y-1"
                    >
                      <span>Notifications par email</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Recevoir les notifications par email
                      </span>
                    </Label>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="browser-notifications"
                      className="flex flex-col space-y-1"
                    >
                      <span>Notifications navigateur</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Afficher les notifications dans le navigateur
                      </span>
                    </Label>
                    <Switch id="browser-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="sms-notifications"
                      className="flex flex-col space-y-1"
                    >
                      <span>Notifications par SMS</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Recevoir les notifications par SMS
                      </span>
                    </Label>
                    <Switch id="sms-notifications" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Types de notification</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="system-notifications" defaultChecked />
                      <Label htmlFor="system-notifications">Système</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="security-notifications" defaultChecked />
                      <Label htmlFor="security-notifications">Sécurité</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="user-notifications" defaultChecked />
                      <Label htmlFor="user-notifications">Utilisateurs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="maintenance-notifications" defaultChecked />
                      <Label htmlFor="maintenance-notifications">
                        Maintenance
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="error-notifications" defaultChecked />
                      <Label htmlFor="error-notifications">Erreurs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="info-notifications" defaultChecked />
                      <Label htmlFor="info-notifications">Informations</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Priorités</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="critical-priority" defaultChecked />
                      <Label htmlFor="critical-priority">Critique</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="high-priority" defaultChecked />
                      <Label htmlFor="high-priority">Haute</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="medium-priority" defaultChecked />
                      <Label htmlFor="medium-priority">Moyenne</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="low-priority" defaultChecked />
                      <Label htmlFor="low-priority">Basse</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsSettingsDialogOpen(false)}>
                  Enregistrer les préférences
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Tout marquer comme lu
            </Button>
          )}

          {selectedNotifications.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer ({selectedNotifications.length})
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Rechercher..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  value={selectedPriority || "all"}
                  onValueChange={(value) => setSelectedPriority(value || null)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Toutes les priorités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les priorités</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="low">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={selectedType || "all"}
                  onValueChange={(value) => setSelectedType(value || null)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="security">Sécurité</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="error">Erreur</SelectItem>
                    <SelectItem value="success">Succès</SelectItem>
                    <SelectItem value="info">Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={selectedStatus || "all"}
                  onValueChange={(value) => setSelectedStatus(value || null)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="read">Lu</SelectItem>
                    <SelectItem value="unread">Non lu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={resetFilters}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total des notifications</span>
                <span className="font-medium">{notificationsList.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Non lues</span>
                <Badge variant="secondary">{unreadCount}</Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Par priorité</span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                      Critique
                    </span>
                    <span>
                      {
                        notificationsList.filter(
                          (n) => n.priority === "critical"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-orange-500" />
                      Haute
                    </span>
                    <span>
                      {
                        notificationsList.filter((n) => n.priority === "high")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-yellow-500" />
                      Moyenne
                    </span>
                    <span>
                      {
                        notificationsList.filter((n) => n.priority === "medium")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                      Basse
                    </span>
                    <span>
                      {
                        notificationsList.filter((n) => n.priority === "low")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-9 space-y-4">
          <Card>
            <CardHeader className="p-4 pb-0">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="all" className="text-sm">
                      Toutes
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="text-sm">
                      Non lues
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {unreadCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="read" className="text-sm">
                      Lues
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center">
                    <Checkbox
                      id="select-all"
                      checked={
                        selectedNotifications.length ===
                          filteredNotifications.length &&
                        filteredNotifications.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      className="mr-2"
                    />
                    <Label htmlFor="select-all" className="text-sm">
                      Tout sélectionner
                    </Label>
                  </div>
                </div>

                <TabsContent value="all" className="mt-4 space-y-4">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        isSelected={selectedNotifications.includes(
                          notification.id
                        )}
                        onSelect={(checked) =>
                          handleSelectNotification(notification.id, checked)
                        }
                        onMarkAsRead={() => handleMarkAsRead(notification.id)}
                        onMarkAsUnread={() =>
                          handleMarkAsUnread(notification.id)
                        }
                        onDelete={() =>
                          handleDeleteNotification(notification.id)
                        }
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">
                        Aucune notification
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vous n&apos;avez aucune notification correspondant à vos
                        filtres.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="unread" className="mt-4 space-y-4">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        isSelected={selectedNotifications.includes(
                          notification.id
                        )}
                        onSelect={(checked) =>
                          handleSelectNotification(notification.id, checked)
                        }
                        onMarkAsRead={() => handleMarkAsRead(notification.id)}
                        onMarkAsUnread={() =>
                          handleMarkAsUnread(notification.id)
                        }
                        onDelete={() =>
                          handleDeleteNotification(notification.id)
                        }
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">
                        Aucune notification non lue
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vous avez lu toutes vos notifications.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="read" className="mt-4 space-y-4">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        isSelected={selectedNotifications.includes(
                          notification.id
                        )}
                        onSelect={(checked) =>
                          handleSelectNotification(notification.id, checked)
                        }
                        onMarkAsRead={() => handleMarkAsRead(notification.id)}
                        onMarkAsUnread={() =>
                          handleMarkAsUnread(notification.id)
                        }
                        onDelete={() =>
                          handleDeleteNotification(notification.id)
                        }
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">
                        Aucune notification lue
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vous n&apos;avez pas encore lu de notifications.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {/* Pagination would go here */}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer cette notification ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La notification sera définitivement
              supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNotification}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Notification Item Component
interface NotificationItemProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onMarkAsRead: () => void;
  onMarkAsUnread: () => void;
  onDelete: () => void;
}

function NotificationItem({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}: NotificationItemProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        notification.status === "unread" ? "bg-muted/30" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="mt-1"
        />

        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-base">{notification.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
            </div>
            {getPriorityBadge(notification.priority)}
          </div>

          {notification.sender && (
            <div className="flex items-center mt-3">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage
                  src={notification.sender.avatar}
                  alt={notification.sender.name}
                />
                <AvatarFallback>
                  {notification.sender.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{notification.sender.name}</span>
              {notification.sender.role && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {notification.sender.role}
                </Badge>
              )}
            </div>
          )}

          {notification.actions && notification.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {notification.actions.map((action, index) => (
                <Button key={index} variant="outline" size="sm" asChild>
                  <a href={action.url}>{action.label}</a>
                </Button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              <span>{formatDate(notification.timestamp)}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {notification.status === "unread" ? (
                  <DropdownMenuItem onClick={onMarkAsRead}>
                    <Check className="mr-2 h-4 w-4" />
                    Marquer comme lu
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={onMarkAsUnread}>
                    <Bell className="mr-2 h-4 w-4" />
                    Marquer comme non lu
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
