import { Request, Response } from "express";
import { signToken } from "../utils/jwt";
import * as userService from "../service/userService";

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // VALIDASI INPUT
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
      return;
    }

    // NORMALISASI EMAIL
    const normalizedEmail = email.includes("@")
      ? email.toLowerCase().trim()
      : `${email.toLowerCase().trim()}@gmail.com`;

    // CARI USER DI DATABASE
    const user = await userService.findUserByEmail(normalizedEmail);

    console.log("LOGIN REQUEST:", normalizedEmail, password);
    console.log("USER DARI DB:", user);

    // CEK USER
    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
      return;
    }

    // ❗ INI BAGIAN PENTING (PAKAI PLAIN TEXT DULU)
    if (password !== user.password) {
      res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
      return;
    }

    // GENERATE TOKEN
    const token = signToken({
      id_user: user.id_user,
      role: user.role,
    });

    // RESPONSE
    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id_user: user.id_user,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}