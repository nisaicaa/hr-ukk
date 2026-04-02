import { Router } from "express";
import { getSetting, updateSetting } from "../controllers/workSettingController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authMiddleware);

// ✅ FIX DI SINI (pakai array)
router.get("/", requireRole([UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE]), getSetting);
router.put("/", requireRole([UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE]), updateSetting);

export default router;