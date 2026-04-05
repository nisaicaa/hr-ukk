import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt";
import * as userService from "../service/userService";

// CONTROLLERS UNTUK LOGIN
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
      return;
    }

    const normalizedEmail = email.includes("@")
      ? email.toLowerCase().trim()
      : `${email.toLowerCase().trim()}@gmail.com`;

    const user = await userService.findUserByEmail(normalizedEmail);

    if (!user || !user.is_active) {
      res.status(401).json({ success: false, message: "Email atau password salah" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ success: false, message: "Email atau password salah" });
      return;
    }

    const token = signToken({
      id_user: user.id_user,
      role: user.role,
    });

    res.json({
      success: true,
      token,
      user: {
        id_user: user.id_user,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}