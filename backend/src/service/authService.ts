import prisma from "../utils/prisma";

// cari user berdasarkan email (untuk login)
export async function findUserByEmail(email: string) {
  return prisma.users.findUnique({ 
    where: { email: email.toLowerCase().trim() } 
  });
}
