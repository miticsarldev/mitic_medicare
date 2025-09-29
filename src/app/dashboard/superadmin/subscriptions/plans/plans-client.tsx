"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Users,
  Building2,
  Settings2,
  Infinity as InfinityIcon,
} from "lucide-react";
import type {
  PlanConfig,
  PlanLimits,
  BillingInterval,
  SubscriptionPlan,
  PlanPrice,
} from "@prisma/client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ---------- types returned by server
type PlanWithStats = {
  code: SubscriptionPlan;
  cfg: PlanConfig & { limits: PlanLimits | null; prices: PlanPrice[] }; // prices required
  subscribers: number;
  doctors: number;
  hospitals: number;
  mrr: number;
};

export default function PlansClient({ plans }: { plans: PlanWithStats[] }) {
  const [open, setOpen] = React.useState<PlanWithStats["cfg"] | null>(null);

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Plans</h2>
          <p className="text-muted-foreground">
            Définissez <b>prix</b> & <b>limites</b> pour chaque offre. Utilisez
            “Appliquer le prix aux abonnés” pour aligner les abonnements
            existants.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map(({ code, cfg, subscribers, doctors, hospitals }) => {
          const dPrice =
            Number(
              cfg.prices.find(
                (p) =>
                  p.subscriberType === "DOCTOR" &&
                  p.interval === "MONTH" &&
                  p.isActive
              )?.amount ?? 0
            ) || 0;

          const hPrice =
            Number(
              cfg.prices.find(
                (p) =>
                  p.subscriberType === "HOSPITAL" &&
                  p.interval === "MONTH" &&
                  p.isActive
              )?.amount ?? 0
            ) || 0;

          const currency = "XOF";
          const fmt = (n: number) =>
            new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency,
            }).format(n);

          return (
            <Card
              key={code}
              className={cn(
                "border-2 transition hover:shadow-md",
                cfg.isActive ? "border-primary/30" : "border-muted"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{cfg.name}</CardTitle>
                  <Badge variant={cfg.isActive ? "default" : "secondary"}>
                    {cfg.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <CardDescription>{cfg.description || "—"}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Prices per type */}
                <div className="grid grid-cols-2 gap-3">
                  <Stat
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Prix Docteur / mois"
                    value={fmt(dPrice)}
                  />
                  <Stat
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Prix Hôpital / mois"
                    value={fmt(hPrice)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Stat
                    icon={<Users className="h-4 w-4" />}
                    label="Abonnés"
                    value={String(subscribers)}
                  />
                  <Stat
                    icon={<Users className="h-4 w-4" />}
                    label="Médecins"
                    value={String(doctors)}
                  />
                  <Stat
                    icon={<Building2 className="h-4 w-4" />}
                    label="Hôpitaux"
                    value={String(hospitals)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Stat
                    label="RDV max"
                    value={
                      cfg.limits?.maxAppointments ?? (
                        <>
                          <InfinityIcon className="h-4 w-4 inline" /> Illimité
                        </>
                      )
                    }
                  />
                  <Stat
                    label="Patients max"
                    value={
                      cfg.limits?.maxPatients ?? (
                        <>
                          <InfinityIcon className="h-4 w-4 inline" /> Illimité
                        </>
                      )
                    }
                  />
                  <Stat
                    icon={<Settings2 className="h-4 w-4" />}
                    label="Maj"
                    value={new Date(cfg.updatedAt).toLocaleDateString("fr-FR")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOpen(cfg)}>
                    Configurer
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <EditPlanDialog openPlan={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center justify-center text-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xs font-semibold text-center">{value}</div>
    </div>
  );
}

/* -------------------- EDIT DIALOG -------------------- */
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
  const dialogOpen = !!openPlan;

  // derive prices safely (0 if no plan)
  const priceDoctorMonth = Number(
    openPlan?.prices.find(
      (p) =>
        p.subscriberType === "DOCTOR" && p.interval === "MONTH" && p.isActive
    )?.amount ?? 0
  );
  const priceHospitalMonth = Number(
    openPlan?.prices.find(
      (p) =>
        p.subscriberType === "HOSPITAL" && p.interval === "MONTH" && p.isActive
    )?.amount ?? 0
  );

  // default values whether openPlan exists or not (hooks must be unconditional)
  const defaultValues = React.useMemo(
    () => ({
      code: openPlan?.code ?? "FREE",
      name: openPlan?.name ?? "",
      description: openPlan?.description ?? "",
      currency: openPlan?.currency ?? "XOF",
      interval: (openPlan?.interval ?? "MONTH") as BillingInterval,
      isActive: openPlan?.isActive ?? true,
      priceDoctorMonth,
      priceHospitalMonth,
      limits: {
        maxAppointments: openPlan?.limits?.maxAppointments ?? undefined,
        maxPatients: openPlan?.limits?.maxPatients ?? undefined,
        maxDoctorsPerHospital:
          openPlan?.limits?.maxDoctorsPerHospital ?? undefined,
        storageGb: openPlan?.limits?.storageGb ?? undefined,
      },
    }),
    [openPlan, priceDoctorMonth, priceHospitalMonth]
  );

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
      maxAppointments: z
        .union([z.coerce.number().int().positive(), z.null(), z.undefined()])
        .optional(),
      maxPatients: z
        .union([z.coerce.number().int().positive(), z.null(), z.undefined()])
        .optional(),
      maxDoctorsPerHospital: z
        .union([z.coerce.number().int().positive(), z.null(), z.undefined()])
        .optional(),
      storageGb: z
        .union([z.coerce.number().int().positive(), z.null(), z.undefined()])
        .optional(),
    }),
  });
  type PlanForm = z.infer<typeof PlanSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<PlanForm>({
    resolver: zodResolver(PlanSchema),
    defaultValues, // initial
  });

  // reset when a different plan is opened/closed
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data: PlanForm) => {
    // If dialog isn't open (no plan), do nothing
    if (!dialogOpen) return;
    await savePlanConfig({
      code: data.code,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      limits: {
        maxAppointments: data.limits.maxAppointments ?? null,
        maxPatients: data.limits.maxPatients ?? null,
        maxDoctorsPerHospital: data.limits.maxDoctorsPerHospital ?? null,
        storageGb: data.limits.storageGb ?? null,
      },
      priceDoctorMonth: data.priceDoctorMonth,
      priceHospitalMonth: data.priceHospitalMonth,
      currency: data.currency,
    });
    toast({ title: "Plan enregistré" });
    onClose();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Configurer le plan — {openPlan?.code ?? ""}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          {/* Register hidden fields so setValue works */}
          <input
            type="hidden"
            {...register("code")}
            value={defaultValues.code}
            readOnly
          />
          <input
            type="hidden"
            {...register("interval")}
            value={defaultValues.interval}
            readOnly
          />
          <input
            type="hidden"
            {...register("isActive")}
            value={String(defaultValues.isActive)}
            readOnly
          />

          <div className="col-span-2">
            <Label>Nom</Label>
            <Input {...register("name")} disabled={!dialogOpen} />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <Label>Description</Label>
            <Input {...register("description")} disabled={!dialogOpen} />
          </div>

          <div>
            <Label>Prix DOCTOR / mois (XOF)</Label>
            <Input
              type="number"
              step="1"
              {...register("priceDoctorMonth")}
              disabled={!dialogOpen}
            />
          </div>
          <div>
            <Label>Prix HOSPITAL / mois (XOF)</Label>
            <Input
              type="number"
              step="1"
              {...register("priceHospitalMonth")}
              disabled={!dialogOpen}
            />
          </div>

          <div>
            <Label>Devise</Label>
            <Input {...register("currency")} disabled={!dialogOpen} />
          </div>

          <div>
            <Label>Intervalle</Label>
            <Select
              value={defaultValues.interval}
              onValueChange={(v) =>
                setValue("interval", v as BillingInterval, {
                  shouldDirty: true,
                })
              }
              disabled={!dialogOpen}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTH">Mensuel</SelectItem>
                <SelectItem value="YEAR">Annuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={defaultValues.isActive}
              onChange={(e) =>
                setValue("isActive", e.target.checked, { shouldDirty: true })
              }
              disabled={!dialogOpen}
            />
            <Label>Actif</Label>
          </div>

          <div className="col-span-2 pt-2">
            <div className="text-sm font-medium mb-2">Limites</div>
            <div className="grid grid-cols-3 gap-3">
              <NumberField
                label="RDV max"
                value={defaultValues.limits.maxAppointments ?? undefined}
                onChange={(v) =>
                  setValue("limits.maxAppointments", v ?? undefined, {
                    shouldDirty: true,
                  })
                }
              />
              <NumberField
                label="Patients max"
                value={defaultValues.limits.maxPatients ?? undefined}
                onChange={(v) =>
                  setValue("limits.maxPatients", v ?? undefined, {
                    shouldDirty: true,
                  })
                }
              />
              <NumberField
                label="Médecins/Hôpital"
                value={defaultValues.limits.maxDoctorsPerHospital ?? undefined}
                onChange={(v) =>
                  setValue("limits.maxDoctorsPerHospital", v ?? undefined, {
                    shouldDirty: true,
                  })
                }
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Laissez vide pour “Illimité”.
            </p>
          </div>

          <DialogFooter className="col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !dialogOpen}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------- SHARED -------------------- */

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? undefined : Number(raw));
        }}
        placeholder="Illimité"
      />
    </div>
  );
}
