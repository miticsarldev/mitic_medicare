import { BloodType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { cn } from "@/lib/utils"; // shadcn utility

const bloodTypeLabels: Record<BloodType, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A−",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B−",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB−",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O−",
};

const bloodTypeStyles: Record<BloodType, string> = {
  A_POSITIVE: "bg-red-100 text-red-700",
  A_NEGATIVE: "bg-red-200 text-red-800",
  B_POSITIVE: "bg-blue-100 text-blue-700",
  B_NEGATIVE: "bg-blue-200 text-blue-800",
  AB_POSITIVE: "bg-purple-100 text-purple-700",
  AB_NEGATIVE: "bg-purple-200 text-purple-800",
  O_POSITIVE: "bg-green-100 text-green-700",
  O_NEGATIVE: "bg-green-200 text-green-800",
};

const RenderBloodType = ({ bloodType }: { bloodType: BloodType }) => {
  return (
    <Badge
      variant="secondary"
      className={cn("font-semibold", bloodTypeStyles[bloodType])}
    >
      {bloodTypeLabels[bloodType]}
    </Badge>
  );
};

export default RenderBloodType;
