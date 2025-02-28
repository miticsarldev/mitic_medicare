import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, color }) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${color || "text-primary"}`}>{value}</p>
      </CardContent>
    </Card>
  );
};
