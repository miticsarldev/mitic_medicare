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
  TrendingUp,
  Settings2,
  Infinity as InfinityIcon,
} from "lucide-react";
import type {
  PlanConfig,
  PlanLimits,
  BillingInterval,
  SubscriptionPlan,
} from "@prisma/client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ---------- types
type PlanWithStats = {
  code: SubscriptionPlan;
  cfg: PlanConfig & { limits: PlanLimits | null };
  subscribers: number;
  doctors: number;
  hospitals: number;
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
          const priceDisplay = new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: cfg.currency,
          }).format(Number(cfg.price));

          const intervalFR = cfg.interval === "MONTH" ? "Mensuel" : "Annuel";
          const limits = cfg.limits;

          const statChip = (v?: number | null) =>
            v === null || v === undefined ? (
              <span className="inline-flex items-center gap-1">
                <InfinityIcon className="h-4 w-4" /> Illimité
              </span>
            ) : (
              v
            );

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
                <div className="grid grid-cols-3 gap-3">
                  <Stat
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Prix"
                    value={priceDisplay}
                  />
                  <Stat
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Intervalle"
                    value={intervalFR}
                  />
                  <Stat
                    icon={<Settings2 className="h-4 w-4" />}
                    label="Maj"
                    value={new Date(cfg.updatedAt).toLocaleDateString("fr-FR")}
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
                    value={statChip(limits?.maxAppointments)}
                  />
                  <Stat
                    label="Patients max"
                    value={statChip(limits?.maxPatients)}
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
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xs font-semibold">{value}</div>
    </div>
  );
}

// ---------- Edit Dialog (RHF + Zod)
const PlanSchema = z.object({
  code: z.enum(["FREE", "STANDARD", "PREMIUM"]),
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  currency: z.string().min(1),
  interval: z.enum(["MONTH", "YEAR"]),
  isActive: z.boolean(),
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

function EditPlanDialog({
  openPlan,
  onClose,
}: {
  openPlan: (PlanConfig & { limits: PlanLimits | null }) | null;
  onClose: () => void;
}) {
  const { toast } = useToast();

  const formRef = React.useRef<HTMLFormElement>(null);

  const defaultValues: PlanForm | undefined = openPlan
    ? {
        code: openPlan.code,
        name: openPlan.name,
        description: openPlan.description ?? "",
        price: Number(openPlan.price),
        currency: openPlan.currency,
        interval: openPlan.interval,
        isActive: openPlan.isActive,
        limits: {
          maxAppointments: openPlan.limits?.maxAppointments ?? undefined,
          maxPatients: openPlan.limits?.maxPatients ?? undefined,
          maxDoctorsPerHospital:
            openPlan.limits?.maxDoctorsPerHospital ?? undefined,
          storageGb: openPlan.limits?.storageGb ?? undefined,
        },
      }
    : undefined;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<PlanForm>({
    resolver: zodResolver(PlanSchema),
    values: defaultValues,
  });

  React.useEffect(() => {
    if (openPlan) {
      reset(defaultValues);
    }
  }, [openPlan]); // eslint-disable-line

  if (!openPlan) return null;

  const onSubmit = async (data: PlanForm) => {
    await savePlanConfig({
      code: data.code,
      name: data.name,
      description: data.description,
      price: data.price,
      currency: data.currency,
      interval: data.interval,
      isActive: data.isActive,
      limits: {
        maxAppointments: data.limits.maxAppointments ?? null,
        maxPatients: data.limits.maxPatients ?? null,
        maxDoctorsPerHospital: data.limits.maxDoctorsPerHospital ?? null,
        storageGb: data.limits.storageGb ?? null,
      },
    });
    toast({ title: "Plan enregistré" });
    onClose();
  };

  return (
    <Dialog open={!!openPlan} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Configurer le plan — {openPlan.code}</DialogTitle>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <Label>Nom</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <Label>Description</Label>
            <Input {...register("description")} />
          </div>

          <div>
            <Label>Prix</Label>
            <Input type="number" step="0.01" {...register("price")} />
            {errors.price && (
              <p className="text-xs text-destructive mt-1">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <Label>Devise</Label>
            <Input {...register("currency")} />
          </div>

          <div>
            <Label>Intervalle</Label>
            <Select
              value={openPlan.interval}
              onValueChange={(v) => setValue("interval", v as BillingInterval)}
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
              checked={openPlan.isActive}
              onChange={(e) => setValue("isActive", e.target.checked)}
            />
            <Label>Actif</Label>
          </div>

          <div className="col-span-2 pt-2">
            <div className="text-sm font-medium mb-2">Limites</div>
            <div className="grid grid-cols-3 gap-3">
              <NumberField
                label="RDV max"
                value={openPlan.limits?.maxAppointments ?? undefined}
                onChange={(v) =>
                  setValue("limits.maxAppointments", v ?? undefined)
                }
              />
              <NumberField
                label="Patients max"
                value={openPlan.limits?.maxPatients ?? undefined}
                onChange={(v) => setValue("limits.maxPatients", v ?? undefined)}
              />
              <NumberField
                label="Médecins/Hôpital"
                value={openPlan.limits?.maxDoctorsPerHospital ?? undefined}
                onChange={(v) =>
                  setValue("limits.maxDoctorsPerHospital", v ?? undefined)
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
