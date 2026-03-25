import { Router } from "express";
import { 
  getEmployees, 
  getEmployeeById,
  createEmployeeSingle,  // ← BARU
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
router.use(requireRole([UserRole.ADMIN, UserRole.HR]));

router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.post("/bulk-single", createEmployeeSingle);  // ← BARU UNTUK SINGLE CREATE
router.post("/bulk", upload.single('excel'), bulkImport);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
