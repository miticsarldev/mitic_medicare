/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email/Numéro de téléphone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const identifier = credentials.identifier;

        // Check if the identifier is an email or phone number
        const isEmail = identifier.includes("@");

        const user = await prisma.user.findUnique({
          where: isEmail ? { email: identifier } : { phone: identifier },
          include: { profile: true },
        });

        console.log(user);

        if (!user) {
          throw new Error("User not found");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        return {
          ...user,
          userProfile: user.profile ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, trigger, user, session }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          dateOfBirth: user.dateOfBirth,
          image: user.userProfile?.avatarUrl,
          userProfile: user.userProfile,
          role: user.role,
          emailVerified: user.emailVerified,
          isApproved: user.isApproved,
        };
      }

      // When client calls useSession().update(payload)
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if ((session as any).userProfile?.avatarUrl !== undefined) {
          token.userProfile = {
            ...(token.userProfile as any),
            avatarUrl: (session as any).userProfile.avatarUrl,
          };
          token.image = (session as any).userProfile.avatarUrl ?? token.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            email: token.email,
            name: token.name,
            dateOfBirth: token.dateOfBirth,
            image: token.image as string | null | undefined,
            userProfile: token.userProfile,
            role: token.role,
            emailVerified: token.emailVerified,
            isApproved: token.isApproved,
          },
        };
      }
      return session;
    },
  },
};
