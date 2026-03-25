// routes/payroll.ts - LENGKAP
import { Router } from "express";
import {
  getAllPayroll,
  getPayrollByEmployee,
  getMyPayroll,
  generatePayroll,
  generatePayslip,
  getPayrollByMonth,
  deletePayroll  // ✅ DELETE IMPORT
} from "../controllers/payrollController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authMiddleware);

router.get("/", requireRole([UserRole.FINANCE]), getAllPayroll);
router.get("/month", requireRole([UserRole.FINANCE]), getPayrollByMonth);
router.get("/employee/:id_employee", requireRole([UserRole.FINANCE]), getPayrollByEmployee);

// ✅ ROUTE BARU UNTUK EMPLOYEE (TIDAK PERLU FINANCE ROLE)
router.get("/my-payroll", authMiddleware, getMyPayroll);

router.post("/generate", requireRole([UserRole.FINANCE]), generatePayroll);
router.post("/payslip/:id_payroll", requireRole([UserRole.FINANCE]), generatePayslip);

// ✅ DELETE ROUTE - FINANCE ONLY
router.delete("/:id", requireRole([UserRole.FINANCE]), deletePayroll);

export default router;
