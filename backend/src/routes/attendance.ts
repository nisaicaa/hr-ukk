import { Router } from "express";
import { checkIn, checkOut, getAttendance, getAllAttendance } from "../controllers/attendanceController"; 
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { UserRole } from "@prisma/client";
import upload from '../utils/multer';

const router = Router();

router.use(authMiddleware);

router.post("/check-in", requireRole([UserRole.EMPLOYEE]), upload.single('photo'), checkIn);
router.post("/check-out", requireRole([UserRole.EMPLOYEE]), upload.single('photo'), checkOut);
router.get("/", requireRole([UserRole.EMPLOYEE]), getAttendance);
router.get("/all", requireRole([UserRole.ADMIN, UserRole.HR]), getAllAttendance); // ✅ ENDPOINT INI

export default router;
