"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { savePlanConfig } from "@/app/actions/plan-config-actions";
import {
  Users,
  Building2,
  Infinity as InfinityIcon,
  Pencil,
} from "lucide-react";
import type {
  PlanConfig,
  PlanLimits,
  BillingInterval,
  SubscriptionPlan,
  PlanPrice,
} from "@prisma/client";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

/* ---------- types from server ---------- */
type PlanWithStats = {
  code: SubscriptionPlan;
  cfg: PlanConfig & { limits: PlanLimits | null; prices: PlanPrice[] };
  subscribers: number;
  doctors: number;
  hospitals: number;
};

export default function PlansClient({ plans }: { plans: PlanWithStats[] }) {
  const [open, setOpen] = React.useState<PlanWithStats["cfg"] | null>(null);

  const getPrice = (cfg: PlanWithStats["cfg"], t: "DOCTOR" | "HOSPITAL") =>
    Number(
      cfg.prices.find(
        (p) => p.subscriberType === t && p.interval === "MONTH" && p.isActive
      )?.amount ?? 0
    );

  const fmt = (n: number, currency = "XOF") =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(n);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Plans & Tarifs</h2>
          <p className="text-muted-foreground">
            Gérez les <b>tarifs</b> Docteur/Hôpital et les <b>limites</b>.
          </p>
        </div>
      </div>

      {/* Mobile: card list */}
      <div className="grid gap-4 md:hidden">
        {plans.map(({ code, cfg, doctors, hospitals, subscribers }) => {
          const dPrice = getPrice(cfg, "DOCTOR");
          const hPrice = getPrice(cfg, "HOSPITAL");
          const lim = cfg.limits;

          const chip = (v?: number | null) =>
            v == null ? (
              <span className="inline-flex items-center gap-1 text-xs">
                <InfinityIcon className="h-3 w-3" /> Illimité
              </span>
            ) : (
              <span className="text-xs">{v}</span>
            );

          return (
            <Card key={code} className="border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <CardTitle className="text-base">{cfg.name}</CardTitle>
                    <CardDescription className="text-[11px]">
                      {code} · {cfg.description || "—"}
                    </CardDescription>
                  </div>
                  <Badge variant={cfg.isActive ? "default" : "secondary"}>
                    {cfg.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">
                      Prix Docteur / mois
                    </div>
                    <div className="font-medium">
                      {fmt(dPrice, cfg.currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">
                      Prix Hôpital / mois
                    </div>
                    <div className="font-medium">
                      {fmt(hPrice, cfg.currency)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <Mini label="RDV" value={chip(lim?.maxAppointments)} />
                  <Mini label="Patients" value={chip(lim?.maxPatients)} />
                  <Mini
                    label="Médecins/Hôpital"
                    value={chip(lim?.maxDoctorsPerHospital)}
                  />
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> {doctors}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {hospitals}
                  </span>
                  <Badge variant="outline">{subscribers}</Badge>
                </div>

                <div className="pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-1"
                    onClick={() => setOpen(cfg)}
                  >
                    <Pencil className="h-4 w-4" /> Éditer
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop: table */}
      <Card className="hidden md:block">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Liste des plans</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="[&>th]:py-2 [&>th]:px-2 text-center">
                <th className="text-left">Plan</th>
                <th>Statut</th>
                <th>Docteur</th>
                <th>Hôpital</th>
                <th>Limites</th>
                <th>Abonnés</th>
                <th>Maj</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(({ code, cfg, subscribers, doctors, hospitals }) => {
                const dPrice = getPrice(cfg, "DOCTOR");
                const hPrice = getPrice(cfg, "HOSPITAL");
                const lim = cfg.limits;
                const chip = (v?: number | null) =>
                  v == null ? (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <InfinityIcon className="h-3 w-3" /> Illimité
                    </span>
                  ) : (
                    <span className="text-xs">{v}</span>
                  );

                return (
                  <tr
                    key={code}
                    className="[&>td]:py-2 [&>td]:px-2 border-b last:border-0 align-middle"
                  >
                    <td className="font-medium">
                      <div className="flex flex-col">
                        <span>{cfg.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {code} · {cfg.description || "—"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={cfg.isActive ? "default" : "secondary"}>
                        {cfg.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap text-center">
                      {fmt(dPrice, cfg.currency)}
                    </td>
                    <td className="whitespace-nowrap text-center">
                      {fmt(hPrice, cfg.currency)}
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <Mini label="RDV" value={chip(lim?.maxAppointments)} />
                        <Mini label="Patients" value={chip(lim?.maxPatients)} />
                        <Mini
                          label="Médecins/Hôpital"
                          value={chip(lim?.maxDoctorsPerHospital)}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-center items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {doctors}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          {hospitals}
                        </span>
                        <Badge variant="outline">{subscribers}</Badge>
                      </div>
                    </td>
                    <td>
                      {new Date(cfg.updatedAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => setOpen(cfg)}
                      >
                        <Pencil className="h-4 w-4" />
                        Éditer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <EditPlanDialog openPlan={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border px-2 py-1 text-[11px] leading-none flex items-center justify-center">
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </div>
  );
}

/* -------------------- EDIT DIALOG -------------------- */

const LimitNumber = z.union([z.number().int().positive(), z.null()]).optional();

const PlanSchema = z.object({
  code: z.enum(["FREE", "STANDARD", "PREMIUM"]),
  name: z.string().min(2),
  description: z.string().optional(),
  currency: z.string().min(1).default("XOF"),
  interval: z.enum(["MONTH", "YEAR"]).default("MONTH"),
  isActive: z.boolean(),
  priceDoctorMonth: z.coerce.number().min(0),
  priceHospitalMonth: z.coerce.number().min(0),
  limits: z.object({
    maxAppointments: LimitNumber,
    maxPatients: LimitNumber,
    maxDoctorsPerHospital: LimitNumber,
  }),
});
type PlanForm = z.infer<typeof PlanSchema>;

function EditPlanDialog({
  openPlan,
  onClose,
}: {
  openPlan:
    | (PlanConfig & { limits: PlanLimits | null; prices: PlanPrice[] })
    | null;
  onClose: () => void;
}) {
  const { toast } = useToast();

  const doctorPrice = Number(
    openPlan?.prices.find(
      (p) =>
        p.subscriberType === "DOCTOR" && p.interval === "MONTH" && p.isActive
    )?.amount ?? 0
  );
  const hospitalPrice = Number(
    openPlan?.prices.find(
      (p) =>
        p.subscriberType === "HOSPITAL" && p.interval === "MONTH" && p.isActive
    )?.amount ?? 0
  );

  const defaults: PlanForm = {
    code: (openPlan?.code ?? "FREE") as PlanForm["code"],
    name: openPlan?.name ?? "",
    description: openPlan?.description ?? "",
    currency: openPlan?.currency ?? "XOF",
    interval: (openPlan?.interval ?? "MONTH") as BillingInterval,
    isActive: openPlan?.isActive ?? true,
    priceDoctorMonth: doctorPrice,
    priceHospitalMonth: hospitalPrice,
    limits: {
      maxAppointments: openPlan?.limits?.maxAppointments ?? undefined,
      maxPatients: openPlan?.limits?.maxPatients ?? undefined,
      maxDoctorsPerHospital:
        openPlan?.limits?.maxDoctorsPerHospital ?? undefined,
    },
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<PlanForm>({
    resolver: zodResolver(PlanSchema),
    defaultValues: defaults,
  });

  // ensure inputs refresh when switching plan
  React.useEffect(() => {
    reset(defaults);
  }, [openPlan?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: PlanForm) => {
    if (!openPlan) return;
    await savePlanConfig({
      code: data.code,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      limits: {
        maxAppointments: data.limits.maxAppointments ?? null,
        maxPatients: data.limits.maxPatients ?? null,
        maxDoctorsPerHospital: data.limits.maxDoctorsPerHospital ?? null,
      },
      priceDoctorMonth: data.priceDoctorMonth,
      priceHospitalMonth: data.priceHospitalMonth,
    });
    toast({ title: "Plan enregistré" });
    onClose();
  };

  return (
    <Dialog open={!!openPlan} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>
            Modifier le plan — {openPlan?.name}{" "}
            <span className="text-xs text-muted-foreground">
              ({openPlan?.code})
            </span>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* keep code in the form model */}
          <input type="hidden" {...register("code")} />

          <div className="md:col-span-2">
            <Label>Nom</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label>Description</Label>
            <Input {...register("description")} />
          </div>

          {/* Pricing */}
          <div>
            <Label>Prix DOCTOR / mois</Label>
            <Input type="number" step="1" {...register("priceDoctorMonth")} />
          </div>
          <div>
            <Label>Prix HOSPITAL / mois</Label>
            <Input type="number" step="1" {...register("priceHospitalMonth")} />
          </div>

          {/* Interval (RHF-controlled Select) */}
          <div>
            <Label>Intervalle (affichage)</Label>
            <Controller
              control={control}
              name="interval"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTH">Mensuel</SelectItem>
                    <SelectItem value="YEAR">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Active (RHF-controlled checkbox) */}
          <div className="flex items-center gap-2 pt-6">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Label>Actif</Label>
          </div>

          {/* Limits */}
          <div className="md:col-span-2 pt-2">
            <div className="text-sm font-medium mb-2">Limites</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <LimitField
                control={control}
                name="limits.maxAppointments"
                label="RDV max"
              />
              <LimitField
                control={control}
                name="limits.maxPatients"
                label="Patients max"
              />
              <LimitField
                control={control}
                name="limits.maxDoctorsPerHospital"
                label="Médecins/Hôpital"
              />
              {/* Optional, if you want to expose it */}
              {/* <LimitField control={control} name="limits.storageGb" label="Stockage (Go)" /> */}
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Laissez vide pour “Illimité”.
            </p>
          </div>

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import type { Control, FieldPath } from "react-hook-form";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LimitField<T extends { limits: any }>({
  control,
  name,
  label,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const display =
            field.value === null || field.value === undefined
              ? ""
              : String(field.value);

          return (
            <Input
              // TIP: using text avoids browser number re-validation hiccups
              // If you prefer a spinner, keep type="number" — both work with this handler.
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Illimité"
              value={display}
              onChange={(e) => {
                const raw = e.target.value.trim();

                if (raw === "") {
                  // empty => unlimited
                  field.onChange(null);
                  return;
                }

                // accept digits only (ignore accidental non-numeric)
                const n = Number(raw);
                if (Number.isNaN(n)) {
                  // don't overwrite while the user is mid-typing a non-number;
                  // keep last valid value in the field state
                  return;
                }

                // positive only per schema
                if (n <= 0) {
                  field.onChange(null);
                  return;
                }

                field.onChange(n);
              }}
            />
          );
        }}
      />
    </div>
  );
}
