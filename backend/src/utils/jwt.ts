import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "hrukk-super-secret-2026-forever";

export function signToken(payload: { id_user: number; role: UserRole }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken<T = unknown>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
