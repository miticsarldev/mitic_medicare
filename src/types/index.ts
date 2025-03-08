export interface Doctor {
  id: number;
  name: string;
  departement: string
  specialty: string;
  email: string;
  phone: string;
  status: "Actif" | "Inactif";
  location: string;
  image: string;
  }
  export interface Hospital {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
  }
  