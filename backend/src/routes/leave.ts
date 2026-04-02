import { Router } from "express";
import * as leaveController from "../controllers/leaveController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { UserRole } from "@prisma/client";
import upload from "../utils/multer";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  requireRole([UserRole.EMPLOYEE]),
  upload.single("attachment"),
  leaveController.createLeave
);

router.get(
  "/",
  requireRole([UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE]),
  leaveController.getLeave
);

router.patch(
  "/approve/:id",
  requireRole([UserRole.HR]),
  leaveController.approveLeave
);

router.patch(
  "/reject/:id",
  requireRole([UserRole.HR]),
  leaveController.rejectLeave
);

// ✅ WAJIB: bulk dulu baru :id
router.delete(
  "/bulk",
  requireRole([UserRole.HR, UserRole.ADMIN]),
  leaveController.bulkDeleteLeave
);

router.delete(
  "/:id",
  requireRole([UserRole.HR, UserRole.ADMIN]),
  leaveController.deleteLeave
);

export default router;