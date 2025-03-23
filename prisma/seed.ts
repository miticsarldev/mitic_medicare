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
  ContentStatus,
  Hospital,
  Department,
  Doctor,
  Patient,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

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

// Helper function to generate a random boolean with a given probability
function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
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
  const suffix = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0");
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

const malianHospitals = [
  { name: "Hôpital Gabriel Touré", city: "Bamako", type: "public" },
  { name: "Hôpital du Point G", city: "Bamako", type: "public" },
  { name: "Hôpital du Mali", city: "Bamako", type: "public" },
  {
    name: "Hôpital Mère-Enfant Le Luxembourg",
    city: "Bamako",
    type: "private",
  },
  { name: "Hôpital Régional de Sikasso", city: "Sikasso", type: "public" },
  { name: "Hôpital Nianankoro Fomba", city: "Ségou", type: "public" },
  { name: "Hôpital Sominé Dolo", city: "Mopti", type: "public" },
  { name: "Hôpital Fousseyni Daou", city: "Kayes", type: "public" },
  { name: "Clinique Pasteur", city: "Bamako", type: "private" },
  {
    name: "Polyclinique Internationale Bamako",
    city: "Bamako",
    type: "private",
  },
  {
    name: "Centre de Santé de Référence de Kati",
    city: "Kati",
    type: "public",
  },
  { name: "Hôpital Régional de Gao", city: "Gao", type: "public" },
  { name: "Clinique Farako", city: "Bamako", type: "private" },
  { name: "Centre Hospitalier Mère-Enfant", city: "Bamako", type: "public" },
  {
    name: "Hôpital Régional de Tombouctou",
    city: "Tombouctou",
    type: "public",
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
  { name: "Ophtalmologie", description: "Traitement des maladies des yeux" },
  {
    name: "Orthopédie",
    description: "Traitement des affections de l'appareil locomoteur",
  },
  {
    name: "Neurologie",
    description: "Traitement des maladies du système nerveux",
  },
  { name: "Dermatologie", description: "Traitement des maladies de la peau" },
  {
    name: "ORL",
    description: "Traitement des maladies de l'oreille, du nez et de la gorge",
  },
  {
    name: "Urologie",
    description: "Traitement des maladies de l'appareil urinaire",
  },
  { name: "Pneumologie", description: "Traitement des maladies respiratoires" },
  { name: "Néphrologie", description: "Traitement des maladies des reins" },
  { name: "Endocrinologie", description: "Traitement des troubles hormonaux" },
  { name: "Psychiatrie", description: "Traitement des troubles mentaux" },
];

const specializations = [
  "Cardiologie",
  "Pédiatrie",
  "Gynécologie",
  "Obstétrique",
  "Chirurgie Générale",
  "Médecine Interne",
  "Ophtalmologie",
  "Orthopédie",
  "Neurologie",
  "Dermatologie",
  "ORL",
  "Urologie",
  "Pneumologie",
  "Néphrologie",
  "Endocrinologie",
  "Psychiatrie",
  "Radiologie",
  "Anesthésiologie",
  "Oncologie",
  "Hématologie",
  "Rhumatologie",
  "Gastro-entérologie",
  "Médecine d'urgence",
  "Médecine de famille",
  "Gériatrie",
];

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

const blogCategories = [
  {
    name: "Santé Publique",
    slug: "sante-publique",
    description:
      "Informations sur les politiques et initiatives de santé publique au Mali",
  },
  {
    name: "Maladies Tropicales",
    slug: "maladies-tropicales",
    description: "Informations sur les maladies tropicales courantes au Mali",
  },
  {
    name: "Nutrition",
    slug: "nutrition",
    description: "Conseils nutritionnels adaptés au contexte malien",
  },
  {
    name: "Santé Maternelle",
    slug: "sante-maternelle",
    description:
      "Informations sur la santé des femmes enceintes et des nouvelles mères",
  },
  {
    name: "Santé Infantile",
    slug: "sante-infantile",
    description: "Informations sur la santé des enfants",
  },
  {
    name: "Médecine Traditionnelle",
    slug: "medecine-traditionnelle",
    description:
      "Informations sur les pratiques médicales traditionnelles au Mali",
  },
  {
    name: "Prévention",
    slug: "prevention",
    description: "Conseils pour prévenir les maladies courantes",
  },
  {
    name: "Actualités Médicales",
    slug: "actualites-medicales",
    description: "Dernières nouvelles dans le domaine médical au Mali",
  },
];

const blogTitles = [
  "Les défis de la lutte contre le paludisme au Mali",
  "Comment prévenir la déshydratation pendant la saison chaude",
  "L'importance de la vaccination des enfants dans les zones rurales",
  "Nutrition et grossesse : conseils pour les femmes maliennes",
  "Les plantes médicinales traditionnelles du Mali",
  "Comprendre et gérer le diabète de type 2 au Mali",
  "La santé mentale : un sujet tabou à aborder",
  "Les bienfaits de l'allaitement maternel exclusif",
  "Comment reconnaître les symptômes du paludisme",
  "L'hypertension artérielle : un tueur silencieux",
  "Les méthodes contraceptives disponibles au Mali",
  "La drépanocytose : comprendre cette maladie génétique",
  "L'importance du lavage des mains pour prévenir les maladies",
  "Les dangers de l'automédication",
  "Comment prévenir les maladies diarrhéiques chez les enfants",
];

const faqs = [
  {
    question: "Comment prendre rendez-vous avec un médecin ?",
    answer:
      "Vous pouvez prendre rendez-vous en ligne via notre plateforme, par téléphone au +223 XX XX XX XX, ou directement à l'accueil de l'établissement de santé concerné.",
    category: "Consultations",
  },
  {
    question:
      "Quels documents dois-je apporter lors de ma première consultation ?",
    answer:
      "Veuillez apporter votre pièce d'identité, votre carnet de santé si vous en avez un, et tout document médical pertinent (résultats d'analyses, ordonnances précédentes, etc.).",
    category: "Consultations",
  },
  {
    question: "Quels sont les symptômes du paludisme ?",
    answer:
      "Les symptômes du paludisme incluent de la fièvre, des frissons, des maux de tête, des douleurs musculaires, de la fatigue, des nausées et des vomissements. Si vous présentez ces symptômes, consultez rapidement un médecin.",
    category: "Général",
  },
  {
    question: "Comment prévenir le paludisme ?",
    answer:
      "Pour prévenir le paludisme, utilisez des moustiquaires imprégnées d'insecticide, portez des vêtements couvrants le soir, utilisez des répulsifs anti-moustiques, et prenez des médicaments prophylactiques si recommandé par votre médecin.",
    category: "Prévention",
  },
  {
    question: "Quels vaccins sont recommandés pour les enfants au Mali ?",
    answer:
      "Au Mali, le Programme Élargi de Vaccination (PEV) recommande les vaccins contre la tuberculose, la poliomyélite, la diphtérie, le tétanos, la coqueluche, l'hépatite B, l'Haemophilus influenzae de type b, la pneumonie, la rougeole, la fièvre jaune, et récemment le vaccin contre le paludisme dans certaines régions.",
    category: "Vaccination",
  },
  {
    question: "Comment reconnaître une urgence médicale ?",
    answer:
      "Une urgence médicale peut se manifester par une douleur thoracique intense, une difficulté à respirer, une perte de conscience, des convulsions, des saignements abondants, ou une fièvre très élevée. Dans ces cas, rendez-vous immédiatement aux urgences.",
    category: "Urgences",
  },
  {
    question: "Quels sont les signes de déshydratation chez un enfant ?",
    answer:
      "Les signes de déshydratation chez un enfant incluent une bouche sèche, l'absence de larmes en pleurant, des yeux enfoncés, une fontanelle déprimée chez les nourrissons, une diminution des urines, et une léthargie inhabituelle.",
    category: "Pédiatrie",
  },
  {
    question: "Comment conserver correctement les médicaments à domicile ?",
    answer:
      "Conservez vos médicaments dans un endroit frais et sec, à l'abri de la lumière directe du soleil et hors de portée des enfants. Certains médicaments nécessitent une conservation au réfrigérateur, vérifiez les instructions sur la notice.",
    category: "Médicaments",
  },
  {
    question: "Quels aliments sont recommandés pour les femmes enceintes ?",
    answer:
      "Les femmes enceintes devraient consommer une alimentation variée et équilibrée, riche en fruits, légumes, céréales complètes, protéines maigres et produits laitiers. Les aliments riches en fer, acide folique et calcium sont particulièrement importants.",
    category: "Nutrition",
  },
  {
    question: "Comment savoir si mon enfant souffre de malnutrition ?",
    answer:
      "Les signes de malnutrition chez un enfant peuvent inclure un retard de croissance, une perte de poids, un manque d'énergie, des cheveux fins et cassants, une peau sèche, des infections fréquentes, et des troubles digestifs. Une consultation médicale est nécessaire pour un diagnostic précis.",
    category: "Pédiatrie",
  },
];

async function main() {
  console.log("Starting database seeding...");
  const usedEmails = new Set<string>();

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.reviewResponse.deleteMany();
  await prisma.review.deleteMany();
  await prisma.doctorReview.deleteMany();
  await prisma.blogComment.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.subscriptionPayment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.medicalRecordAttachment.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointmentReminder.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.vitalSign.deleteMany();
  await prisma.medicalHistory.deleteMany();
  await prisma.doctorAvailability.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.department.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.account.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");

  // Create a super admin user
  const superAdminPassword = await hash("admin123", 10);
  const superAdminEmail = "admin@mitic.com";
  usedEmails.add(superAdminEmail);
  const superAdmin = await prisma.user.create({
    data: {
      name: "Admin Système",
      email: superAdminEmail,
      phone: "+22370123456",
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

  // Create blog categories
  console.log("Creating blog categories...");
  const createdBlogCategories = await Promise.all(
    blogCategories.map((category) =>
      prisma.blogCategory.create({
        data: {
          name: category.name,
          slug: category.slug,
          description: category.description,
        },
      })
    )
  );

  // Create hospitals with admin users
  console.log("Creating hospitals and hospital admins...");
  const createdHospitals: Hospital[] = [];

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
        zipCode: "999",
        country: "Mali",
        phone: generateMalianPhoneNumber(),
        email: `contact@${hospital.name.toLowerCase().replace(/[^\w]/g, "")}.ml`,
        website: randomBoolean(0.7)
          ? `https://www.${hospital.name.toLowerCase().replace(/[^\w]/g, "")}.ml`
          : null,
        description: `${hospital.name} est un établissement de santé ${hospital.type === "public" ? "public" : "privé"} situé à ${city}, offrant des soins médicaux de qualité à la population.`,
        logoUrl: randomBoolean(0.6)
          ? `https://example.com/logos/${hospital.name.toLowerCase().replace(/[^\w]/g, "")}.png`
          : null,
        isVerified: true,
      },
    });

    createdHospitals.push(createdHospital);

    // Create subscription for hospital
    await prisma.subscription.create({
      data: {
        subscriberType: SubscriberType.HOSPITAL,
        hospitalId: createdHospital.id,
        plan: randomItem([
          SubscriptionPlan.STANDARD,
          SubscriptionPlan.PREMIUM,
          SubscriptionPlan.ENTERPRISE,
        ]),
        status: SubscriptionStatus.ACTIVE,
        startDate: randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31)),
        endDate: randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
        amount: new Prisma.Decimal(randomInt(100000, 500000)),
        currency: "XOF",
        autoRenew: true,
      },
    });

    // Create departments for each hospital
    const hospitalDepartments: Department[] = [];
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
  const createdDoctors: Doctor[] = [];

  // Create 50 doctors
  for (let i = 0; i < 50; i++) {
    const isIndependent = randomBoolean(0.3); // 30% chance of being independent
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

    // Select a random hospital and department if not independent
    let hospitalId: string | null = null;
    let departmentId: string | null = null;
    let hospital: Hospital | null = null;

    if (!isIndependent) {
      hospital = randomItem(createdHospitals);
      hospitalId = hospital.id;

      // Get departments for this hospital
      const hospitalDepartments = await prisma.department.findMany({
        where: { hospitalId: hospital.id },
      });

      if (hospitalDepartments.length > 0) {
        const department = randomItem(hospitalDepartments);
        departmentId = department.id;
      }
    }

    const doctorUser = await prisma.user.create({
      data: {
        name: `Dr. ${firstName} ${lastName}`,
        email: doctorEmail,
        phone: phone,
        password: password,
        role: isIndependent
          ? UserRole.INDEPENDENT_DOCTOR
          : UserRole.HOSPITAL_DOCTOR,
        emailVerified: new Date(),
        isApproved: randomBoolean(0.9), // 90% are approved
        isActive: true,
        profile: {
          create: {
            address: `${randomInt(1, 999)} Rue ${randomInt(100, 999)}`,
            city: hospital ? hospital.city : randomItem(malianCities),
            state: hospital
              ? hospital.state
              : `Région de ${randomItem(malianCities)}`,
            zipCode: "999",
            country: "Mali",
            bio: `Médecin ${isIndependent ? "indépendant" : "hospitalier"} spécialisé en ${randomItem(specializations)}.`,
            genre: gender === "male" ? UserGenre.MALE : UserGenre.FEMALE,
          },
        },
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        hospitalId: hospitalId,
        departmentId: departmentId,
        specialization: randomItem(specializations),
        licenseNumber: `ML-DOC-${randomInt(10000, 99999)}`,
        education: `Doctorat en Médecine, Université de ${randomItem(["Bamako", "Ségou", "Sikasso", "Dakar", "Abidjan", "Rabat"])}`,
        experience: `${randomInt(1, 25)} ans d'expérience en ${randomItem(specializations)}`,
        isVerified: randomBoolean(0.8), // 80% are verified
        isIndependent: isIndependent,
        availableForChat: randomBoolean(0.7), // 70% are available for chat
        consultationFee: new Prisma.Decimal(randomInt(10000, 50000)),
      },
    });

    createdDoctors.push(doctor);

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
          isActive: true,
        },
      });
    }

    // Create subscription for independent doctors
    if (isIndependent) {
      await prisma.subscription.create({
        data: {
          subscriberType: SubscriberType.DOCTOR,
          doctorId: doctor.id,
          plan: randomItem([
            SubscriptionPlan.FREE,
            SubscriptionPlan.BASIC,
            SubscriptionPlan.PREMIUM,
          ]),
          status: SubscriptionStatus.ACTIVE,
          startDate: randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31)),
          endDate: randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
          amount: new Prisma.Decimal(randomInt(25000, 100000)),
          currency: "XOF",
          autoRenew: true,
        },
      });
    }
  }

  console.log(`Created ${createdDoctors.length} doctors`);

  // Create patients
  console.log("Creating patients...");
  const createdPatients: Patient[] = [];

  // Create 100 patients
  for (let i = 0; i < 100; i++) {
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
        dateOfBirth: randomDate(new Date(1950, 0, 1), new Date(2005, 11, 31)),
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

    createdPatients.push(patient);

    // Create medical histories for some patients
    if (randomBoolean(0.7)) {
      const numHistories = randomInt(1, 3);

      for (let j = 0; j < numHistories; j++) {
        const condition = randomItem(medicalConditions);
        const doctor = randomItem(createdDoctors);

        await prisma.medicalHistory.create({
          data: {
            patientId: patient.id,
            title: `Antécédent de ${condition}`,
            condition: condition,
            diagnosedDate: randomDate(new Date(2010, 0, 1), new Date()),
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
            recordedAt: randomDate(new Date(2023, 0, 1), new Date()),
          },
        });
      }
    }
  }

  console.log(`Created ${createdPatients.length} patients`);

  // Create appointments
  console.log("Creating appointments...");

  // Create 200 appointments
  for (let i = 0; i < 200; i++) {
    const patient = randomItem(createdPatients);
    const doctor = randomItem(createdDoctors);
    const hospital = doctor.hospitalId
      ? await prisma.hospital.findUnique({ where: { id: doctor.hospitalId } })
      : null;

    const appointmentDate = randomDate(
      new Date(2023, 0, 1),
      new Date(2024, 11, 31)
    );
    const hour = randomInt(8, 17);
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(hour, 0, 0, 0);

    const endDateTime = new Date(appointmentDateTime);
    endDateTime.setHours(appointmentDateTime.getHours() + 1);

    const isPast = appointmentDateTime < new Date();

    let status;
    if (isPast) {
      status = randomItem([
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELED,
        AppointmentStatus.NO_SHOW,
      ]);
    } else {
      status = randomItem([
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED,
      ]);
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        hospitalId: hospital ? hospital.id : null,
        scheduledAt: appointmentDateTime,
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

    // Create appointment reminders
    if (
      status === AppointmentStatus.PENDING ||
      status === AppointmentStatus.CONFIRMED
    ) {
      const reminderDate = new Date(appointmentDateTime);
      reminderDate.setDate(reminderDate.getDate() - 1);

      await prisma.appointmentReminder.create({
        data: {
          appointmentId: appointment.id,
          reminderTime: reminderDate,
          isSent: reminderDate < new Date(),
          sentAt: reminderDate < new Date() ? reminderDate : null,
          type: randomItem(["EMAIL", "SMS", "PUSH"]),
        },
      });
    }

    // Create medical records for completed appointments
    if (status === AppointmentStatus.COMPLETED) {
      const medicalRecord = await prisma.medicalRecord.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          appointmentId: appointment.id,
          hospitalId: hospital ? hospital.id : null,
          diagnosis: `Patient diagnostiqué avec ${randomItem(medicalConditions)}`,
          treatment: `Traitement prescrit: ${randomItem(["médicaments", "repos", "exercices", "régime alimentaire", "chirurgie"])}`,
          notes: randomBoolean(0.7)
            ? `Patient présente des symptômes de ${randomItem(medicalConditions)} depuis ${randomInt(1, 30)} jours`
            : null,
          followUpNeeded: randomBoolean(0.6),
          followUpDate: randomBoolean(0.6)
            ? randomDate(new Date(), new Date(2024, 11, 31))
            : null,
        },
      });

      // Create prescriptions for some medical records
      if (randomBoolean(0.8)) {
        const numMedications = randomInt(1, 3);

        for (let j = 0; j < numMedications; j++) {
          const medication = randomItem(medications);

          await prisma.prescription.create({
            data: {
              patientId: patient.id,
              doctorId: doctor.id,
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

  console.log("Created 200 appointments with related records");

  // Create reviews
  console.log("Creating reviews...");

  // Create doctor reviews
  for (let i = 0; i < 50; i++) {
    const patient: Patient = randomItem(createdPatients);
    const doctor: Doctor = randomItem(createdDoctors);

    // Check if this patient already reviewed this doctor
    const existingReview = await prisma.doctorReview.findUnique({
      where: {
        doctorId_patientId: {
          doctorId: doctor.id,
          patientId: patient.id,
        },
      },
    });

    if (!existingReview) {
      const rating = randomInt(1, 5);
      const isPositive = rating >= 4;

      await prisma.doctorReview.create({
        data: {
          doctorId: doctor.id,
          patientId: patient.id,
          rating: rating,
          comment: isPositive
            ? randomItem([
                `Excellent médecin, très professionnel et à l'écoute.`,
                `Le médecin' a pris le temps de bien m'expliquer mon traitement.`,
                `Je recommande vivement ce médecin pour sa compétence et sa gentillesse.`,
                `Consultation très satisfaisante, médecin compétent.`,
                `Très bon suivi médical, je suis très satisfait(e).`,
              ])
            : randomItem([
                `Temps d'attente trop long pour la consultation.`,
                `Le médecin n'a pas pris suffisamment de temps pour m'écouter.`,
                `Consultation trop rapide et peu d'explications.`,
                `Je m'attendais à un meilleur suivi.`,
                `Difficultés à obtenir un rendez-vous rapidement.`,
              ]),
          isAnonymous: randomBoolean(0.3),
          isApproved: randomBoolean(0.8),
        },
      });
    }
  }

  // Create general reviews (for doctors, hospitals, and platform)
  for (let i = 0; i < 100; i++) {
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

    let reviewContent;

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

    const review = await prisma.review.create({
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
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
      },
    });

    // Add responses to some reviews
    if (review.status === ReviewStatus.APPROVED && randomBoolean(0.3)) {
      let responderId;

      if (targetType === ReviewTargetType.DOCTOR && doctorId) {
        const doctor = await prisma.doctor.findUnique({
          where: { id: doctorId },
          include: { user: true },
        });
        responderId = doctor?.userId;
      } else if (targetType === ReviewTargetType.HOSPITAL && hospitalId) {
        const hospital = await prisma.hospital.findUnique({
          where: { id: hospitalId },
          include: { admin: true },
        });
        responderId = hospital?.adminId;
      } else {
        responderId = superAdmin.id;
      }

      if (responderId) {
        await prisma.reviewResponse.create({
          data: {
            reviewId: review.id,
            authorId: responderId,
            content: isPositive
              ? randomItem([
                  `Merci beaucoup pour votre retour positif. Nous sommes ravis que vous ayez apprécié nos services.`,
                  `Nous vous remercions pour votre confiance et votre satisfaction nous encourage à maintenir la qualité de nos services.`,
                  `Votre avis est très important pour nous. Merci d'avoir pris le temps de partager votre expérience positive.`,
                  `Nous sommes heureux d'avoir pu répondre à vos attentes et nous restons à votre disposition pour vos futurs besoins.`,
                  `Merci pour ces mots encourageants. C'est un plaisir de vous compter parmi nos patients satisfaits.`,
                ])
              : randomItem([
                  `Nous vous présentons nos excuses pour les désagréments rencontrés. Votre retour nous aidera à améliorer nos services.`,
                  `Nous prenons note de vos remarques et mettons tout en œuvre pour résoudre les problèmes que vous avez soulevés.`,
                  `Merci pour votre retour. Nous regrettons que votre expérience n'ait pas été à la hauteur de vos attentes et travaillons à améliorer nos services.`,
                  `Nous sommes désolés pour cette expérience décevante. N'hésitez pas à nous contacter directement pour que nous puissions résoudre votre problème.`,
                  `Votre satisfaction est notre priorité. Nous allons examiner les points que vous avez soulevés pour améliorer notre qualité de service.`,
                ]),
            isOfficial: true,
            createdAt: new Date(
              review.createdAt.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000
            ),
          },
        });
      }
    }
  }

  console.log("Created reviews and responses");

  // Create blog posts
  console.log("Creating blog posts...");

  for (let i = 0; i < blogTitles.length; i++) {
    const title = blogTitles[i];
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-");

    // Select a random author (either a doctor or the super admin)
    const authorId = randomBoolean(0.7)
      ? (
          await prisma.doctor.findFirst({
            select: { userId: true },
            orderBy: { createdAt: "asc" },
            skip: randomInt(0, 49),
          })
        )?.userId || superAdmin.id
      : superAdmin.id;

    // Select 1-3 random categories
    const numCategories = randomInt(1, 3);
    const shuffledCategories = [...createdBlogCategories].sort(
      () => 0.5 - Math.random()
    );
    const selectedCategories = shuffledCategories.slice(0, numCategories);

    const isPublished = randomBoolean(0.8);
    const publishedDate = isPublished
      ? randomDate(new Date(2023, 0, 1), new Date())
      : null;

    const content = `
# ${title}

## Introduction

${randomItem([
  "La santé est un enjeu majeur au Mali, où de nombreux défis persistent malgré les progrès réalisés ces dernières années.",
  "Dans le contexte sanitaire malien, il est essentiel de comprendre les spécificités locales pour adapter les approches médicales.",
  "Les professionnels de santé au Mali font face à des défis uniques qui nécessitent des solutions innovantes et adaptées.",
  "L'amélioration de l'accès aux soins de santé reste une priorité pour le développement du système sanitaire malien.",
  "La médecine au Mali combine approches modernes et savoirs traditionnels, créant un système de santé unique.",
])}

## Contexte

${randomItem([
  "Au Mali, les conditions climatiques et environnementales influencent fortement la prévalence de certaines maladies comme le paludisme.",
  "Le système de santé malien s'organise en différents niveaux, des centres de santé communautaires aux hôpitaux régionaux et nationaux.",
  "Les zones rurales du Mali font face à des défis particuliers en matière d'accès aux soins, notamment en raison des distances et du manque d'infrastructures adéquates.",
  "La formation des professionnels de santé au Mali s'est considérablement améliorée, mais des lacunes persistent dans certaines spécialités.",
  "Les pratiques de médecine traditionnelle restent très présentes au Mali et coexistent avec la médecine moderne.",
])}

## Points clés

* ${randomItem([
      "Le paludisme reste l'une des principales causes de mortalité au Mali, particulièrement chez les enfants de moins de 5 ans.",
      "La vaccination des enfants a connu des progrès significatifs, mais la couverture vaccinale reste insuffisante dans certaines régions.",
      "Les maladies non transmissibles comme l'hypertension et le diabète sont en augmentation dans les zones urbaines du Mali.",
      "La santé maternelle et infantile demeure une priorité nationale, avec des efforts pour réduire la mortalité.",
      "L'accès à l'eau potable est un facteur déterminant pour la santé publique au Mali.",
    ])}

* ${randomItem([
      "La télémédecine offre des perspectives prometteuses pour améliorer l'accès aux soins dans les zones reculées.",
      "La formation continue des agents de santé communautaires est essentielle pour renforcer le système de santé de proximité.",
      "L'éducation sanitaire des populations joue un rôle crucial dans la prévention des maladies courantes.",
      "Les partenariats public-privé peuvent contribuer à améliorer la qualité des soins de santé.",
      "L'implication des communautés dans la gestion des centres de santé favorise leur appropriation et leur durabilité.",
    ])}

* ${randomItem([
      "La recherche médicale adaptée au contexte malien est nécessaire pour développer des solutions locales efficaces.",
      "La coordination entre les différents acteurs de la santé (État, ONG, secteur privé) reste un défi majeur.",
      "L'amélioration des systèmes d'information sanitaire permet un meilleur suivi épidémiologique et une planification plus efficace.",
      "La gestion des déchets médicaux constitue un enjeu environnemental et sanitaire important dans les établissements de santé.",
      "La résilience du système de santé face aux crises (conflits, épidémies, catastrophes naturelles) doit être renforcée.",
    ])}

## Conclusion

${randomItem([
  "Les défis sanitaires au Mali nécessitent une approche globale et coordonnée, impliquant tous les acteurs concernés.",
  "Malgré les obstacles, des avancées significatives ont été réalisées dans le domaine de la santé au Mali ces dernières années.",
  "L'amélioration durable de la santé des populations maliennes passe par le renforcement du système de santé à tous les niveaux.",
  "L'innovation et l'adaptation des solutions aux réalités locales sont essentielles pour relever les défis sanitaires au Mali.",
  "L'engagement politique et communautaire est indispensable pour garantir l'accès universel aux soins de santé au Mali.",
])}
    `;

    const excerpt = randomItem([
      "Cet article explore les enjeux et perspectives de la santé au Mali, en mettant l'accent sur les défis actuels et les solutions potentielles.",
      "Une analyse des problématiques de santé spécifiques au contexte malien et des approches pour y répondre efficacement.",
      "Découvrez les particularités du système de santé malien et les initiatives prometteuses pour améliorer l'accès aux soins.",
      "Un regard approfondi sur la situation sanitaire au Mali et les stratégies pour renforcer la résilience du système de santé.",
      "Cet article présente les avancées et les défis persistants dans le domaine de la santé au Mali, avec des perspectives d'amélioration.",
    ]);

    const blogPost = await prisma.blogPost.create({
      data: {
        title: title,
        slug: slug,
        content: content,
        excerpt: excerpt,
        authorId: authorId,
        coverImage: randomBoolean(0.7)
          ? `https://example.com/images/blog/${slug}.jpg`
          : null,
        status: isPublished
          ? ContentStatus.PUBLISHED
          : randomItem([ContentStatus.DRAFT, ContentStatus.ARCHIVED]),
        publishedAt: publishedDate,
        tags: [
          randomItem([
            "Santé",
            "Médecine",
            "Bien-être",
            "Prévention",
            "Traitement",
          ]),
          randomItem([
            "Mali",
            "Afrique",
            "Santé publique",
            "Système de santé",
            "Accès aux soins",
          ]),
          randomItem([
            "Recherche",
            "Innovation",
            "Technologie",
            "Tradition",
            "Communauté",
          ]),
        ],
        viewCount: isPublished ? randomInt(0, 1000) : 0,
        categories: {
          connect: selectedCategories.map((category) => ({ id: category.id })),
        },
      },
    });

    // Add comments to some blog posts
    if (isPublished && randomBoolean(0.7)) {
      const numComments = randomInt(1, 5);

      for (let j = 0; j < numComments; j++) {
        const gender = randomBoolean() ? "male" : "female";
        const firstName = randomItem(malianFirstNames[gender]);
        const lastName = randomItem(malianLastNames);

        await prisma.blogComment.create({
          data: {
            postId: blogPost.id,
            content: randomItem([
              "Article très informatif, merci pour ces précisions.",
              "Je partage entièrement cette analyse. Il est important de sensibiliser davantage sur ce sujet.",
              "Pourriez-vous développer davantage sur les solutions proposées ?",
              "Cette problématique est effectivement cruciale pour notre système de santé.",
              "Merci pour cet éclairage sur un sujet aussi important.",
              "J'ai personnellement constaté ces défis dans ma région. Votre analyse est pertinente.",
              "Quelles sont les perspectives d'amélioration à court terme selon vous ?",
              "Article bien documenté qui met en lumière des enjeux souvent négligés.",
              "Ces informations sont précieuses pour comprendre les défis sanitaires actuels.",
              "Je suggère également de considérer l'aspect culturel dans cette analyse.",
            ]),
            authorName: `${firstName} ${lastName}`,
            authorEmail: randomBoolean(0.7)
              ? generateEmail(firstName, lastName, "gmail.com")
              : null,
            isApproved: randomBoolean(0.8),
            createdAt: new Date(
              blogPost.createdAt.getTime() +
                randomInt(1, 30) * 24 * 60 * 60 * 1000
            ),
          },
        });
      }
    }
  }

  console.log("Created blog posts and comments");

  // Create FAQs
  console.log("Creating FAQs...");

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order: randomInt(1, 100),
        authorId: superAdmin.id,
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  console.log("Created FAQs");

  // Create notifications
  console.log("Creating notifications...");

  // Create 200 notifications
  for (let i = 0; i < 200; i++) {
    const user = randomItem([
      ...(await prisma.user.findMany({
        where: { role: UserRole.PATIENT },
        take: 20,
      })),
      ...(await prisma.user.findMany({
        where: { role: UserRole.HOSPITAL_DOCTOR },
        take: 10,
      })),
      ...(await prisma.user.findMany({
        where: { role: UserRole.INDEPENDENT_DOCTOR },
        take: 10,
      })),
    ]);

    const notificationType = randomItem([
      "APPOINTMENT",
      "REMINDER",
      "SYSTEM",
      "MESSAGE",
      "REVIEW",
    ]);

    let title, message;

    switch (notificationType) {
      case "APPOINTMENT":
        title = randomItem([
          "Nouveau rendez-vous",
          "Rendez-vous confirmé",
          "Rappel de rendez-vous",
          "Rendez-vous annulé",
          "Modification de rendez-vous",
        ]);
        message = randomItem([
          "Votre rendez-vous a été confirmé pour le 15 juin à 10h00.",
          "Rappel : Vous avez un rendez-vous demain à 14h30.",
          "Votre rendez-vous du 20 juin a été annulé par le médecin.",
          "Le Dr. Keita a modifié l'heure de votre rendez-vous du 25 juin.",
          "Nouveau rendez-vous programmé avec Dr. Traoré le 30 juin à 11h00.",
        ]);
        break;
      case "REMINDER":
        title = randomItem([
          "Rappel de médicament",
          "Rappel de suivi",
          "Rappel de vaccination",
          "Rappel d'analyse",
          "Rappel de paiement",
        ]);
        message = randomItem([
          "N'oubliez pas de prendre votre médicament aujourd'hui.",
          "Votre suivi médical est prévu dans une semaine.",
          "Rappel : Vaccination prévue pour votre enfant le 10 juillet.",
          "Vos analyses de sang sont à faire avant le 20 juillet.",
          "Rappel : Votre facture de consultation est en attente de paiement.",
        ]);
        break;
      case "SYSTEM":
        title = randomItem([
          "Mise à jour du système",
          "Maintenance prévue",
          "Nouvelle fonctionnalité",
          "Information importante",
          "Modification des conditions",
        ]);
        message = randomItem([
          "Notre plateforme sera en maintenance le 5 juillet de 22h à 00h.",
          "Une nouvelle fonctionnalité de prise de rendez-vous est disponible.",
          "Mise à jour de nos conditions d'utilisation. Veuillez les consulter.",
          "Votre mot de passe a été modifié avec succès.",
          "Nous avons détecté une connexion inhabituelle à votre compte.",
        ]);
        break;
      case "MESSAGE":
        title = randomItem([
          "Nouveau message",
          "Réponse à votre message",
          "Message du Dr. Coulibaly",
          "Message important",
          "Consultation en ligne",
        ]);
        message = randomItem([
          "Vous avez reçu un nouveau message de votre médecin.",
          "Le Dr. Diallo a répondu à votre question.",
          "Message concernant votre dernière consultation.",
          "Nouveau message concernant vos résultats d'analyses.",
          "Invitation à une consultation en ligne le 12 juillet.",
        ]);
        break;
      case "REVIEW":
        title = randomItem([
          "Nouvel avis",
          "Avis approuvé",
          "Réponse à votre avis",
          "Invitation à donner votre avis",
          "Avis en attente de modération",
        ]);
        message = randomItem([
          "Votre avis a été publié avec succès.",
          "Un médecin a répondu à votre avis.",
          "Merci de donner votre avis sur votre dernière consultation.",
          "Votre avis est en attente de modération.",
          "Félicitations ! Votre avis a été mis en avant sur notre plateforme.",
        ]);
        break;
    }

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: title,
        message: message,
        type: notificationType,
        isRead: randomBoolean(0.6),
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
      },
    });
  }

  console.log("Created notifications");

  // Create messages
  console.log("Creating messages...");

  // Create 100 message threads
  for (let i = 0; i < 100; i++) {
    const sender = randomItem([
      ...(await prisma.user.findMany({
        where: { role: UserRole.PATIENT },
        take: 20,
      })),
      ...(await prisma.user.findMany({
        where: { role: UserRole.HOSPITAL_DOCTOR },
        take: 10,
      })),
      ...(await prisma.user.findMany({
        where: { role: UserRole.INDEPENDENT_DOCTOR },
        take: 10,
      })),
    ]);

    let receiver;

    if (sender.role === UserRole.PATIENT) {
      receiver = randomItem([
        ...(await prisma.user.findMany({
          where: { role: UserRole.HOSPITAL_DOCTOR },
          take: 10,
        })),
        ...(await prisma.user.findMany({
          where: { role: UserRole.INDEPENDENT_DOCTOR },
          take: 10,
        })),
      ]);
    } else {
      receiver = randomItem([
        ...(await prisma.user.findMany({
          where: { role: UserRole.PATIENT },
          take: 20,
        })),
      ]);
    }

    const numMessages = randomInt(1, 5);
    const threadStartDate = randomDate(new Date(2023, 0, 1), new Date());

    for (let j = 0; j < numMessages; j++) {
      const isPatientSender = sender.role === UserRole.PATIENT;
      const messageDate = new Date(
        threadStartDate.getTime() + j * randomInt(1, 24) * 60 * 60 * 1000
      );

      let content;

      if (j === 0) {
        // First message in thread
        if (isPatientSender) {
          content = randomItem([
            "Bonjour Docteur, j'aimerais prendre rendez-vous pour une consultation.",
            "Docteur, j'ai des questions concernant mon traitement actuel.",
            "Bonjour, je ressens des douleurs depuis quelques jours. Pouvez-vous me conseiller ?",
            "J'ai reçu mes résultats d'analyses. Quand pourrions-nous en discuter ?",
            "Bonjour, je souhaiterais avoir des informations sur la vaccination de mon enfant.",
          ]);
        } else {
          content = randomItem([
            "Bonjour, je vous contacte suite à votre dernière consultation.",
            "Bonjour, vos résultats d'analyses sont disponibles. Pouvons-nous en discuter ?",
            "Je vous écris concernant votre traitement. Comment vous sentez-vous ?",
            "Bonjour, je souhaite faire un suivi de votre état de santé après notre dernière consultation.",
            "Bonjour, je vous propose un rendez-vous de suivi la semaine prochaine.",
          ]);
        }
      } else {
        // Follow-up messages
        if (
          (j % 2 === 0 && isPatientSender) ||
          (j % 2 === 1 && !isPatientSender)
        ) {
          // Patient message
          content = randomItem([
            "Merci pour votre réponse. Quels créneaux seraient disponibles ?",
            "J'ai bien noté vos recommandations. Dois-je continuer le traitement actuel ?",
            "Les symptômes persistent malgré le traitement. Que me conseillez-vous ?",
            "Je vous remercie pour ces informations. J'ai encore une question concernant les effets secondaires.",
            "Parfait, je serai présent(e) au rendez-vous. Faut-il apporter des documents particuliers ?",
          ]);
        } else {
          // Doctor message
          content = randomItem([
            "Je peux vous proposer un rendez-vous lundi prochain à 10h ou mardi à 15h.",
            "Continuez le traitement comme prescrit et tenez-moi informé de l'évolution.",
            "Dans ce cas, je vous suggère de venir en consultation pour un examen plus approfondi.",
            "Les effets secondaires que vous décrivez sont normaux. Ils devraient diminuer progressivement.",
            "Apportez votre carnet de santé et vos dernières analyses, s'il vous plaît.",
          ]);
        }
      }

      const currentSender = j % 2 === 0 ? sender : receiver;
      const currentReceiver = j % 2 === 0 ? receiver : sender;

      await prisma.message.create({
        data: {
          senderId: currentSender.id,
          receiverId: currentReceiver.id,
          content: content,
          isRead: j < numMessages - 1 || randomBoolean(0.7),
          readAt:
            j < numMessages - 1 || randomBoolean(0.7)
              ? new Date(messageDate.getTime() + randomInt(1, 60) * 60 * 1000)
              : null,
          createdAt: messageDate,
        },
      });
    }
  }

  console.log("Created messages");

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
