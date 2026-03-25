import prisma from "../utils/prisma";
import { UserRole } from "@prisma/client";

export async function findUserByEmail(email: string) {
  return prisma.users.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
}

export async function findUserByUsername(username: string) {
  return prisma.users.findUnique({
    where: { username },
  });
}

export async function findUserById(id: number) {
  return prisma.users.findUnique({
    where: { id_user: id },
  });
}

export async function getAllUsers() {
  return prisma.users.findMany({
    select: {
      id_user: true,
      username: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
      updated_at: true
    }
  });
}

export async function createUser(data: {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}) {

  return prisma.users.create({
    data
  });

}

export async function updateUserById(id: number, data: any) {

  const updateData: any = {};

  if (data.username !== undefined) updateData.username = data.username;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.password !== undefined) updateData.password = data.password;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;

  return prisma.users.update({
    where: { id_user: id },
    data: updateData
  });

}

export async function deleteUserById(id: number) {

  return prisma.users.delete({
    where: { id_user: id }
  });

}