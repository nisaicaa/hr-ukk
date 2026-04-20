import prisma from "../utils/prisma";

export async function findUserByEmail(email: string) {
  return prisma.users.findUnique({
    where: {
      email: email.toLowerCase().trim(),
    },
  });
}