import { Router } from "express";
import { 
  getEmployees, 
  getMyProfile,
  updateMyProfile,
  getEmployeeById,
  createEmployeeSingle, 
  bulkImport, 
  updateEmployee, 
  deleteEmployee 
} from "../controllers/employeesController";
import upload from '../utils/multer';
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authMiddleware);
router.use(requireRole([UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE])); // Hanya ADMIN, HR, dan EMPLOYEE yang bisa akses endpoint ini

router.put("/me", upload.single("profile_picture"), updateMyProfile); // Endpoint untuk update profil sendiri
router.get("/me", getMyProfile);
router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.post("/bulk-single", createEmployeeSingle);  // ← BARU UNTUK SINGLE CREATE
router.post("/bulk", upload.single('excel'), bulkImport);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;

