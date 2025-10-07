"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Star,
  Check,
  X,
  Trash2,
  Search,
  Filter,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { updateReviewStatus, deleteReview, getReviewsData } from "./actions";
import type { ReviewsData, ReviewWithRelations } from "./types";
import { ReviewStatus, ReviewTargetType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  initialData: ReviewsData;
  forceStatus?: ReviewStatus; // PENDING page
};

export default function ReviewsTable({ initialData, forceStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<ReviewsData>(initialData);

  // Filters / pagination UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<ReviewStatus | "ALL">(
    forceStatus ?? "ALL"
  );
  const [targetType, setTargetType] = useState<"ALL" | ReviewTargetType>("ALL");
  const [ratingMin, setRatingMin] = useState<number | undefined>(undefined);
  const [ratingMax, setRatingMax] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [pageSize, setPageSize] = useState(initialData.pagination.pageSize);

  // Details dialog state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [active, setActive] = useState<ReviewWithRelations | null>(null);

  const reviews = data.reviews;
  const pagination = data.pagination;

  const pushQuery = (nextPage: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(nextPage));
    url.searchParams.set("pageSize", String(pageSize));
    window.history.pushState({}, "", url.toString());
  };

  const fetchData = (page: number) =>
    getReviewsData({
      status: forceStatus ?? status,
      targetType,
      search: searchQuery,
      page,
      pageSize,
      from: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : null,
      to: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : null,
      ratingMin,
      ratingMax,
    });

  const onPageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    startTransition(async () => {
      try {
        const next = await fetchData(page);
        setData(next);
        pushQuery(page);
      } catch {
        toast({
          title: "Erreur",
          description: "Échec du chargement.",
          variant: "destructive",
        });
      }
    });
  };

  const onApplyFilters = () => {
    startTransition(async () => {
      try {
        const filtered = await fetchData(1);
        setData(filtered);
        pushQuery(1);
      } catch {
        toast({
          title: "Erreur",
          description: "Filtrage impossible.",
          variant: "destructive",
        });
      }
    });
  };

  const refreshSamePage = async () => {
    const fresh = await fetchData(pagination.page);
    setData(fresh);
  };

  const onApprove = (r: ReviewWithRelations) => {
    startTransition(async () => {
      try {
        await updateReviewStatus(r.id, "APPROVED");
        toast({ title: "Approuvé", description: "L'avis a été approuvé." });
        await refreshSamePage();
        if (active?.id === r.id) setActive({ ...r, status: "APPROVED" });
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible d'approuver.",
          variant: "destructive",
        });
      }
    });
  };

  const onReject = (r: ReviewWithRelations) => {
    startTransition(async () => {
      try {
        await updateReviewStatus(r.id, "REJECTED");
        toast({ title: "Rejeté", description: "L'avis a été rejeté." });
        await refreshSamePage();
        if (active?.id === r.id) setActive({ ...r, status: "REJECTED" });
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de rejeter.",
          variant: "destructive",
        });
      }
    });
  };

  const onDelete = (r: ReviewWithRelations) => {
    startTransition(async () => {
      try {
        await deleteReview(r.id);
        toast({ title: "Supprimé", description: "L'avis a été supprimé." });
        setDetailsOpen(false);
        await refreshSamePage();
      } catch {
        toast({
          title: "Erreur",
          description: "Suppression impossible.",
          variant: "destructive",
        });
      }
    });
  };

  const badgeForStatus = (s: ReviewStatus) => {
    switch (s) {
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800">En attente</Badge>
        );
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{s}</Badge>;
    }
  };

  const initials = (name?: string) => {
    const n = (name ?? "").trim();
    if (!n) return "?";
    return n
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const Stars = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-current" : ""}`}
        />
      ))}
    </div>
  );

  const Stat = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <div className="rounded-lg border p-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );

  const targetLabel = (r: ReviewWithRelations) => {
    if (r.targetType === "DOCTOR" && r.doctor) {
      return (
        <>
          <div className="font-medium">{r.doctor.user.name}</div>
          <div className="text-xs text-muted-foreground">Médecin</div>
        </>
      );
    }
    if (r.targetType === "HOSPITAL" && r.hospital) {
      return (
        <>
          <div className="font-medium">{r.hospital.name}</div>
          <div className="text-xs text-muted-foreground">Hôpital</div>
        </>
      );
    }
    return (
      <>
        <div className="font-medium">Plateforme</div>
        <div className="text-xs text-muted-foreground">Général</div>
      </>
    );
  };

  // row click => open details
  const openDetails = (r: ReviewWithRelations) => {
    setActive(r);
    setDetailsOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Gestion des avis</CardTitle>
          <CardDescription>
            {data.pagination.totalItems} avis • Note moyenne{" "}
            {data.stats.avgRating || 0}/5
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Stat label="Total" value={data.stats.total} />
            <Stat label="En attente" value={data.stats.pending} />
            <Stat label="Approuvés" value={data.stats.approved} />
            <Stat label="Rejetés" value={data.stats.rejected} />
            <Stat label="Moyenne" value={`${data.stats.avgRating || 0}/5`} />
          </div>

          {/* Filtres */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Rechercher (titre, contenu, auteur, médecin, hôpital)…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ReviewStatus)}
                disabled={!!forceStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="APPROVED">Approuvés</SelectItem>
                  <SelectItem value="REJECTED">Rejetés</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={targetType}
                onValueChange={(v) => setTargetType(v as ReviewTargetType)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Cible" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous types</SelectItem>
                  <SelectItem value="DOCTOR">Médecins</SelectItem>
                  <SelectItem value="HOSPITAL">Hôpitaux</SelectItem>
                  <SelectItem value="PLATFORM">Plateforme</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from
                      ? dateRange.to
                        ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to!, "dd/MM/yyyy")}`
                        : format(dateRange.from, "dd/MM/yyyy")
                      : "Période"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(r) => setDateRange({ from: r?.from, to: r?.to })}
                    numberOfMonths={2}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Note min (1)"
                className="w-[140px]"
                value={ratingMin ?? ""}
                onChange={(e) =>
                  setRatingMin(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                min={1}
                max={5}
              />
              <Input
                type="number"
                placeholder="Note max (5)"
                className="w-[140px]"
                value={ratingMax ?? ""}
                onChange={(e) =>
                  setRatingMax(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                min={1}
                max={5}
              />

              <Button onClick={onApplyFilters} disabled={isPending}>
                <Filter className="mr-2 h-4 w-4" />
                Filtrer
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Cible</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  {/* <TableHead className="text-right">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Aucun avis trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((r) => (
                    <TableRow
                      key={r.id}
                      onClick={() => openDetails(r)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={r.author.profile?.avatarUrl ?? undefined}
                              alt={r.author.name}
                            />
                            <AvatarFallback>
                              {initials(r.author.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {r.isAnonymous
                                ? "Utilisateur anonyme"
                                : r.author.name}
                            </div>
                            {!r.isAnonymous && (
                              <div className="text-xs text-muted-foreground">
                                {r.author.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{targetLabel(r)}</TableCell>

                      <TableCell>
                        <Stars rating={r.rating} />
                      </TableCell>

                      <TableCell className="max-w-[360px]">
                        <div className="font-medium line-clamp-1">
                          {r.title}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(r.createdAt), "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(r.createdAt), "HH:mm", {
                            locale: fr,
                          })}
                        </div>
                      </TableCell>

                      <TableCell>{badgeForStatus(r.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Afficher</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  const ps = parseInt(v);
                  setPageSize(ps);
                  onPageChange(1);
                }}
              >
                <SelectTrigger className="h-8 w-[80px]">
                  <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">par page</span>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(pagination.page - 1)}
                    aria-disabled={pagination.page <= 1}
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationLink
                    isActive={pagination.page === 1}
                    onClick={() => onPageChange(1)}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {pagination.page > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {Array.from({
                  length: Math.max(0, Math.min(pagination.totalPages - 2, 3)),
                }).map((_, idx) => {
                  const p =
                    Math.min(
                      Math.max(2, pagination.page - 1),
                      Math.max(2, pagination.totalPages - 1 - 2)
                    ) + idx;
                  if (p >= pagination.totalPages) return null;
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={pagination.page === p}
                        onClick={() => onPageChange(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {pagination.page < pagination.totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {pagination.totalPages > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      isActive={pagination.page === pagination.totalPages}
                      onClick={() => onPageChange(pagination.totalPages)}
                    >
                      {pagination.totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(pagination.page + 1)}
                    aria-disabled={pagination.page >= pagination.totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {active.title}
                  {badgeForStatus(active.status)}
                </DialogTitle>
                <DialogDescription>
                  Publié le{" "}
                  {format(new Date(active.createdAt), "dd/MM/yyyy 'à' HH:mm", {
                    locale: fr,
                  })}
                </DialogDescription>
              </DialogHeader>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                {/* Auteur */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">Auteur</div>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={active.author.profile?.avatarUrl ?? undefined}
                        alt={active.author.name}
                      />
                      <AvatarFallback>
                        {initials(active.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {active.isAnonymous
                          ? "Utilisateur anonyme"
                          : active.author.name}
                      </div>
                      {!active.isAnonymous && (
                        <div className="text-xs text-muted-foreground">
                          {active.author.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cible */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">Cible</div>
                  <div className="rounded-lg border p-3">
                    {active.targetType === "DOCTOR" && active.doctor ? (
                      <>
                        <div className="font-medium">
                          {active.doctor.user.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Médecin
                        </div>
                      </>
                    ) : active.targetType === "HOSPITAL" && active.hospital ? (
                      <>
                        <div className="font-medium">
                          {active.hospital.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Hôpital
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-medium">Plateforme</div>
                        <div className="text-xs text-muted-foreground">
                          Général
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="mt-2">
                <div className="text-sm font-medium mb-2">Note</div>
                <Stars rating={active.rating} />
              </div>

              {/* Contenu */}
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Contenu</div>
                <ScrollArea className="max-h-[240px] rounded-lg border p-3">
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {active.content}
                  </p>
                </ScrollArea>
              </div>

              {/* Meta */}
              <div className="grid gap-3 md:grid-cols-3 mt-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Créé le</div>
                  <div className="font-medium">
                    {format(new Date(active.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: fr,
                    })}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    Mis à jour
                  </div>
                  <div className="font-medium">
                    {format(new Date(active.updatedAt), "dd/MM/yyyy HH:mm", {
                      locale: fr,
                    })}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Signals</div>
                  <div className="font-medium">
                    👍 {active.likes} • 👎 {active.dislikes}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6 flex-wrap gap-2">
                {active.status !== "APPROVED" && (
                  <Button
                    onClick={() => onApprove(active)}
                    disabled={isPending}
                  >
                    <Check className="mr-1 h-4 w-4" /> Approuver
                  </Button>
                )}
                {active.status !== "REJECTED" && (
                  <Button
                    variant="outline"
                    onClick={() => onReject(active)}
                    disabled={isPending}
                  >
                    <X className="mr-1 h-4 w-4" /> Rejeter
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => onDelete(active)}
                  disabled={isPending}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
