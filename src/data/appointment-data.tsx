export const appointmentsData = [
    {
      id: 1,
      patient: "Salia Keita",
      doctor: "Dr. Martin",
      department: "Cardiologie",
      date: "2023-10-15",
      time: "10:00",
      reason: "Consultation de routine",
      status: "Confirmé",
    },
    {
      id: 2,
      patient: "Oumar Diallo",
      doctor: "Dr. Sophie",
      department: "Dermatologie",
      date: "2023-10-14",
      time: "14:30",
      reason: "Problème de peau",
      status: "En attente",
    },
    {
      id: 3,
      patient: "Seydou Dolo",
      doctor: "Dr. Lucie",
      department: "Orthopédie",
      date: "2023-10-13",
      time: "09:00",
      reason: "Douleur articulaire",
      status: "Annulé",
    },
    {
      id: 4,
      patient: "Youssouf Sylla",
      doctor: "Dr. Thomas",
      department: "Pédiatrie",
      date: "2023-10-12",
      time: "11:15",
      reason: "Vaccination",
      status: "Confirmé",
    },
    {
      id: 5,
      patient: "Demba Yara",
      doctor: "Dr. Jean",
      department: "Gynécologie",
      date: "2023-10-11",
      time: "16:45",
      reason: "Examen annuel",
      status: "Confirmé",
    },
    {
      id: 6,
      patient: "Lassana Cisse",
      doctor: "Dr. Marie",
      department: "Neurologie",
      date: "2023-10-10",
      time: "08:30",
      reason: "Maux de tête persistants",
      status: "En attente",
    },
  ];


  export const doctorData = [
    {
      id: 1,
      firstName: "Alou",
      lastName: "Dr.",
      speciality: "Cardiologie",
      email: "dr.alou@example.com",
      phone: "667898467",
      address: "Kalaban Koura",
      dateCreated: "2023-10-01",
      status: true,
    },
    {
      id: 2,
      firstName: "Alou",
      lastName: "Dr.",
      speciality: "Cardiologie",
      email: "dr.alou@example.com",
      phone: "667898467",
      address: "Kalaban Koura",
      dateCreated: "2023-10-01",
      status: true,
    },
    {
      id: 3,
      firstName: "Alou",
      lastName: "Dr.",
      speciality: "Cardiologie",
      email: "dr.alou@example.com",
      phone: "667898467",
      address: "Kalaban Koura",
      dateCreated: "2023-10-01",
      status: false,
    },
  ]
    

  export const rdvData = [
    {
        id: 1,
        patientName: "Oumar Mariko",
        doctorName: "Dr. Alou",
        date: "2024-03-01",
        time: "14:30",
        status: true,
    },
    {
        id: 2,
        patientName: "Marie Koné",
        doctorName: "Dr. Aly",
        date: "2024-03-02",
        time: "10:00",
        status: false,
    },
    {
        id: 3,
        patientName: "Albert Einstein",
        doctorName: "Dr. Pythagore",
        date: "2024-03-03",
        time: "16:00",
        status: true,
    },
];

export const doctorAvailability: { id: number; doctorName: string; slots: { day: string; time: string }[] }[] = [
  { id: 1, doctorName: "Dr. Alou", slots: [{ day: "Lundi", time: "9h00" }, { day: "Lundi", time: "10h00" }] },
  { id: 2, doctorName: "Dr. Oumar", slots: [{ day: "Mardi", time: "11h00" }, { day: "Mardi", time: "12h00" }] },
];

  
export const specialtiesData = [
  { id: 1, description: "none", specialty: "Cardiologie" },
  { id: 2, description: "none", specialty: "Dermatologie" },
  { id: 3, description: "none", specialty: "Pédiatrie" },
  { id: 4, description: "none", specialty: "Neurologie" },
];