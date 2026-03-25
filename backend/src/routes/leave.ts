import { Router } from "express";
import {
  createLeave,
  getLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
  bulkDeleteLeave,  // ✅ IMPORT INI
} from "../controllers/leaveController";
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
  createLeave
);

router.get(
  "/",
  requireRole([UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE]),
  getLeave
);

router.patch(
  "/approve/:id",
  requireRole([UserRole.HR]),
  approveLeave
);

router.patch(
  "/reject/:id",
  requireRole([UserRole.HR]),
  rejectLeave
);

// ✅ DELETE ROUTES
router.delete("/:id", requireRole([UserRole.HR, UserRole.ADMIN]), deleteLeave);
router.delete("/bulk", requireRole([UserRole.HR, UserRole.ADMIN]), bulkDeleteLeave);

export default router;
