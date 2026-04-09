import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import prisma from "../utils/prisma";

import * as userService from "../service/userService";
import * as logService from "../service/logService";

// list users (HR/Admin)
export async function listUsers(req: Request, res: Response) {

  try {

    const users = await userService.getAllUsers();

    res.json({
      success: true,
      data: users
    });

  } catch (error: any) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

}
// CREATE USERS
export async function createUser(req: Request, res: Response) {

  try {

    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {

      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi"
      });

    }

    const normalizedEmail = email.includes("@")
      ? email.toLowerCase().trim()
      : `${email.toLowerCase().trim()}@gmail.com`;

    const userRole = (UserRole as any)[role.toUpperCase()];

    if (!userRole) {

      return res.status(400).json({
        success: false,
        message: "Role tidak valid"
      });

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userService.createUser({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole
    });

    await logService.createLog({
      id_user: (req as any).user?.id_user,
      action: "CREATE",
      table_name: "users",
      description: `Menambahkan user baru: ${user.username}`
    });

    res.status(201).json({
      success: true,
      data: user
    });

  } catch (error: any) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

}

// UPDATE USERS
export async function updateUser(req: Request, res: Response) {

  try {

    const id = Number(req.params.id);

    const { username, email, password, role, is_active } = req.body;

    const user = await userService.findUserById(id);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });

    }

    let hashedPassword;

    if (password) {

      hashedPassword = await bcrypt.hash(password, 10);

    }

    const updated = await userService.updateUserById(id, {
      username,
      email,
      role,
      password: hashedPassword,
      is_active
    });

    await logService.createLog({
      id_user: (req as any).user?.id_user,
      action: "UPDATE",
      table_name: "users",
      description: `Update user ${updated.username}`
    });

    res.json({
      success: true,
      data: updated
    });

  } catch (error: any) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

}

// DELETE USERS
export async function deleteUser(req: Request, res: Response) {

  try {

    const id = Number(req.params.id);

    const user = await userService.findUserById(id);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });

    }

    const employee = await prisma.employee.findFirst({
      where: { id_user: id }
    });

    if (employee) {

      return res.status(400).json({
        success: false,
        message: "User masih terhubung dengan data karyawan"
      });

    }

    await userService.deleteUserById(id);

    await logService.createLog({
      id_user: (req as any).user?.id_user,
      action: "DELETE",
      table_name: "users",
      description: `Menghapus user ${user.username}`
    });

    res.json({
      success: true,
      message: "User berhasil dihapus"
    });

  } catch (error: any) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

}