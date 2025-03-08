"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types pour les notifications
type NotificationType =
  | "appointment"
  | "message"
  | "reminder"
  | "system"
  | "result";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  avatar?: {
    src?: string;
    fallback: string;
  };
  link?: string;
}

// Exemples de notifications
const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "appointment",
    title: "Rappel de rendez-vous",
    description: "Rendez-vous avec Dr. Martin demain à 14h30",
    time: "Il y a 10 minutes",
    read: false,
    avatar: {
      src: "/placeholder.svg?height=40&width=40",
      fallback: "DM",
    },
    link: "/dashboard/patient/appointments",
  },
  {
    id: "2",
    type: "message",
    title: "Nouveau message",
    description: "Dr. Dubois a répondu à votre question",
    time: "Il y a 30 minutes",
    read: false,
    avatar: {
      src: "/placeholder.svg?height=40&width=40",
      fallback: "DD",
    },
    link: "/dashboard/patient/messages",
  },
  {
    id: "3",
    type: "result",
    title: "Résultats disponibles",
    description: "Vos résultats d'analyse sont disponibles",
    time: "Il y a 2 heures",
    read: true,
    avatar: {
      fallback: "RA",
    },
    link: "/dashboard/patient/medical-records",
  },
  {
    id: "4",
    type: "reminder",
    title: "Rappel de médicament",
    description: "N'oubliez pas de prendre votre médicament",
    time: "Il y a 5 heures",
    read: true,
    avatar: {
      fallback: "RM",
    },
  },
  {
    id: "5",
    type: "system",
    title: "Mise à jour du système",
    description: "Nouvelles fonctionnalités disponibles",
    time: "Hier",
    read: true,
    avatar: {
      fallback: "SY",
    },
  },
];

export function NotificationBell() {
  const [notifications, setNotifications] =
    React.useState<Notification[]>(sampleNotifications);
  const [open, setOpen] = React.useState(false);

  // Nombre de notifications non lues
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  // Marquer une notification comme lue
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Supprimer une notification
  //   const removeNotification = (id: string) => {
  //     setNotifications(
  //       notifications.filter((notification) => notification.id !== id)
  //     );
  //   };

  // Obtenir la couleur de l'avatar en fonction du type de notification
  const getAvatarColor = (type: NotificationType): string => {
    switch (type) {
      case "appointment":
        return "bg-blue-500";
      case "message":
        return "bg-green-500";
      case "reminder":
        return "bg-amber-500";
      case "result":
        return "bg-purple-500";
      case "system":
        return "bg-gray-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge
                  variant="destructive"
                  className="h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              </motion.div>
            </AnimatePresence>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">Notifications</h3>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0
                  ? `Vous avez ${unreadCount} notification${
                      unreadCount > 1 ? "s" : ""
                    } non lue${unreadCount > 1 ? "s" : ""}`
                  : "Vous n'avez pas de nouvelles notifications"}
              </p>
            </div>
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto text-xs px-2 py-1"
              onClick={markAllAsRead}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-4 focus:bg-muted",
                  !notification.read && "bg-muted/50"
                )}
                onClick={() => {
                  markAsRead(notification.id);
                  setOpen(false);
                }}
              >
                <div className="flex w-full">
                  <Avatar
                    className={cn("h-9 w-9", getAvatarColor(notification.type))}
                  >
                    <AvatarImage src={notification.avatar?.src} alt="" />
                    <AvatarFallback className="text-white">
                      {notification.avatar?.fallback}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium">Pas de notifications</p>
              <p className="text-xs text-muted-foreground">
                Vous n&apos;avez aucune notification pour le moment
              </p>
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Voir toutes les notifications
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
