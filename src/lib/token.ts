import crypto from "crypto";
// import { v4 as uuidv4 } from "uuid";
import prisma from "./prisma";
import { getVerificationTokenByEmail } from "./utils";

export const generateVerificationToken = async (identifier: string) => {
  // Generate a random token
  const token = crypto.randomBytes(48).toString("hex") + "-" + identifier;
  const expires = new Date().getTime() + 1000 * 60 * 60 * 1; // 1 hours

  // Check if a token already exists for the user
  const existingToken = await getVerificationTokenByEmail(identifier);

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existingToken.identifier,
          token: existingToken.token,
        },
      },
    });
  }

  // Create a new verification token
  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: identifier,
      token,
      expires: new Date(expires),
    },
  });

  return verificationToken;
};

export const generateResetToken = async (identifier: string) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 min expiry

  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier },
  });

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existingToken.identifier,
          token: existingToken.token,
        },
      },
    });
  }

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier,
      token: code,
      expires,
    },
  });

  return verificationToken;
};
