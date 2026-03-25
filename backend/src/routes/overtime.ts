import { Router } from "express";
import {
  createOvertime,
  getOvertime,
  approveOvertime,
  rejectOvertime,
} from "../controllers/overtimeController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  requireRole([UserRole.EMPLOYEE]),
  createOvertime
);

router.get(
  "/",
  requireRole([UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE]),
  getOvertime
);

router.patch(
  "/approve/:id",
  requireRole([UserRole.HR]),
  approveOvertime
);

router.patch(
  "/reject/:id",
  requireRole([UserRole.HR]),
  rejectOvertime
);

export default router;