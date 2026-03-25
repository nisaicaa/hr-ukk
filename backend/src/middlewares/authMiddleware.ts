import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { UserRole } from "@prisma/client";

interface AuthRequest extends Request {
  user?: {
    id_user: number;
    role: UserRole;
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const token = auth.split(" ")[1];
    const payload = verifyToken<{ id_user: number; role: UserRole }>(token);
    req.user = { id_user: payload.id_user, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}
