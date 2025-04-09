import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
      if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
      }

      
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user.id },
      });

      if (!doctor) {
        return NextResponse.json({ message: "Médecin non trouvé" }, { status: 404 });
      }

      const doctorId = doctor.id;

      
      const appointments = await prisma.appointment.findMany({
        where: { doctorId },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          hospital: true,
        },
      });

     console.log("appointments:", appointments);

    const formattedAppointments = appointments.map((appointment) => {
      const { patient, hospital } = appointment;
      const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

      return {
        id: appointment.id,
        patientName: patient.user.name,
        patientEmail: patient.user.email,
        patientPhone: patient.user.phone,
        age: age,
        bloodType: patient.bloodType || "Inconnu",
        hospitalName: hospital ? hospital.name : "Non renseigné",
        hospitalLocation: hospital ? hospital.address : "Non renseigné",
        scheduledAt: appointment.scheduledAt,
        status: appointment.status,
        type: appointment.type || "Non spécifié",
        reason: appointment.reason || "Non spécifié",
        notes: appointment.notes || "Aucune note",
      };
    });

    return NextResponse.json(formattedAppointments, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}



// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// // Endpoint pour ajouter un patient
// export async function POST(req: Request) {
//   try {
//     // Utiliser un ID de médecin hardcodé pour le test
//     const doctorId = "cm8goo5ck012u180v6v96fs48"; // Remplace cet ID par l'ID réel du médecin pour ton test

//     // Vérifie que le médecin existe
    

//     const body = await req.json();
//     const { name, email, phone, dateOfBirth, bloodType } = body;

//     if (!name || !email || !phone || !dateOfBirth) {
//       return NextResponse.json({ message: "Tous les champs obligatoires doivent être remplis" }, { status: 400 });
//     }

//     // Vérifier si l'utilisateur existe déjà
//     let user = await prisma.user.findUnique({ where: { email } });

//     if (!user) {
//       // Créer un nouvel utilisateur si non existant
//       user = await prisma.user.create({
//         data: {
//           name,
//           email,
//           phone,
//           role: "PATIENT", 
//           password: "password123", // Mot de passe factice pour le test
//         },
//       });
//     }

//     // Vérifier si ce patient existe déjà
//     let patient = await prisma.patient.findUnique({ where: { userId: user.id } });

//     if (!patient) {
//       // Créer le patient s'il n'existe pas
//       patient = await prisma.patient.create({
//         data: {
//           userId: user.id,
//           dateOfBirth: new Date(dateOfBirth),
//           bloodType,
//         },
//       });
//     }

//     // Création d'un rendez-vous test pour ce patient
//     await prisma.appointment.create({
//       data: {
//         patientId: patient.id,
//         doctorId: doctorId, // Utilise un doctorId valide
//         scheduledAt: new Date(), // Date actuelle comme exemple
//         type: "Consultation",
//         reason: "Premier rendez-vous",
//       },
//     });

//     return NextResponse.json({ message: "Patient ajouté avec succès", patient }, { status: 201 });
//   } catch (error) {
//     console.error("Erreur lors de l'ajout du patient :", error);
//     return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
//   }
// }
