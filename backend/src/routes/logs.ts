import { Router } from "express";
import { getLogs } from "../controllers/logController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authMiddleware);
// Hanya admin yang bisa melihat log
router.get("/", requireRole([UserRole.ADMIN]), getLogs);

export default router;