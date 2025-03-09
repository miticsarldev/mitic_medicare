"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", consultations: 2 },
  { month: "Fév", consultations: 3 },
  { month: "Mar", consultations: 5 },
  { month: "Avr", consultations: 2 },
  { month: "Mai", consultations: 3 },
  { month: "Juin", consultations: 5 },
  { month: "Juil", consultations: 2 },
  { month: "Aoû", consultations: 3 },
  { month: "sept", consultations: 5 },
  { month: "Oct", consultations: 2 },
  { month: "Nov", consultations: 3 },
  { month: "Dec", consultations: 5 },
];

export const PatientChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="consultations" stroke="#3b82f6" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);