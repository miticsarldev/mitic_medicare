"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import type { MedicalHistoryItem } from "@/app/dashboard/patient/actions";
import { MedicalHistoryCard } from "./medical-history-card";
import { MedicalHistoryList } from "./medical-history-list";
import { MedicalHistoryDialog } from "./medical-history-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface MedicalHistoryViewProps {
  history: MedicalHistoryItem[];
}

export function MedicalHistoryView({ history }: MedicalHistoryViewProps) {
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [selectedItem, setSelectedItem] = useState<MedicalHistoryItem | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    const searchLower = search.toLowerCase();

    const matchesSearch =
      item.title.toLowerCase().includes(searchLower) ||
      item.condition.toLowerCase().includes(searchLower) ||
      (item.doctor?.name?.toLowerCase().includes(searchLower) ?? false) ||
      (item.doctor?.specialization?.toLowerCase().includes(searchLower) ??
        false) ||
      (item.doctor?.hospital?.name?.toLowerCase().includes(searchLower) ??
        false) ||
      item.createdBy.name.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter ? item.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const handleItemClick = (item: MedicalHistoryItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const activeConditions = history.filter((item) => item.status === "ACTIVE");
  const resolvedConditions = history.filter(
    (item) => item.status === "RESOLVED"
  );
  const chronicConditions = history.filter((item) => item.status === "CHRONIC");

  return (
    <div className="space-y-6">
      {/* Sélecteur d’affichage */}
      <div className="flex items-center space-x-4 mb-4">
        <Input
          type="text"
          placeholder="Rechercher un antécédent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <Select
          value={statusFilter || ""}
          onValueChange={(value) =>
            setStatusFilter(value === "ALL" ? null : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous</SelectItem>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="RESOLVED">Résolu</SelectItem>
            <SelectItem value="CHRONIC">Chronique</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col md:flex-row items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {history.length} condition{history.length !== 1 ? "s" : ""} au total
          </div>

          {activeConditions.length > 0 && (
            <div className="text-sm text-orange-600">
              {activeConditions.length} condition
              {activeConditions.length > 1 ? "s" : ""} active
              {activeConditions.length > 1 ? "s" : ""}
            </div>
          )}

          {chronicConditions.length > 0 && (
            <div className="text-sm text-red-600">
              {chronicConditions.length} condition
              {chronicConditions.length > 1 ? "s" : ""} chronique
              {chronicConditions.length > 1 ? "s" : ""}
            </div>
          )}

          {resolvedConditions.length > 0 && (
            <div className="text-sm text-green-600">
              {resolvedConditions.length} condition
              {resolvedConditions.length > 1 ? "s" : ""} résolue
              {resolvedConditions.length > 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cartes
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-2" />
            Liste
          </Button>
        </div>
      </div>

      {/* Contenu */}
      {filteredHistory.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Aucun antécédent médical correspondant à votre recherche.
        </p>
      )}

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.map((item) => (
            <MedicalHistoryCard
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      ) : (
        <MedicalHistoryList
          history={filteredHistory}
          onItemClick={handleItemClick}
        />
      )}

      {/* Fenêtre de détails */}
      <MedicalHistoryDialog
        item={selectedItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
