import {
  PrismaClient,
  UserRole,
  UserGenre,
  BloodType,
  AppointmentStatus,
  SubscriptionStatus,
  SubscriptionPlan,
  SubscriberType,
  ReviewStatus,
  ReviewTargetType,
  HospitalStatus,
  BillingInterval,
  PaymentStatus,
  PaymentMethod,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";

// Type definitions for better TypeScript support
type HospitalWithAdmin = {
  id: string;
  name: string;
  city: string;
  state: string;
  adminId: string;
};

type DoctorWithUser = {
  id: string;
  userId: string;
  hospitalId: string | null;
};

type PatientWithUser = {
  id: string;
  userId: string;
};

type Subscriber = { type: SubscriberType; id: string };
// type PaidPlan = Exclude<SubscriptionPlan, "FREE">;

const prisma = new PrismaClient();

const NOW = new Date();

// Malian data
const malianFirstNames = {
  male: [
    "Amadou",
    "Moussa",
    "Ibrahim",
    "Seydou",
    "Oumar",
    "Mamadou",
    "Souleymane",
    "Modibo",
    "Boubacar",
    "Abdoulaye",
    "Cheick",
    "Adama",
    "Issa",
    "Bakary",
    "Drissa",
    "Lassana",
    "Youssouf",
    "Mahamadou",
    "Samba",
    "Ousmane",
    "Aliou",
    "Aboubacar",
    "Sidiki",
    "Dramane",
    "Salif",
    "Alassane",
    "Djibril",
    "Idrissa",
    "Kassim",
    "Yacouba",
  ],
  female: [
    "Aminata",
    "Fatoumata",
    "Kadiatou",
    "Mariam",
    "Aïssata",
    "Oumou",
    "Rokia",
    "Fanta",
    "Hawa",
    "Djénéba",
    "Awa",
    "Assitan",
    "Ramata",
    "Bintou",
    "Sira",
    "Maimouna",
    "Nana",
    "Adiaratou",
    "Safiatou",
    "Korotoumou",
    "Djeneba",
    "Salimata",
    "Natenin",
    "Assetou",
    "Kadidia",
    "Coumba",
    "Diahara",
    "Niakalé",
    "Sitan",
    "Tenin",
  ],
};

const malianLastNames = [
  "Keita",
  "Traoré",
  "Diarra",
  "Coulibaly",
  "Sissoko",
  "Touré",
  "Koné",
  "Dembélé",
  "Diallo",
  "Sidibé",
  "Sangaré",
  "Konaté",
  "Camara",
  "Doumbia",
  "Cissé",
  "Diakité",
  "Kanté",
  "Samaké",
  "Maïga",
  "Bagayoko",
  "Fané",
  "Sacko",
  "Kouyaté",
  "Berthé",
  "Sylla",
  "Fofana",
  "Diawara",
  "Yattara",
  "Soumaré",
  "Guindo",
];

const malianCities = [
  "Bamako",
  "Sikasso",
  "Ségou",
  "Mopti",
  "Koutiala",
  "Kayes",
  "Gao",
  "Kati",
  "San",
  "Koulikoro",
  "Tombouctou",
  "Nioro du Sahel",
  "Bougouni",
  "Kidal",
  "Kolondiéba",
  "Banamba",
  "Niono",
  "Dioïla",
  "Yorosso",
  "Bankass",
];

// Sélection exacte de 3 hôpitaux pour la démo
const malianHospitals = [
  { name: "Hôpital Gabriel Touré", city: "Bamako", type: "public" },
  { name: "Hôpital du Point G", city: "Bamako", type: "public" },
  {
    name: "Polyclinique Internationale Bamako",
    city: "Bamako",
    type: "private",
  },
];

const departments = [
  {
    name: "Cardiologie",
    description: "Traitement des maladies du cœur et des vaisseaux sanguins",
  },
  {
    name: "Pédiatrie",
    description: "Soins médicaux pour les enfants et les adolescents",
  },
  {
    name: "Gynécologie-Obstétrique",
    description:
      "Soins de santé des femmes, notamment pendant la grossesse et l'accouchement",
  },
  {
    name: "Chirurgie Générale",
    description: "Interventions chirurgicales diverses",
  },
  {
    name: "Médecine Interne",
    description: "Diagnostic et traitement non chirurgical des maladies",
  },
];

const specialities = [
  {
    value: "generaliste",
    label: "Médecin Généraliste",
    synonyms: ["généraliste", "médecine générale"],
  },
  { value: "pediatre", label: "Pédiatre" },
  {
    value: "gyneco_obstetrique",
    label: "Gynécologie-Obstétrique",
    synonyms: ["gynécologue", "obstétricien"],
  },
  { value: "cardiologie", label: "Cardiologue" },
  {
    value: "dermatologie",
    label: "Dermatologue / Vénérologue",
    synonyms: ["dermato", "vénérologie"],
  },
  { value: "ophtalmologie", label: "Ophtalmologue", synonyms: ["ophtalmo"] },
  { value: "orl", label: "ORL (Oto-Rhino-Laryngologie)" },
  {
    value: "chirurgie_generale",
    label: "Chirurgie générale",
    synonyms: ["chirurgien"],
  },
  { value: "ortho_traumato", label: "Orthopédie - Traumatologie" },
  {
    value: "anesthesie_rea",
    label: "Anesthésie - Réanimation",
    synonyms: ["anesthésiste"],
  },
  { value: "neurologie", label: "Neurologue" },
  { value: "psychiatrie", label: "Psychiatre" },
  {
    value: "radiologie",
    label: "Radiologie & Imagerie",
    synonyms: ["radiologue", "imagerie"],
  },
  { value: "gastro_hepato", label: "Gastro-entérologie & Hépatologie" },
  { value: "pneumologie", label: "Pneumologue" },
  { value: "nephrologie", label: "Néphrologue" },
  { value: "endocrino_diabeto", label: "Endocrinologie - Diabétologie" },
  { value: "rhumatologie", label: "Rhumatologie" },
  { value: "hematologie", label: "Hématologie" },
  { value: "oncologie", label: "Oncologie médicale" },
  {
    value: "infectiologie",
    label: "Infectiologie / Médecine Tropicale",
    synonyms: ["médecine tropicale", "paludisme", "tb"],
  },
  { value: "sante_publique", label: "Santé Publique / Communautaire" },
  { value: "medecine_interne", label: "Médecine Interne" },
  {
    value: "biologie_medicale",
    label: "Biologie Médicale / Laboratoire",
    synonyms: ["médecin de labo"],
  },
  { value: "odontostomatologie", label: "Odonto-stomatologie (Dentiste)" },
  { value: "urologie", label: "Urologue" },
] as const;

const medicalConditions = [
  "Hypertension artérielle",
  "Diabète de type 2",
  "Paludisme",
  "Tuberculose",
  "VIH/SIDA",
  "Asthme",
  "Drépanocytose",
  "Hépatite B",
  "Malnutrition",
  "Infections respiratoires",
  "Maladies diarrhéiques",
  "Fièvre typhoïde",
  "Méningite",
  "Rhumatisme articulaire aigu",
  "Insuffisance rénale chronique",
  "Anémie",
  "Glaucome",
  "Cataracte",
  "Arthrose",
  "Ulcère gastrique",
];

const medications = [
  { name: "Paracétamol", dosage: "500mg", frequency: "3 fois par jour" },
  { name: "Amoxicilline", dosage: "250mg", frequency: "2 fois par jour" },
  { name: "Ibuprofène", dosage: "400mg", frequency: "3 fois par jour" },
  { name: "Métronidazole", dosage: "500mg", frequency: "2 fois par jour" },
  { name: "Ciprofloxacine", dosage: "500mg", frequency: "2 fois par jour" },
  {
    name: "Artéméther/Luméfantrine",
    dosage: "20/120mg",
    frequency: "2 fois par jour pendant 3 jours",
  },
  { name: "Cotrimoxazole", dosage: "800/160mg", frequency: "2 fois par jour" },
  { name: "Métformine", dosage: "500mg", frequency: "2 fois par jour" },
  { name: "Glibenclamide", dosage: "5mg", frequency: "1 fois par jour" },
  { name: "Amlodipine", dosage: "5mg", frequency: "1 fois par jour" },
  { name: "Hydrochlorothiazide", dosage: "25mg", frequency: "1 fois par jour" },
  { name: "Salbutamol", dosage: "2mg", frequency: "3 fois par jour" },
  { name: "Oméprazole", dosage: "20mg", frequency: "1 fois par jour" },
  {
    name: "Fer/Acide folique",
    dosage: "200mg/0.4mg",
    frequency: "1 fois par jour",
  },
  { name: "Diazépam", dosage: "5mg", frequency: "Au besoin" },
];

// Helper function to generate a random date within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Helper function to generate a random integer within a range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to pick a random item from an array
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to pick a random speciality
function randomSpeciality<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to generate a random boolean with a given probability
function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// ---------- TIME HELPERS (no hard-coded 2024) ----------

function subMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

function randomDateInRange(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Helper function to generate a random phone number in Mali format
function generateMalianPhoneNumber(): string {
  const prefixes = [
    "65",
    "66",
    "67",
    "68",
    "69",
    "70",
    "71",
    "72",
    "73",
    "74",
    "75",
    "76",
    "77",
    "78",
    "79",
  ];
  const prefix = randomItem(prefixes);
  const suffix = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `+223${prefix}${suffix}`;
}

// Helper function to generate a random email
function generateEmail(
  firstName: string,
  lastName: string,
  domain: string
): string {
  // Remove accents and special characters
  const normalizedFirstName = firstName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const normalizedLastName = lastName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const options = [
    `${normalizedFirstName}.${normalizedLastName}@${domain}`,
    `${normalizedFirstName}${randomInt(1, 99)}@${domain}`,
    `${normalizedFirstName[0]}${normalizedLastName}@${domain}`,
    `${normalizedFirstName}@${domain}`,
  ];

  return randomItem(options);
}

async function upsertPlanWithPrices(
  code: SubscriptionPlan,
  name: string,
  description: string,
  limits: Partial<{
    maxAppointments: number | null;
    maxPatients: number | null;
    maxDoctorsPerHospital: number | null;
    storageGb: number | null;
  }>,
  prices: Array<{
    subscriberType: SubscriberType; // DOCTOR | HOSPITAL
    interval: BillingInterval; // MONTH | YEAR
    currency: string; // e.g. XOF
    amount: number; // numeric, we cast to Decimal
  }>
) {
  const plan = await prisma.planConfig.upsert({
    where: { code },
    create: {
      code,
      name,
      description,
      // keep placeholders for compatibility
      price: 0,
      currency: "XOF",
      interval: "MONTH",
      isActive: true,
      limits: { create: { ...limits } },
    },
    update: {
      name,
      description,
      isActive: true,
      limits: {
        upsert: {
          create: { ...limits },
          update: { ...limits },
        },
      },
    },
    include: { prices: true },
  });

  // sync PlanPrice rows
  for (const p of prices) {
    await prisma.planPrice.upsert({
      where: {
        planConfigId_subscriberType_interval_currency: {
          planConfigId: plan.id,
          subscriberType: p.subscriberType,
          interval: p.interval,
          currency: p.currency,
        },
      },
      create: {
        planConfigId: plan.id,
        subscriberType: p.subscriberType,
        interval: p.interval,
        currency: p.currency,
        amount: new Prisma.Decimal(p.amount.toFixed(2)),
        isActive: true,
      },
      update: {
        amount: new Prisma.Decimal(p.amount.toFixed(2)),
        isActive: true,
      },
    });
  }
}

/////?????
// Current month window (Africa/Bamako Oct 2025)
const CURRENT_MONTH_START = new Date(
  NOW.getFullYear(),
  NOW.getMonth(),
  1,
  0,
  0,
  0,
  0
); // 2025-10-01

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function monthStart(y: number, m0: number) {
  return new Date(y, m0, 1, 0, 0, 0, 0);
}
function monthEnd(y: number, m0: number) {
  return new Date(y, m0 + 1, 0, 23, 59, 59, 999);
}

function yyyymm(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Pull price from PlanPrice for robustness
async function priceForFromDB(
  plan: SubscriptionPlan,
  subscriberType: SubscriberType,
  currency = "XOF" as const
) {
  const cfg = await prisma.planConfig.findUnique({
    where: { code: plan },
    include: { prices: true },
  });
  const match = cfg?.prices.find(
    (p) =>
      p.subscriberType === subscriberType &&
      p.interval === "MONTH" &&
      p.currency === currency
  );
  if (!match)
    throw new Error(
      `Missing PlanPrice for ${plan}/${subscriberType}/${currency}`
    );
  return { amount: match.amount, currency: match.currency as "XOF" };
}

function finalStatusForCycle(
  periodEnd: Date,
  lastPayment: PaymentStatus | null
) {
  if (periodEnd < NOW) return SubscriptionStatus.EXPIRED;
  if (lastPayment === "FAILED" || lastPayment === "PENDING")
    return SubscriptionStatus.INACTIVE;
  return SubscriptionStatus.ACTIVE;
}

/**
 * Always end in the CURRENT month (Oct-2025).
 * Months count is either 3 or 4. First month is FREE (TRIAL).
 * Example (3 months): Aug(FREE) -> Sep(paid) -> Oct(paid [ACTIVE/INACTIVE])
 * Example (4 months): Jul(FREE) -> Aug(paid) -> Sep(paid) -> Oct(paid [ACTIVE/INACTIVE])
 * A single Subscription row is kept and updated to the last cycle (Oct).
 * All paid months are written to SubscriptionPayment (FREE month has no payment).
 */
async function seedAnchoredTimelineToCurrentMonth(subscriber: Subscriber) {
  // decide 3 or 4 months total
  const totalMonths = Math.random() < 0.5 ? 3 : 4;

  const y = CURRENT_MONTH_START.getFullYear();
  const m0 = CURRENT_MONTH_START.getMonth(); // 9 for October

  // Build the exact months from oldest -> newest, always ending in October
  // For 3: [Aug, Sep, Oct]; For 4: [Jul, Aug, Sep, Oct]
  const months: { start: Date; end: Date }[] = [];
  for (let back = totalMonths - 1; back >= 0; back--) {
    const ms = monthStart(y, m0 - back);
    const me = monthEnd(y, m0 - back);
    months.push({ start: ms, end: me });
  }

  // First month is FREE (TRIAL)
  const freeStart = months[0].start;
  const freeEnd = months[0].end;

  // Ensure single subscription row for this subscriber
  const sub = await prisma.subscription.upsert({
    where:
      subscriber.type === "DOCTOR"
        ? { doctorId: subscriber.id }
        : { hospitalId: subscriber.id },
    create: {
      subscriberType: subscriber.type,
      doctorId: subscriber.type === "DOCTOR" ? subscriber.id : null,
      hospitalId: subscriber.type === "HOSPITAL" ? subscriber.id : null,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.TRIAL,
      startDate: freeStart,
      endDate: freeEnd,
      amount: new Prisma.Decimal(0),
      currency: "XOF",
      autoRenew: true,
    },
    update: {
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.TRIAL,
      startDate: freeStart,
      endDate: freeEnd,
      amount: new Prisma.Decimal(0),
      currency: "XOF",
      autoRenew: true,
    },
  });

  // Remaining months are paid (STANDARD or PREMIUM)
  // Past months: always COMPLETED; Current month: 60% COMPLETED, 40% FAILED/PENDING
  let lastOutcome: PaymentStatus | null = null;
  for (let i = 1; i < months.length; i++) {
    const { start, end } = months[i];
    const isCurrent = sameMonth(start, CURRENT_MONTH_START);

    const plan =
      Math.random() < 0.65
        ? SubscriptionPlan.STANDARD
        : SubscriptionPlan.PREMIUM;

    const { amount, currency } = await priceForFromDB(plan, subscriber.type);

    const outcome: PaymentStatus = isCurrent
      ? Math.random() < 0.6
        ? "COMPLETED"
        : Math.random() < 0.7
          ? "FAILED"
          : "PENDING"
      : "COMPLETED";

    await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: sub.id,
        amount,
        currency,
        paymentMethod: PaymentMethod.MOBILE_MONEY,
        transactionId:
          outcome === "COMPLETED"
            ? `OM-${yyyymm(start)}-${randomInt(100000, 999999)}`
            : null,
        status: outcome,
        paymentDate: randomDateInRange(
          new Date(start.getTime() - 3 * 86400000),
          new Date(start.getTime() + 7 * 86400000)
        ),
        months: 1,
        changePlanTo: plan,
        externalOrderId: `REN-${sub.id}-${yyyymm(start)}-${randomInt(1000, 9999)}`,
        payToken:
          outcome !== "FAILED" ? `tok_${randomInt(100000, 999999)}` : null,
        provider: "ORANGE_MONEY",
        periodStart: start,
        periodEnd: end,
      },
    });

    // Move the single Subscription row to this new cycle window
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        plan,
        startDate: start,
        endDate: end,
        amount,
        currency,
        status: finalStatusForCycle(end, outcome),
      },
    });

    lastOutcome = outcome;
  }

  // Rare ops override: keep ACTIVE even if Oct failed (5%)
  if (lastOutcome && lastOutcome !== "COMPLETED" && Math.random() < 0.05) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: SubscriptionStatus.ACTIVE },
    });
  }
}

async function main() {
  console.log("Starting database seeding...");
  const usedEmails = new Set<string>();

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.prescription.deleteMany();
  await prisma.prescriptionOrder.deleteMany();
  await prisma.medicalRecordAttachment.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.vitalSign.deleteMany();
  await prisma.medicalHistory.deleteMany();
  await prisma.doctorAvailability.deleteMany();
  await prisma.review.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.department.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.subscriptionPayment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.planLimits.deleteMany();
  await prisma.planPrice.deleteMany();
  await prisma.planConfig.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.account.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // Seed plan configurations with prices
  console.log("Seeding plan configurations...");

  await upsertPlanWithPrices(
    "FREE",
    "Free",
    "Offre gratuite",
    {
      maxAppointments: 50,
      maxPatients: 50,
      storageGb: 1,
      maxDoctorsPerHospital: 5,
    },
    [
      {
        subscriberType: "DOCTOR",
        interval: "MONTH",
        currency: "XOF",
        amount: 0,
      },
      {
        subscriberType: "HOSPITAL",
        interval: "MONTH",
        currency: "XOF",
        amount: 0,
      },
    ]
  );

  await upsertPlanWithPrices(
    "STANDARD",
    "Standard",
    "Pour les pros individuels / petites structures",
    {
      maxAppointments: 1000,
      maxPatients: 1000,
      storageGb: 10,
      maxDoctorsPerHospital: 10,
    },
    [
      {
        subscriberType: "DOCTOR",
        interval: "MONTH",
        currency: "XOF",
        amount: 10_000,
      },
      {
        subscriberType: "HOSPITAL",
        interval: "MONTH",
        currency: "XOF",
        amount: 50_000,
      },
    ]
  );

  await upsertPlanWithPrices(
    "PREMIUM",
    "Premium",
    "Pour les structures exigeantes",
    {
      maxAppointments: null,
      maxPatients: null,
      storageGb: null,
      maxDoctorsPerHospital: null,
    },
    [
      {
        subscriberType: "DOCTOR",
        interval: "MONTH",
        currency: "XOF",
        amount: 25_000,
      },
      {
        subscriberType: "HOSPITAL",
        interval: "MONTH",
        currency: "XOF",
        amount: 100_000,
      },
    ]
  );

  console.log("Creating users...");

  // Create a super admin user
  const superAdminPassword = await hash("@Mitic123", 10);
  const superAdminEmail = "admin@mitic.com";
  usedEmails.add(superAdminEmail);
  const superAdmin = await prisma.user.create({
    data: {
      name: "Admin Système",
      email: superAdminEmail,
      phone: "+22370000001",
      password: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
      isApproved: true,
      isActive: true,
      profile: {
        create: {
          address: "123 Avenue de l'Indépendance",
          city: "Bamako",
          state: "District de Bamako",
          zipCode: "999",
          country: "Mali",
          bio: "Administrateur système de la plateforme de santé",
          genre: UserGenre.MALE,
        },
      },
    },
  });

  console.log("Super admin created:", superAdmin.email);

  // Create hospitals with admin users
  console.log("Creating hospitals and hospital admins...");
  const createdHospitals: HospitalWithAdmin[] = [];

  for (const hospital of malianHospitals) {
    let adminEmail: string;
    let attempts = 0;
    const adminFirstName = randomItem(malianFirstNames.male);
    const adminLastName = randomItem(malianLastNames);

    // Keep generating emails until we get a unique one
    do {
      adminEmail = generateEmail(
        adminFirstName + (attempts > 0 ? attempts : ""),
        adminLastName,
        "mitic.com"
      );
      attempts++;
    } while (usedEmails.has(adminEmail) && attempts < 10);

    usedEmails.add(adminEmail);

    const adminPhone = generateMalianPhoneNumber();
    const adminPassword = await hash("@Mitic123", 10);

    const city = hospital.city;

    const hospitalAdmin = await prisma.user.create({
      data: {
        name: `${adminFirstName} ${adminLastName}`,
        email: adminEmail,
        phone: adminPhone,
        password: adminPassword,
        role: UserRole.HOSPITAL_ADMIN,
        emailVerified: new Date(),
        isApproved: true,
        isActive: true,
        profile: {
          create: {
            avatarUrl: "https://avatar.iran.liara.run/public",
            address: `${randomInt(1, 999)} Rue ${randomInt(100, 999)}`,
            city: city,
            state:
              city === "Bamako" ? "District de Bamako" : "Région de " + city,
            zipCode: "999",
            country: "Mali",
            bio: `Administrateur de l'hôpital ${hospital.name}`,
            genre: UserGenre.MALE,
          },
        },
      },
    });

    const createdHospital = await prisma.hospital.create({
      data: {
        name: hospital.name,
        adminId: hospitalAdmin.id,
        address: `${randomInt(1, 999)} Avenue ${randomItem(["de la Liberté", "de l'Indépendance", "de la République", "de la Paix", "du Progrès"])}`,
        city: city,
        state: city === "Bamako" ? "District de Bamako" : "Région de " + city,
        country: "Mali",
        phone: generateMalianPhoneNumber(),
        email: `contact@${hospital.name.toLowerCase().replace(/[^\w]/g, "")}.ml`,
        website: randomBoolean(0.7)
          ? `https://www.${hospital.name.toLowerCase().replace(/[^\w]/g, "")}.ml`
          : null,
        description: `${hospital.name} est un établissement de santé ${hospital.type === "public" ? "public" : "privé"} situé à ${city}, offrant des soins médicaux de qualité à la population.`,
        logoUrl: `https://avatar.iran.liara.run/username?username=${hospital.name.toUpperCase().split(" ").join("+")}`,
        isVerified: true,
        status: HospitalStatus.ACTIVE,
      },
    });

    createdHospitals.push({
      id: createdHospital.id,
      name: createdHospital.name,
      city: createdHospital.city,
      state: createdHospital.state,
      adminId: createdHospital.adminId,
    });

    // Create subscription for hospital
    await seedAnchoredTimelineToCurrentMonth({
      type: SubscriberType.HOSPITAL,
      id: createdHospital.id,
    });

    // Create departments for each hospital
    const hospitalDepartments: {
      id: string;
      createdAt: Date;
      hospitalId: string;
      updatedAt: Date;
      name: string;
      description: string | null;
    }[] = [];
    const numDepartments = randomInt(5, departments.length);

    // Randomly select departments for this hospital
    const shuffledDepartments = [...departments].sort(
      () => 0.5 - Math.random()
    );
    const selectedDepartments = shuffledDepartments.slice(0, numDepartments);

    for (const dept of selectedDepartments) {
      const createdDepartment = await prisma.department.create({
        data: {
          name: dept.name,
          hospitalId: createdHospital.id,
          description: dept.description,
        },
      });
      hospitalDepartments.push(createdDepartment);
    }

    console.log(
      `Created hospital: ${createdHospital.name} with ${hospitalDepartments.length} departments`
    );
  }

  // Create doctors (both hospital and independent)
  console.log("Creating doctors...");
  const createdDoctors: DoctorWithUser[] = [];

  // Create hospital doctors (5 per hospital)
  for (const hospital of createdHospitals) {
    // Get departments for this hospital
    const hospitalDepartments = await prisma.department.findMany({
      where: { hospitalId: hospital.id },
    });

    // Create 5 doctors for this hospital
    for (let i = 0; i < 5; i++) {
      const gender = randomBoolean() ? "male" : "female";
      const firstName = randomItem(malianFirstNames[gender]);
      const lastName = randomItem(malianLastNames);
      const phone = generateMalianPhoneNumber();
      const password = await hash("@Mitic123", 10);

      let doctorEmail: string;
      let attempts = 0;

      do {
        doctorEmail = generateEmail(
          firstName + (attempts > 0 ? attempts : ""),
          lastName,
          "healthcaremali.com"
        );
        attempts++;
      } while (usedEmails.has(doctorEmail) && attempts < 10);

      usedEmails.add(doctorEmail);

      // Assign to a random department in this hospital
      const department = randomItem(hospitalDepartments);

      const doctorUser = await prisma.user.create({
        data: {
          name: `Dr. ${firstName} ${lastName}`,
          email: doctorEmail,
          phone: phone,
          password: password,
          role: UserRole.HOSPITAL_DOCTOR,
          emailVerified: new Date(),
          isApproved: true,
          isActive: true,
          profile: {
            create: {
              address: `${randomInt(1, 999)} Rue ${randomInt(100, 999)}`,
              city: hospital.city,
              state: hospital.state,
              zipCode: "999",
              country: "Mali",
              bio: `Médecin hospitalier spécialisé en ${randomSpeciality(specialities).label}.`,
              genre: gender === "male" ? UserGenre.MALE : UserGenre.FEMALE,
            },
          },
        },
      });

      const doctor = await prisma.doctor.create({
        data: {
          userId: doctorUser.id,
          hospitalId: hospital.id,
          departmentId: department.id,
          specialization: randomSpeciality(specialities).value,
          licenseNumber: `ML-DOC-${randomInt(10000, 99999)}`,
          education: `Doctorat en Médecine, Université de ${randomItem(["Bamako", "Ségou", "Sikasso", "Dakar", "Abidjan", "Rabat"])}`,
          experience: `${randomInt(1, 25)} ans d'expérience en ${randomSpeciality(specialities).label}`,
          isVerified: true,
          isIndependent: false,
          availableForChat: randomBoolean(0.7),
          consultationFee: new Prisma.Decimal(randomInt(10000, 50000)),
        },
      });

      createdDoctors.push({
        id: doctor.id,
        userId: doctor.userId,
        hospitalId: doctor.hospitalId,
      });

      // Create doctor availabilities
      const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
      const workingDays = daysOfWeek.filter(() => randomBoolean(0.7)); // Randomly select working days

      for (const day of workingDays) {
        const startHour = randomInt(8, 10);
        const endHour = randomInt(16, 18);

        await prisma.doctorAvailability.create({
          data: {
            doctorId: doctor.id,
            dayOfWeek: day,
            startTime: `${startHour}:00`,
            endTime: `${endHour}:00`,
            slotDuration: 60,
            isActive: true,
          },
        });
      }
    }
  }

  // Create independent doctors (exactly 5)
  for (let i = 0; i < 5; i++) {
    const gender = randomBoolean() ? "male" : "female";
    const firstName = randomItem(malianFirstNames[gender]);
    const lastName = randomItem(malianLastNames);
    const phone = generateMalianPhoneNumber();
    const password = await hash("@Mitic123", 10);
    const city = randomItem(malianCities);

    let doctorEmail: string;
    let attempts = 0;

    do {
      doctorEmail = generateEmail(
        firstName + (attempts > 0 ? attempts : ""),
        lastName,
        "healthcaremali.com"
      );
      attempts++;
    } while (usedEmails.has(doctorEmail) && attempts < 10);

    usedEmails.add(doctorEmail);

    const doctorUser = await prisma.user.create({
      data: {
        name: `Dr. ${firstName} ${lastName}`,
        email: doctorEmail,
        phone: phone,
        password: password,
        role: UserRole.INDEPENDENT_DOCTOR,
        emailVerified: new Date(),
        isApproved: true,
        isActive: true,
        profile: {
          create: {
            address: `${randomInt(1, 999)} Rue ${randomInt(100, 999)}`,
            city: city,
            state:
              city === "Bamako" ? "District de Bamako" : `Région de ${city}`,
            zipCode: "999",
            country: "Mali",
            bio: `Médecin indépendant spécialisé en ${randomSpeciality(specialities).label}.`,
            genre: gender === "male" ? UserGenre.MALE : UserGenre.FEMALE,
          },
        },
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        hospitalId: null,
        departmentId: null,
        specialization: randomSpeciality(specialities).value,
        licenseNumber: `ML-DOC-${randomInt(10000, 99999)}`,
        education: `Doctorat en Médecine, Université de ${randomItem(["Bamako", "Ségou", "Sikasso", "Dakar", "Abidjan", "Rabat"])}`,
        experience: `${randomInt(1, 25)} ans d'expérience en ${randomSpeciality(specialities).label}`,
        isVerified: true,
        isIndependent: true,
        availableForChat: randomBoolean(0.7),
        consultationFee: new Prisma.Decimal(randomInt(10000, 50000)),
      },
    });

    createdDoctors.push({
      id: doctor.id,
      userId: doctor.userId,
      hospitalId: doctor.hospitalId,
    });

    // Create doctor availabilities
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    const workingDays = daysOfWeek.filter(() => randomBoolean(0.7)); // Randomly select working days

    for (const day of workingDays) {
      const startHour = randomInt(8, 10);
      const endHour = randomInt(16, 18);

      await prisma.doctorAvailability.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: `${startHour}:00`,
          endTime: `${endHour}:00`,
          slotDuration: 60,
          isActive: true,
        },
      });
    }

    await seedAnchoredTimelineToCurrentMonth({
      type: SubscriberType.DOCTOR,
      id: doctor.id,
    });
  }

  console.log(`Created ${createdDoctors.length} doctors`);

  // Create patients
  console.log("Creating patients...");
  const createdPatients: PatientWithUser[] = [];

  // Create exactly 30 patients
  for (let i = 0; i < 30; i++) {
    const gender = randomBoolean() ? "male" : "female";
    const firstName = randomItem(malianFirstNames[gender]);
    const lastName = randomItem(malianLastNames);
    const phone = generateMalianPhoneNumber();
    const password = await hash("@Mitic123", 10);
    const city = randomItem(malianCities);

    let patientEmail: string;
    let attempts = 0;

    do {
      patientEmail = generateEmail(
        firstName + (attempts > 0 ? attempts : ""),
        lastName,
        randomItem(["gmail.com", "yahoo.fr", "hotmail.com", "outlook.com"])
      );
      attempts++;
    } while (usedEmails.has(patientEmail) && attempts < 10);

    usedEmails.add(patientEmail);

    const patientUser = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: patientEmail,
        phone: phone,
        password: password,
        role: UserRole.PATIENT,
        emailVerified: randomBoolean(0.8) ? new Date() : null,
        dateOfBirth: randomDate(new Date(1950, 0, 1), new Date(2005, 11, 31)),
        isApproved: true,
        isActive: true,
        profile: {
          create: {
            address: `${randomInt(1, 999)} Rue ${randomInt(100, 999)}`,
            city: city,
            state:
              city === "Bamako" ? "District de Bamako" : `Région de ${city}`,
            zipCode: "999",
            country: "Mali",
            bio: null,
            genre: gender === "male" ? UserGenre.MALE : UserGenre.FEMALE,
          },
        },
      },
    });

    const patient = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        bloodType: randomItem([
          BloodType.A_POSITIVE,
          BloodType.A_NEGATIVE,
          BloodType.B_POSITIVE,
          BloodType.B_NEGATIVE,
          BloodType.AB_POSITIVE,
          BloodType.AB_NEGATIVE,
          BloodType.O_POSITIVE,
          BloodType.O_NEGATIVE,
        ]),
        allergies: randomBoolean(0.3)
          ? `Allergie à ${randomItem(["la pénicilline", "l'aspirine", "les arachides", "les fruits de mer", "le lactose"])}`
          : null,
        emergencyContact: randomBoolean(0.7)
          ? `${randomItem(malianFirstNames.male)} ${randomItem(malianLastNames)}`
          : null,
        emergencyPhone: randomBoolean(0.7) ? generateMalianPhoneNumber() : null,
        emergencyRelation: randomBoolean(0.7)
          ? randomItem([
              "Père",
              "Mère",
              "Frère",
              "Sœur",
              "Conjoint(e)",
              "Ami(e)",
            ])
          : null,
        insuranceProvider: randomBoolean(0.4)
          ? randomItem([
              "INPS",
              "CANAM",
              "AMO",
              "Assurance Lafia",
              "Saham Assurance",
            ])
          : null,
        insuranceNumber: randomBoolean(0.4)
          ? `INS-${randomInt(10000, 99999)}`
          : null,
        medicalNotes: randomBoolean(0.3)
          ? `Patient avec antécédents de ${randomItem(medicalConditions)}`
          : null,
      },
    });

    createdPatients.push({
      id: patient.id,
      userId: patient.userId,
    });

    // Create medical histories for some patients
    if (randomBoolean(0.7)) {
      const numHistories = randomInt(1, 3);

      for (let j = 0; j < numHistories; j++) {
        const condition = randomItem(medicalConditions);
        const doctor = randomItem(createdDoctors);

        await prisma.medicalHistory.create({
          data: {
            patientId: patient.id,
            doctorId: doctor.id,
            title: `Antécédent de ${condition}`,
            condition: condition,
            diagnosedDate: randomDate(new Date(2023, 0, 1), new Date()),
            status: randomItem(["ACTIVE", "RESOLVED", "CHRONIC"]),
            details: `Patient diagnostiqué avec ${condition}. ${randomBoolean() ? "Traitement en cours." : "Condition sous contrôle."}`,
            createdBy: doctor.userId,
          },
        });
      }
    }

    // Create vital signs for some patients
    if (randomBoolean(0.6)) {
      const numVitalSigns = randomInt(1, 3);

      for (let j = 0; j < numVitalSigns; j++) {
        await prisma.vitalSign.create({
          data: {
            patientId: patient.id,
            temperature: randomBoolean(0.8)
              ? new Prisma.Decimal(36.5 + Math.random() * 2).toFixed(1)
              : null,
            heartRate: randomBoolean(0.8) ? randomInt(60, 100) : null,
            bloodPressureSystolic: randomBoolean(0.8)
              ? randomInt(100, 140)
              : null,
            bloodPressureDiastolic: randomBoolean(0.8)
              ? randomInt(60, 90)
              : null,
            respiratoryRate: randomBoolean(0.7) ? randomInt(12, 20) : null,
            oxygenSaturation: randomBoolean(0.7) ? randomInt(95, 100) : null,
            weight: randomBoolean(0.8)
              ? new Prisma.Decimal(50 + Math.random() * 50).toFixed(1)
              : null,
            height: randomBoolean(0.8)
              ? new Prisma.Decimal(150 + Math.random() * 50).toFixed(1)
              : null,
            notes: randomBoolean(0.3) ? "Signes vitaux normaux" : null,
            recordedAt: randomDateInRange(
              subMonths(NOW, 18), // up to 18 months back
              addMonths(NOW, 2) // a little into the future
            ),
          },
        });
      }
    }
  }

  console.log(`Created ${createdPatients.length} patients`);

  // Create appointments with proper distribution
  console.log("Creating appointments...");

  // Helper function to get a random time slot within doctor availability
  async function getAppointmentTimeSlot(
    doctorId: string,
    targetDate: Date
  ): Promise<{ start: Date; end: Date } | null> {
    const dayOfWeek = targetDate.getDay();
    const availabilities = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (availabilities.length === 0) return null;

    const availability = randomItem(availabilities);
    const [startHour, startMin] = availability.startTime.split(":").map(Number);
    const [endHour, endMin] = availability.endTime.split(":").map(Number);

    const slotStart = new Date(targetDate);
    slotStart.setHours(startHour, startMin || 0, 0, 0);
    const slotEnd = new Date(targetDate);
    slotEnd.setHours(endHour, endMin || 0, 0, 0);

    // Pick a random time within the availability window
    const totalMinutes =
      (endHour - startHour) * 60 + (endMin || 0) - (startMin || 0);
    const slotDuration = availability.slotDuration || 60;
    const maxSlots = Math.floor(totalMinutes / slotDuration);
    if (maxSlots === 0) return null;

    const slotIndex = randomInt(0, maxSlots - 1);
    const appointmentStart = new Date(slotStart);
    appointmentStart.setMinutes(
      appointmentStart.getMinutes() + slotIndex * slotDuration
    );
    const appointmentEnd = new Date(appointmentStart);
    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + slotDuration);

    return { start: appointmentStart, end: appointmentEnd };
  }

  // Get hospital doctors only (for hospital admin dashboard consistency)
  const hospitalDoctors = createdDoctors.filter((d) => d.hospitalId !== null);

  const appointmentsToCreate: Array<{
    patient: PatientWithUser;
    doctor: DoctorWithUser;
    date: Date;
    weight: number;
  }> = [];

  // Current month appointments (heavily weighted)
  const currentMonthStart = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
  const currentMonthEnd = new Date(
    NOW.getFullYear(),
    NOW.getMonth() + 1,
    0,
    23,
    59,
    59
  );
  const currentMonthCount = Math.floor(createdPatients.length * 8 * 0.4);

  for (let i = 0; i < currentMonthCount; i++) {
    const patient = randomItem(createdPatients);
    // Prefer hospital doctors for hospital admin dashboard
    const doctor =
      Math.random() < 0.7
        ? randomItem(
            hospitalDoctors.length > 0 ? hospitalDoctors : createdDoctors
          )
        : randomItem(createdDoctors);
    const date = randomDateInRange(currentMonthStart, currentMonthEnd);
    appointmentsToCreate.push({ patient, doctor, date, weight: 1 });
  }

  // Last 3 months appointments
  const threeMonthsAgo = subMonths(NOW, 3);
  const threeMonthsCount = Math.floor(createdPatients.length * 8 * 0.3);

  for (let i = 0; i < threeMonthsCount; i++) {
    const patient = randomItem(createdPatients);
    const doctor =
      Math.random() < 0.7
        ? randomItem(
            hospitalDoctors.length > 0 ? hospitalDoctors : createdDoctors
          )
        : randomItem(createdDoctors);
    const date = randomDateInRange(threeMonthsAgo, currentMonthStart);
    appointmentsToCreate.push({ patient, doctor, date, weight: 1 });
  }

  // Last 6 months appointments
  const sixMonthsAgo = subMonths(NOW, 6);
  const sixMonthsCount = Math.floor(createdPatients.length * 8 * 0.2);

  for (let i = 0; i < sixMonthsCount; i++) {
    const patient = randomItem(createdPatients);
    const doctor = randomItem(createdDoctors);
    const date = randomDateInRange(sixMonthsAgo, threeMonthsAgo);
    appointmentsToCreate.push({ patient, doctor, date, weight: 1 });
  }

  // Older and future appointments
  const olderCount = Math.floor(createdPatients.length * 8 * 0.1);

  for (let i = 0; i < olderCount; i++) {
    const patient = randomItem(createdPatients);
    const doctor = randomItem(createdDoctors);
    // Mix of past (12 months ago) and future (up to 2 months ahead)
    const date = randomBoolean(0.7)
      ? randomDateInRange(subMonths(NOW, 12), sixMonthsAgo)
      : randomDateInRange(currentMonthEnd, addMonths(NOW, 2));
    appointmentsToCreate.push({ patient, doctor, date, weight: 1 });
  }

  // Create appointments with proper time slots and statuses
  for (const { patient, doctor, date } of appointmentsToCreate) {
    const hospitalId = doctor.hospitalId;

    // Try to align with doctor availability
    let appointmentDateTime: Date;
    let endDateTime: Date;

    const timeSlot = await getAppointmentTimeSlot(doctor.id, date);
    if (timeSlot) {
      appointmentDateTime = timeSlot.start;
      endDateTime = timeSlot.end;
    } else {
      // Fallback: use random time if no availability
      const hour = randomInt(8, 17);
      appointmentDateTime = new Date(date);
      appointmentDateTime.setHours(hour, 0, 0, 0);
      endDateTime = new Date(appointmentDateTime);
      endDateTime.setHours(appointmentDateTime.getHours() + 1);
    }

    // Determine status based on date
    const isPast = appointmentDateTime < NOW;
    const isToday = appointmentDateTime.toDateString() === NOW.toDateString();

    let status: AppointmentStatus;
    if (isPast) {
      // Past appointments: mostly completed, some canceled, few no-shows
      const rand = Math.random();
      if (rand < 0.7) {
        status = AppointmentStatus.COMPLETED;
      } else if (rand < 0.9) {
        status = AppointmentStatus.CANCELED;
      } else {
        status = AppointmentStatus.NO_SHOW;
      }
    } else if (isToday) {
      // Today: mix of pending, confirmed, and some completed
      status = randomItem([
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.COMPLETED, // Some already completed today
      ]);
    } else {
      // Future: pending or confirmed
      status = randomItem([
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CONFIRMED, // More confirmed for future
      ]);
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        hospitalId: hospitalId,
        scheduledAt: appointmentDateTime,
        startTime: appointmentDateTime,
        endTime: endDateTime,
        status: status,
        type: randomItem([
          "Consultation",
          "Suivi",
          "Urgence",
          "Examen",
          "Vaccination",
        ]),
        reason: `Consultation pour ${randomItem(medicalConditions)}`,
        notes: randomBoolean(0.5)
          ? `Patient se plaint de ${randomItem(["douleurs", "fièvre", "fatigue", "maux de tête", "toux"])}`
          : null,
        completedAt:
          status === AppointmentStatus.COMPLETED ? endDateTime : null,
        cancelledAt:
          status === AppointmentStatus.CANCELED
            ? new Date(
                appointmentDateTime.getTime() -
                  randomInt(1, 72) * 60 * 60 * 1000
              )
            : null,
        cancellationReason:
          status === AppointmentStatus.CANCELED
            ? randomItem([
                "Indisponibilité du patient",
                "Indisponibilité du médecin",
                "Urgence",
                "Raisons personnelles",
              ])
            : null,
      },
    });

    // Create medical records for completed appointments
    if (status === AppointmentStatus.COMPLETED) {
      const medicalRecord = await prisma.medicalRecord.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          appointmentId: appointment.id,
          hospitalId: hospitalId,
          diagnosis: `Patient diagnostiqué avec ${randomItem(medicalConditions)}`,
          treatment: `Traitement prescrit: ${randomItem(["médicaments", "repos", "exercices", "régime alimentaire", "chirurgie"])}`,
          notes: randomBoolean(0.7)
            ? `Patient présente des symptômes de ${randomItem(medicalConditions)} depuis ${randomInt(1, 30)} jours`
            : null,
          followUpNeeded: randomBoolean(0.6),
          followUpDate: randomBoolean(0.6)
            ? randomDateInRange(
                subMonths(NOW, 18), // up to 18 months back
                addMonths(NOW, 2) // a little into the future
              )
            : null,
        },
      });

      // Create prescriptions for some medical records
      if (randomBoolean(0.8)) {
        // Create prescription order
        const prescriptionOrder = await prisma.prescriptionOrder.create({
          data: {
            medicalRecordId: medicalRecord.id,
            doctorId: doctor.id,
            patientId: patient.id,
            issuedAt: new Date(appointmentDateTime),
            notes: randomBoolean(0.3) ? "Ordonnance standard" : null,
          },
        });

        const numMedications = randomInt(1, 3);

        for (let j = 0; j < numMedications; j++) {
          const medication = randomItem(medications);

          await prisma.prescription.create({
            data: {
              patientId: patient.id,
              doctorId: doctor.id,
              prescriptionOrderId: prescriptionOrder.id,
              medicalRecordId: medicalRecord.id,
              medicationName: medication.name,
              dosage: medication.dosage,
              frequency: medication.frequency,
              duration: `${randomInt(3, 14)} jours`,
              instructions: randomBoolean(0.7)
                ? `Prendre ${randomItem(["avant", "pendant", "après"])} les repas`
                : null,
              isActive: randomBoolean(0.9),
              startDate: new Date(appointmentDateTime),
              endDate: randomBoolean(0.8)
                ? new Date(
                    appointmentDateTime.getTime() +
                      randomInt(7, 30) * 24 * 60 * 60 * 1000
                  )
                : null,
            },
          });
        }
      }

      // Create medical record attachments for some records
      if (randomBoolean(0.3)) {
        await prisma.medicalRecordAttachment.create({
          data: {
            medicalRecordId: medicalRecord.id,
            fileName: `${randomItem(["radiographie", "analyse", "ordonnance", "rapport"])}_${randomInt(1000, 9999)}.pdf`,
            fileType: "application/pdf",
            fileUrl: `https://example.com/files/${randomInt(1000, 9999)}.pdf`,
            fileSize: randomInt(100000, 5000000),
            uploadedAt: new Date(appointmentDateTime),
          },
        });
      }
    }
  }

  console.log("Created appointments with related records");

  // Create reviews
  console.log("Creating reviews...");

  // Create reviews for doctors and hospitals
  for (let i = 0; i < 50; i++) {
    const patient = randomItem(createdPatients);
    const targetType = randomItem([
      ReviewTargetType.DOCTOR,
      ReviewTargetType.HOSPITAL,
      ReviewTargetType.PLATFORM,
    ]);

    let doctorId: string | null = null;
    let hospitalId: string | null = null;

    if (targetType === ReviewTargetType.DOCTOR) {
      doctorId = randomItem(createdDoctors).id;
    } else if (targetType === ReviewTargetType.HOSPITAL) {
      hospitalId = randomItem(createdHospitals).id;
    }

    const rating = randomInt(1, 5);
    const isPositive = rating >= 4;

    const reviewTitle = isPositive
      ? randomItem([
          `Excellente expérience`,
          `Très satisfait(e) des services`,
          `Service de qualité`,
          `Recommandé à 100%`,
          `Prise en charge parfaite`,
        ])
      : randomItem([
          `Déçu(e) par le service`,
          `Expérience à améliorer`,
          `Temps d'attente trop long`,
          `Service insuffisant`,
          `Problèmes de communication`,
        ]);

    let reviewContent: string;

    if (targetType === ReviewTargetType.DOCTOR) {
      reviewContent = isPositive
        ? randomItem([
            `Le médecin a été très professionnel et attentif à mes besoins. Il a pris le temps de m'expliquer mon traitement en détail.`,
            `Consultation très satisfaisante. Le médecin est compétent et à l'écoute. Je le recommande vivement.`,
            `Excellent suivi médical. Le docteur est ponctuel et ses explications sont claires et précises.`,
            `J'ai apprécié la qualité des soins et l'attention portée à mes préoccupations. Un médecin qui inspire confiance.`,
            `Très bonne expérience. Le médecin a fait preuve d'une grande expertise et d'une approche humaine.`,
          ])
        : randomItem([
            `Le temps d'attente était beaucoup trop long malgré mon rendez-vous. Le médecin semblait pressé pendant la consultation.`,
            `Je n'ai pas reçu suffisamment d'explications sur mon état de santé. Consultation trop rapide à mon goût.`,
            `Difficile d'obtenir un rendez-vous rapidement. Le suivi post-consultation laisse à désirer.`,
            `Le médecin n'a pas pris le temps d'écouter toutes mes préoccupations. Je me suis senti(e) expédié(e).`,
            `Communication insuffisante. Je n'ai pas bien compris mon traitement et mes questions sont restées sans réponses claires.`,
          ]);
    } else if (targetType === ReviewTargetType.HOSPITAL) {
      reviewContent = isPositive
        ? randomItem([
            `L'hôpital est bien organisé et le personnel est très professionnel. Les locaux sont propres et bien entretenus.`,
            `Excellente prise en charge dès l'accueil. Le personnel médical est compétent et attentionné.`,
            `Infrastructure moderne et bien équipée. Les services sont efficaces et le personnel est à l'écoute des patients.`,
            `J'ai été impressionné(e) par la qualité des soins et le professionnalisme de l'équipe médicale. Un établissement de confiance.`,
            `Très satisfait(e) de mon séjour dans cet établissement. Le personnel est dévoué et les soins sont de qualité.`,
          ])
        : randomItem([
            `Les délais d'attente sont beaucoup trop longs, même avec un rendez-vous. L'organisation laisse à désirer.`,
            `Manque de personnel visible. Certains membres du personnel semblaient débordés et peu disponibles.`,
            `Problèmes de communication entre les différents services. J'ai dû répéter plusieurs fois les mêmes informations.`,
            `Les installations sanitaires ne sont pas suffisamment entretenues. Problèmes de propreté dans certaines zones.`,
            `Difficultés administratives pour la prise en charge. Procédures compliquées et mal expliquées.`,
          ]);
    } else {
      reviewContent = isPositive
        ? randomItem([
            `La plateforme est très intuitive et facile à utiliser. La prise de rendez-vous en ligne est simple et rapide.`,
            `Excellent service en ligne. J'apprécie particulièrement la possibilité de consulter mon dossier médical à tout moment.`,
            `Interface utilisateur moderne et agréable. Toutes les fonctionnalités sont facilement accessibles.`,
            `La plateforme a considérablement facilité mes démarches médicales. Je recommande vivement ce service.`,
            `Très pratique pour gérer mes rendez-vous et suivre mes prescriptions. Un outil indispensable pour la santé.`,
          ])
        : randomItem([
            `L'application est souvent lente et se bloque parfois lors de la prise de rendez-vous.`,
            `Interface peu intuitive. J'ai eu du mal à trouver certaines fonctionnalités essentielles.`,
            `Problèmes techniques récurrents. J'ai perdu des données importantes à plusieurs reprises.`,
            `Le système de notification ne fonctionne pas correctement. J'ai manqué plusieurs rappels de rendez-vous.`,
            `Difficultés à mettre à jour mes informations personnelles. Le support client est lent à répondre.`,
          ]);
    }

    await prisma.review.create({
      data: {
        title: reviewTitle,
        content: reviewContent,
        rating: rating,
        authorId: patient.userId,
        targetType: targetType,
        doctorId: doctorId,
        hospitalId: hospitalId,
        status: randomItem([
          ReviewStatus.PENDING,
          ReviewStatus.APPROVED,
          ReviewStatus.REJECTED,
          ReviewStatus.APPROVED,
          ReviewStatus.APPROVED,
        ]), // More weight to APPROVED
        isAnonymous: randomBoolean(0.2),
        isFeatured: isPositive && randomBoolean(0.3),
        likes: randomInt(0, 50),
        dislikes: randomInt(0, 10),
        reports: randomBoolean(0.1) ? randomInt(1, 5) : 0,
      },
    });
  }

  console.log("Created reviews");

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
