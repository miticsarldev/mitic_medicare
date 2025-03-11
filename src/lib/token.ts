import { v4 as uuidv4 } from "uuid";
import prisma from "./prisma";
import { getVerificationTokenByEmail } from "./utils";

export const generateVerificationToken = async (identifier: string) => {
  // Generate a random token
  const token = uuidv4();
  const expires = new Date().getTime() + 1000 * 60 * 60 * 1; // 1 hours

  // Check if a token already exists for the user
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const existingToken = await getVerificationTokenByEmail(identifier);

  //   if (existingToken) {
  //     await prisma.verificationToken.delete({
  //       where: {
  //         identifier: existingToken.identifier,
  //       },
  //     });
  //   }

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
