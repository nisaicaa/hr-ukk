import { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id_user: number;
        role: UserRole;
      };
    }
  }
}

export {};
