export interface Doctor {
    id: number;
    name: string;
    departement: string
    specialty: string;
    email: string;
    phone: string;
    status: "Actif" | "Inactif";
  }