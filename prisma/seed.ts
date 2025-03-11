import { PrismaClient } from "@prisma/client";
import { InstitutionType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with super admin accounts...");

  const superAdmins = [
    {
      name: "Mitic Admin1",
      email: "admin1@mitic.com",
      password: "@Mitic123",
    },
    {
      name: "Mitic Admin2",
      email: "admin2@mitic.com",
      password: "@Mitic123",
    },
    {
      name: "Mitic Admin3",
      email: "admin3@mitic.com",
      password: "@Mitic123",
    },
  ];

  for (const admin of superAdmins) {
    const existingUser = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (!existingUser) {
      const hashedPassword = await hash(admin.password, 10);

      await prisma.user.create({
        data: {
          name: admin.name,
          email: admin.email.toLowerCase(),
          password: hashedPassword,
          role: "super_admin",
          emailVerified: new Date(),
          userProfile: {
            create: {
              phone: `+2235555555${Math.floor(Math.random() * 10)}`,
              address: "HQ Address",
              city: "Bamako",
              country: "Mali",
              genre: "male",
            },
          },
        },
      });

      console.log(`✅ Created Super Admin: ${admin.email}`);
    } else {
      console.log(`⚠️ Super Admin already exists: ${admin.email}`);
    }
  }

  // Seeding the hopital admin and his doctors

  // Define the hospital admin credentials
  const adminData = {
    name: "Admin Hôpital",
    email: "admin.hopital@mitic.com",
    password: "@Mitic123", // Change this in production
    phone: "+22356789012",
    role: "hospital_admin",
  };

  // Define the hospital data
  const hospitalData = {
    name: "Hôpital Général de Bamako",
    type: "hospital" as InstitutionType,
    phone: "+22398765432",
    email: "contact@hopital-bamako.com",
    address: "Quartier Médical, Bamako",
    city: "Bamako",
    state: "District de Bamako",
    zipCode: "BP 1234",
    country: "Mali",
  };

  // Define 3 doctors
  const doctorsData = [
    {
      name: "Dr. Sophie Konaté",
      email: "dr.sophie@mitic.com",
      password: "@Mitic123",
      phone: "+22398000000",
      specialization: "Cardiologie",
      licenseNumber: "CARD-12345",
    },
    {
      name: "Dr. Moussa Traoré",
      email: "dr.moussa@mitic.com",
      password: "@Mitic123",
      phone: "+22398000011",
      specialization: "Dermatologie",
      licenseNumber: "DERM-54321",
    },
    {
      name: "Dr. Aïssata Coulibaly",
      email: "dr.aissata@mitic.com",
      password: "@Mitic123",
      phone: "+22398000012",
      specialization: "Neurologie",
      licenseNumber: "NEUR-67890",
    },
  ];

  // Check if the admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminData.email },
  });

  if (!existingAdmin) {
    const hashedAdminPassword = await hash(adminData.password, 10);

    // Start a transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
      // Create the hospital admin user
      const adminUser = await tx.user.create({
        data: {
          name: adminData.name,
          email: adminData.email.toLowerCase(),
          password: hashedAdminPassword,
          role: "hospital_admin",
          userProfile: {
            create: {
              phone: adminData.phone,
              city: hospitalData.city,
              country: hospitalData.country,
            },
          },
        },
      });

      console.log(`✅ Created Hospital Admin: ${adminUser.email}`);

      // Create the hospital institution
      const hospital = await tx.institution.create({
        data: {
          adminId: adminUser.id,
          name: hospitalData.name,
          type: hospitalData.type,
          phone: hospitalData.phone,
          email: hospitalData.email.toLowerCase(),
          address: hospitalData.address,
          city: hospitalData.city,
          state: hospitalData.state,
          zipCode: hospitalData.zipCode,
          country: hospitalData.country,
        },
      });

      console.log(`✅ Created Institution: ${hospital.name}`);

      // Create the doctors under the hospital
      for (const doctor of doctorsData) {
        const hashedDoctorPassword = await hash(doctor.password, 10);

        const doctorUser = await tx.user.create({
          data: {
            name: doctor.name,
            email: doctor.email.toLowerCase(),
            password: hashedDoctorPassword,
            role: "hospital_doctor",
          },
        });

        console.log(`✅ Created Doctor: ${doctorUser.email}`);

        // Create the doctor profile
        await tx.userProfile.create({
          data: {
            userId: doctorUser.id,
            phone: doctor.phone,
          },
        });

        // Assign doctor to the hospital
        await tx.doctor.create({
          data: {
            userId: doctorUser.id,
            institutionId: hospital.id,
            specialization: doctor.specialization,
            licenseNumber: doctor.licenseNumber,
          },
        });

        console.log(`✅ Assigned Doctor to Hospital: ${doctor.name}`);
      }

      return adminUser;
    });

    console.log("🎉 Seeding complete!");
  } else {
    console.log("⚠️ Hospital Admin already exists. Skipping seeding...");
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
