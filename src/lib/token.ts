import crypto from "crypto";
// import { v4 as uuidv4 } from "uuid";
import prisma from "./prisma";
import { getVerificationTokenByEmail } from "./utils";

export const generateVerificationToken = async (identifier: string) => {
  // Generate a random token
  //   const token = uuidv4();
  const token = crypto.randomBytes(48).toString("hex") + "-" + identifier;
  //   const expires = new Date().getTime() + 1000 * 60 * 60 * 1; // 1 hours
  const expires = new Date().getTime() + 1000 * 60 * 1; // 1 minute

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
