"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Edit,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Save,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types for roles and permissions
interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  actions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  isDefault: boolean;
  permissions: string[];
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  lastLogin?: Date;
}

// Sample data for permissions
const modules = [
  "users",
  "doctors",
  "patients",
  "hospitals",
  "appointments",
  "prescriptions",
  "medical_records",
  "billing",
  "reports",
  "settings",
  "content",
  "notifications",
];

const generateSamplePermissions = (): Permission[] => {
  const permissions: Permission[] = [];

  modules.forEach((module) => {
    const actions = ["view", "create", "update", "delete"];

    actions.forEach((action) => {
      permissions.push({
        id: `${module}_${action}`,
        name: `${action}_${module}`,
        description: `Can ${action} ${module}`,
        module,
        actions: [action],
      });
    });

    // Add special permissions for some modules
    if (module === "users") {
      permissions.push({
        id: "users_manage_roles",
        name: "manage_roles",
        description: "Can manage user roles",
        module,
        actions: ["assign", "revoke"],
      });
    }

    if (module === "settings") {
      permissions.push({
        id: "settings_system",
        name: "system_settings",
        description: "Can modify system settings",
        module,
        actions: ["view", "update"],
      });
    }

    if (module === "reports") {
      permissions.push({
        id: "reports_export",
        name: "export_reports",
        description: "Can export reports",
        module,
        actions: ["export"],
      });
    }
  });

  return permissions;
};

const permissions = generateSamplePermissions();

// Sample data for roles
const roles: Role[] = [
  {
    id: "role_superadmin",
    name: "Super Admin",
    description: "Full access to all system features and settings",
    isSystem: true,
    isDefault: false,
    permissions: permissions.map((p) => p.id),
    userCount: 3,
    createdAt: new Date(2023, 0, 1),
    updatedAt: new Date(2023, 0, 1),
  },
  {
    id: "role_admin",
    name: "Admin",
    description: "Administrative access with some restrictions",
    isSystem: true,
    isDefault: false,
    permissions: permissions
      .filter((p) => p.module !== "settings" || !p.name.includes("system"))
      .map((p) => p.id),
    userCount: 8,
    createdAt: new Date(2023, 0, 1),
    updatedAt: new Date(2023, 0, 1),
  },
  {
    id: "role_manager",
    name: "Manager",
    description:
      "Can manage users and content but cannot modify system settings",
    isSystem: false,
    isDefault: false,
    permissions: permissions
      .filter(
        (p) =>
          (p.module === "users" && p.actions.includes("view")) ||
          p.module === "content" ||
          p.module === "reports" ||
          (p.module === "doctors" && p.actions.includes("view")) ||
          (p.module === "patients" && p.actions.includes("view")) ||
          (p.module === "hospitals" && p.actions.includes("view"))
      )
      .map((p) => p.id),
    userCount: 15,
    createdAt: new Date(2023, 2, 15),
    updatedAt: new Date(2023, 5, 10),
  },
  {
    id: "role_doctor_admin",
    name: "Doctor Admin",
    description: "Administrative access for doctor-related features",
    isSystem: false,
    isDefault: false,
    permissions: permissions
      .filter(
        (p) =>
          p.module === "doctors" ||
          p.module === "appointments" ||
          p.module === "prescriptions" ||
          p.module === "medical_records" ||
          (p.module === "patients" && p.actions.includes("view")) ||
          (p.module === "reports" && p.actions.includes("view"))
      )
      .map((p) => p.id),
    userCount: 12,
    createdAt: new Date(2023, 3, 5),
    updatedAt: new Date(2023, 6, 20),
  },
  {
    id: "role_hospital_admin",
    name: "Hospital Admin",
    description: "Administrative access for hospital-related features",
    isSystem: false,
    isDefault: false,
    permissions: permissions
      .filter(
        (p) =>
          p.module === "hospitals" ||
          (p.module === "doctors" &&
            (p.actions.includes("view") || p.actions.includes("update"))) ||
          (p.module === "patients" && p.actions.includes("view")) ||
          (p.module === "appointments" &&
            (p.actions.includes("view") || p.actions.includes("update"))) ||
          (p.module === "reports" && p.actions.includes("view"))
      )
      .map((p) => p.id),
    userCount: 20,
    createdAt: new Date(2023, 4, 12),
    updatedAt: new Date(2023, 7, 8),
  },
  {
    id: "role_support",
    name: "Support",
    description: "Customer support access",
    isSystem: false,
    isDefault: false,
    permissions: permissions
      .filter(
        (p) =>
          (p.module === "users" && p.actions.includes("view")) ||
          (p.module === "doctors" && p.actions.includes("view")) ||
          (p.module === "patients" && p.actions.includes("view")) ||
          (p.module === "hospitals" && p.actions.includes("view")) ||
          (p.module === "appointments" && p.actions.includes("view")) ||
          (p.module === "notifications" &&
            (p.actions.includes("view") || p.actions.includes("create")))
      )
      .map((p) => p.id),
    userCount: 10,
    createdAt: new Date(2023, 5, 20),
    updatedAt: new Date(2023, 8, 15),
  },
  {
    id: "role_readonly",
    name: "Read Only",
    description: "View-only access to most system features",
    isSystem: false,
    isDefault: false,
    permissions: permissions
      .filter((p) => p.actions.includes("view"))
      .map((p) => p.id),
    userCount: 5,
    createdAt: new Date(2023, 6, 10),
    updatedAt: new Date(2023, 9, 5),
  },
];

// Sample data for users
const users: AppUser[] = [
  {
    id: "user1",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Super Admin",
    status: "active",
    lastLogin: new Date(2023, 11, 28, 9, 30),
  },
  {
    id: "user2",
    name: "Marie Laurent",
    email: "marie.laurent@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Admin",
    status: "active",
    lastLogin: new Date(2023, 11, 27, 14, 15),
  },
  {
    id: "user3",
    name: "Thomas Bernard",
    email: "thomas.bernard@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Manager",
    status: "active",
    lastLogin: new Date(2023, 11, 26, 11, 45),
  },
  {
    id: "user4",
    name: "Sophie Martin",
    email: "sophie.martin@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Doctor Admin",
    status: "active",
    lastLogin: new Date(2023, 11, 25, 16, 20),
  },
  {
    id: "user5",
    name: "Philippe Dubois",
    email: "philippe.dubois@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Hospital Admin",
    status: "inactive",
    lastLogin: new Date(2023, 11, 20, 10, 10),
  },
  {
    id: "user6",
    name: "Claire Moreau",
    email: "claire.moreau@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Support",
    status: "active",
    lastLogin: new Date(2023, 11, 27, 9, 0),
  },
  {
    id: "user7",
    name: "Antoine Rousseau",
    email: "antoine.rousseau@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Read Only",
    status: "suspended",
    lastLogin: new Date(2023, 11, 15, 13, 30),
  },
];

// Helper function to group permissions by module
const groupPermissionsByModule = (permissions: Permission[]) => {
  const grouped: Record<string, Permission[]> = {};

  permissions.forEach((permission) => {
    if (!grouped[permission.module]) {
      grouped[permission.module] = [];
    }
    grouped[permission.module].push(permission);
  });

  return grouped;
};

export default function RolesPermissionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [editedRole, setEditedRole] = useState<Partial<Role> | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Filter roles based on search
  const filteredRoles = roles.filter((role) => {
    return (
      searchQuery === "" ||
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Handle role selection
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions);
    setEditedRole(null);
    setIsEditingRole(false);
  };

  // Handle role edit
  const handleEditRole = () => {
    if (selectedRole) {
      setEditedRole({
        ...selectedRole,
      });
      setIsEditingRole(true);
    }
  };

  // Handle role create
  const handleCreateRole = () => {
    setEditedRole({
      id: `role_${Date.now()}`,
      name: "",
      description: "",
      isSystem: false,
      isDefault: false,
      permissions: [],
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setSelectedPermissions([]);
    setIsCreatingRole(true);
  };

  // Handle role save
  const handleSaveRole = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditingRole(false);
      setIsCreatingRole(false);

      // In a real app, this would update the role in the database
      console.log("Saving role:", editedRole);
      console.log("With permissions:", selectedPermissions);

      // Reset state
      setEditedRole(null);
    }, 1000);
  };

  // Handle role delete
  const handleDeleteRole = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsConfirmDeleteOpen(false);

      // In a real app, this would delete the role from the database
      console.log("Deleting role:", selectedRole);

      // Reset state
      setSelectedRole(null);
    }, 1000);
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(
        selectedPermissions.filter((id) => id !== permissionId)
      );
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };

  // Handle module permissions toggle
  const handleModulePermissionsToggle = (modulePermissions: Permission[]) => {
    const modulePermissionIds = modulePermissions.map((p) => p.id);
    const allSelected = modulePermissionIds.every((id) =>
      selectedPermissions.includes(id)
    );

    if (allSelected) {
      // Remove all module permissions
      setSelectedPermissions(
        selectedPermissions.filter((id) => !modulePermissionIds.includes(id))
      );
    } else {
      // Add all module permissions
      const newPermissions = [...selectedPermissions];
      modulePermissionIds.forEach((id) => {
        if (!newPermissions.includes(id)) {
          newPermissions.push(id);
        }
      });
      setSelectedPermissions(newPermissions);
    }
  };

  // Handle assign role to user
  const handleAssignRole = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsAssignRoleOpen(false);

      // In a real app, this would update the user's role in the database
      console.log("Assigning role to user:", selectedUser, selectedUserRole);

      // Reset state
      setSelectedUser(null);
      setSelectedUserRole("");
    }, 1000);
  };

  // Group permissions by module
  const groupedPermissions = groupPermissionsByModule(permissions);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Rôles & Permissions
          </h2>
          <p className="text-muted-foreground">
            Gérez les rôles et les permissions des utilisateurs du système
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleCreateRole}>
            <Plus className="mr-2 h-4 w-4" /> Créer un rôle
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rôles</CardTitle>
              <CardDescription>
                {roles.length} rôle{roles.length !== 1 ? "s" : ""} configuré
                {roles.length !== 1 ? "s" : ""}
              </CardDescription>
              <div className="mt-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un rôle..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {filteredRoles.map((role) => (
                    <div
                      key={role.id}
                      className={`flex items-center justify-between rounded-md border p-3 cursor-pointer transition-colors ${
                        selectedRole?.id === role.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleRoleSelect(role)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          {role.isSystem ? (
                            <ShieldCheck className="h-5 w-5 text-primary" />
                          ) : (
                            <Shield className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{role.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {role.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {role.userCount} utilisateur
                          {role.userCount !== 1 ? "s" : ""}
                        </Badge>
                        {role.isSystem && (
                          <Badge variant="secondary" className="mr-2">
                            Système
                          </Badge>
                        )}
                        {role.isDefault && (
                          <Badge className="mr-2">Défaut</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs récents</CardTitle>
              <CardDescription>
                Utilisateurs récemment actifs et leurs rôles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        variant={
                          user.status === "active"
                            ? "outline"
                            : user.status === "inactive"
                            ? "secondary"
                            : "destructive"
                        }
                        className="mr-2"
                      >
                        {user.role}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setSelectedUserRole(user.role);
                              setIsAssignRoleOpen(true);
                            }}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Changer de rôle</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Voir le profil</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Users className="mr-2 h-4 w-4" /> Voir tous les utilisateurs
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="h-full">
            {selectedRole || isCreatingRole ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      {isCreatingRole
                        ? "Créer un nouveau rôle"
                        : isEditingRole
                        ? `Modifier le rôle: ${selectedRole?.name}`
                        : selectedRole?.name}
                    </CardTitle>
                    <CardDescription>
                      {isCreatingRole || isEditingRole
                        ? "Configurez les détails et les permissions du rôle"
                        : selectedRole?.description}
                    </CardDescription>
                  </div>
                  {!isCreatingRole && !isEditingRole && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditRole}
                        disabled={selectedRole?.isSystem}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsConfirmDeleteOpen(true)}
                        disabled={selectedRole?.isSystem}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Supprimer
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {isCreatingRole || isEditingRole ? (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="role-name">Nom du rôle</Label>
                            <Input
                              id="role-name"
                              placeholder="Entrez le nom du rôle"
                              value={editedRole?.name || ""}
                              onChange={(e) =>
                                setEditedRole({
                                  ...editedRole!,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Options</Label>
                            <div className="flex flex-col space-y-2 rounded-md border p-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="is-default"
                                  checked={editedRole?.isDefault || false}
                                  onCheckedChange={(checked) =>
                                    setEditedRole({
                                      ...editedRole!,
                                      isDefault: checked,
                                    })
                                  }
                                  disabled={editedRole?.isSystem}
                                />
                                <Label htmlFor="is-default" className="flex-1">
                                  Rôle par défaut
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Si activé, ce rôle sera attribué par défaut aux
                                nouveaux utilisateurs.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role-description">Description</Label>
                          <Textarea
                            id="role-description"
                            placeholder="Décrivez le rôle et ses responsabilités"
                            value={editedRole?.description || ""}
                            onChange={(e) =>
                              setEditedRole({
                                ...editedRole!,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Permissions</h3>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPermissions([])}
                            >
                              Désélectionner tout
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedPermissions(
                                  permissions.map((p) => p.id)
                                )
                              }
                            >
                              Sélectionner tout
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {Object.entries(groupedPermissions).map(
                            ([module, modulePermissions]) => (
                              <div key={module} className="rounded-md border">
                                <div
                                  className="flex items-center justify-between p-4 cursor-pointer"
                                  onClick={() =>
                                    handleModulePermissionsToggle(
                                      modulePermissions
                                    )
                                  }
                                >
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`module-${module}`}
                                      checked={modulePermissions.every((p) =>
                                        selectedPermissions.includes(p.id)
                                      )}
                                      onCheckedChange={() =>
                                        handleModulePermissionsToggle(
                                          modulePermissions
                                        )
                                      }
                                    />
                                    <Label
                                      htmlFor={`module-${module}`}
                                      className="text-base font-medium capitalize"
                                    >
                                      {module.replace("_", " ")}
                                    </Label>
                                  </div>
                                  <ChevronDown className="h-4 w-4" />
                                </div>
                                <Separator />
                                <div className="p-4 grid gap-3 md:grid-cols-2">
                                  {modulePermissions.map((permission) => (
                                    <div
                                      key={permission.id}
                                      className="flex items-start space-x-2"
                                    >
                                      <Checkbox
                                        id={permission.id}
                                        checked={selectedPermissions.includes(
                                          permission.id
                                        )}
                                        onCheckedChange={() =>
                                          handlePermissionToggle(permission.id)
                                        }
                                      />
                                      <div className="grid gap-0.5">
                                        <Label
                                          htmlFor={permission.id}
                                          className="text-sm font-medium"
                                        >
                                          {permission.name.replace("_", " ")}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                          {permission.description}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Tabs defaultValue="permissions">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="permissions">
                          Permissions
                        </TabsTrigger>
                        <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                        <TabsTrigger value="details">Détails</TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="permissions"
                        className="space-y-4 mt-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">
                            Permissions du rôle
                          </h3>
                          <Badge variant="outline">
                            {selectedRole?.permissions.length} permission
                            {selectedRole?.permissions.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>

                        <div className="space-y-6">
                          {Object.entries(groupedPermissions).map(
                            ([module, modulePermissions]) => {
                              const modulePermissionIds = modulePermissions.map(
                                (p) => p.id
                              );
                              const selectedModulePermissions =
                                modulePermissionIds.filter((id) =>
                                  selectedRole?.permissions.includes(id)
                                );

                              if (selectedModulePermissions.length === 0) {
                                return null;
                              }

                              return (
                                <div key={module} className="rounded-md border">
                                  <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center space-x-2">
                                      <h4 className="text-base font-medium capitalize">
                                        {module.replace("_", " ")}
                                      </h4>
                                    </div>
                                    <Badge variant="outline">
                                      {selectedModulePermissions.length} /{" "}
                                      {modulePermissionIds.length}
                                    </Badge>
                                  </div>
                                  <Separator />
                                  <div className="p-4 grid gap-3 md:grid-cols-2">
                                    {modulePermissions
                                      .filter((permission) =>
                                        selectedRole?.permissions.includes(
                                          permission.id
                                        )
                                      )
                                      .map((permission) => (
                                        <div
                                          key={permission.id}
                                          className="flex items-start space-x-2"
                                        >
                                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                                            <Check className="h-3 w-3 text-primary" />
                                          </div>
                                          <div className="grid gap-0.5">
                                            <p className="text-sm font-medium">
                                              {permission.name.replace(
                                                "_",
                                                " "
                                              )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {permission.description}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="users" className="mt-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">
                            Utilisateurs avec ce rôle
                          </h3>
                          <Badge variant="outline">
                            {selectedRole?.userCount} utilisateur
                            {selectedRole?.userCount !== 1 ? "s" : ""}
                          </Badge>
                        </div>

                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Dernière connexion</TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users
                                .filter(
                                  (user) => user.role === selectedRole?.name
                                )
                                .map((user) => (
                                  <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                      <div className="flex items-center space-x-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage
                                            src={user.avatar}
                                            alt={user.name}
                                          />
                                          <AvatarFallback>
                                            {user.name.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          user.status === "active"
                                            ? "outline"
                                            : user.status === "inactive"
                                            ? "secondary"
                                            : "destructive"
                                        }
                                      >
                                        {user.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {user.lastLogin
                                        ? new Date(
                                            user.lastLogin
                                          ).toLocaleDateString("fr-FR")
                                        : "Jamais"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                          >
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setSelectedUser(user);
                                              setSelectedUserRole(user.role);
                                              setIsAssignRoleOpen(true);
                                            }}
                                          >
                                            <Shield className="mr-2 h-4 w-4" />
                                            <span>Changer de rôle</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <Eye className="mr-2 h-4 w-4" />
                                            <span>Voir le profil</span>
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                      <TabsContent value="details" className="mt-4">
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">
                                Informations générales
                              </h4>
                              <div className="rounded-md border p-4 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    ID
                                  </span>
                                  <span className="text-sm font-medium">
                                    {selectedRole?.id}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    Nom
                                  </span>
                                  <span className="text-sm font-medium">
                                    {selectedRole?.name}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    Description
                                  </span>
                                  <span className="text-sm font-medium">
                                    {selectedRole?.description}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">
                                Propriétés
                              </h4>
                              <div className="rounded-md border p-4 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    Rôle système
                                  </span>
                                  <Badge
                                    variant={
                                      selectedRole?.isSystem
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {selectedRole?.isSystem ? "Oui" : "Non"}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    Rôle par défaut
                                  </span>
                                  <Badge
                                    variant={
                                      selectedRole?.isDefault
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {selectedRole?.isDefault ? "Oui" : "Non"}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    Utilisateurs
                                  </span>
                                  <span className="text-sm font-medium">
                                    {selectedRole?.userCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Dates</h4>
                            <div className="rounded-md border p-4 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Créé le
                                </span>
                                <span className="text-sm font-medium">
                                  {selectedRole?.createdAt.toLocaleDateString(
                                    "fr-FR"
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Dernière mise à jour
                                </span>
                                <span className="text-sm font-medium">
                                  {selectedRole?.updatedAt.toLocaleDateString(
                                    "fr-FR"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
                {(isCreatingRole || isEditingRole) && (
                  <CardFooter className="flex justify-between border-t px-6 py-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreatingRole(false);
                        setIsEditingRole(false);
                        setEditedRole(null);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button onClick={handleSaveRole} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Enregistrer
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </>
            ) : (
              <div className="flex h-[600px] flex-col items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Shield className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">
                  Aucun rôle sélectionné
                </h3>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
                  Sélectionnez un rôle dans la liste pour voir ses détails et
                  ses permissions, ou créez un nouveau rôle.
                </p>
                <Button className="mt-4" onClick={handleCreateRole}>
                  <Plus className="mr-2 h-4 w-4" /> Créer un rôle
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le rôle</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action ne peut
              pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md border p-4 bg-destructive/5">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium">{selectedRole?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRole?.description}
                  </p>
                </div>
              </div>
              {selectedRole?.userCount !== undefined &&
                selectedRole.userCount > 0 && (
                  <div className="mt-3 text-sm text-destructive">
                    <AlertCircle className="inline-block mr-1 h-4 w-4" />
                    Ce rôle est attribué à {selectedRole?.userCount} utilisateur
                    {selectedRole?.userCount !== 1 ? "s" : ""}. Vous devrez
                    réattribuer ces utilisateurs à un autre rôle.
                  </div>
                )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRole}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Suppression...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" /> Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attribuer un rôle</DialogTitle>
            <DialogDescription>
              Modifiez le rôle de l&apos;utilisateur sélectionné.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="flex items-center space-x-4 mb-4">
                <Avatar>
                  <AvatarImage
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                  />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="user-role">Rôle</Label>
              <Select
                value={selectedUserRole}
                onValueChange={setSelectedUserRole}
              >
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignRoleOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleAssignRole} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Attribution...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" /> Attribuer le rôle
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
