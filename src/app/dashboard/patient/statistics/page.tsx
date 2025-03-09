"use client"; 
import React from "react";
import { PatientChart } from "@/components/patient-chart";

const Page = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Statistiques & Suivi</h2>
      <div className="rounded-xl bg-muted/50 p-6 shadow-md">
        <PatientChart />
      </div>
    </div>
  );
};

export default Page;
