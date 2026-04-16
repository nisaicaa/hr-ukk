// controllers/payrollController.ts - FINAL & CLEAN
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as payrollService from "../service/PayrollService";
import * as logService from "../service/logService";

const prisma = new PrismaClient();

// =======================
// GET ALL PAYROLL (FINANCE)
// =======================
export async function getAllPayroll(req: Request, res: Response) {
  try {
    const payrolls = await payrollService.getAllPayroll();
    res.json({ success: true, data: payrolls });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// =======================
// GET PAYROLL BY EMPLOYEE
// =======================
export async function getPayrollByEmployee(req: Request, res: Response) {
  try {
    const { id_employee } = req.params;
    const payrolls = await payrollService.getPayrollByEmployee(
      Number(id_employee)
    );
    res.json({ success: true, data: payrolls });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// =======================
// GET MY PAYROLL (EMPLOYEE)
// =======================
export async function getMyPayroll(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { year } = req.query;

    const employee = await prisma.employee.findFirst({
      where: { id_user: user.id_user }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee record tidak ditemukan"
      });
    }

    const whereClause: any = {
      id_employee: employee.id_employee
    };

    if (year) {
      whereClause.periode_year = Number(year);
    }

    const payrolls = await prisma.payroll.findMany({
      where: whereClause,
      include: {
        employee: true,
        payslips: true
      },
      orderBy: [
        { periode_year: "desc" },
        { periode_month: "desc" }
      ]
    });

    res.json({
      success: true,
      data: payrolls,
      employee: {
        full_name: employee.full_name,
        nik: employee.nik,
        hire_date: employee.hire_date
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// =======================
// GENERATE / REGENERATE PAYROLL
// =======================
export async function generatePayroll(req: Request, res: Response) {
  try {
    const { periode_month, periode_year } = req.body;
    const user = req.user!;

    // Validasi input
    if (!periode_month || !periode_year) {
      return res.status(400).json({
        success: false,
        message: "periode_month dan periode_year wajib diisi"
      });
    }

    // Panggil service untuk generate/regenerate payroll
    const payrolls = await payrollService.generatePayroll(
      Number(periode_month),
      Number(periode_year)
    );

    // Update net_salary pada payslip jika sudah ada
    for (const payroll of payrolls) {
      if (payroll.payslips && payroll.payslips.length > 0) {
        await prisma.payslip.update({
          where: { id_payroll: payroll.id_payroll },
          data: { net_salary: payroll.total_salary }
        });
      }
    }

    // Simpan log aktivitas
    await logService.createLog({
      id_user: user.id_user,
      action: "CREATE",
      table_name: "payroll",
      description: `User (Role: ${user.role}) generate/regenerate payroll periode ${periode_month}/${periode_year}`
    });

    res.json({
      success: true,
      message: `${payrolls.length} payroll berhasil dibuat atau diperbarui`,
      data: payrolls
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Gagal memproses payroll"
    });
  }
}

// =======================
// GENERATE PAYSLIP
// =======================
export async function generatePayslip(req: Request, res: Response) {
  try {
    const { id_payroll } = req.params;
    const user = req.user!;

    const payslip = await payrollService.generatePayslip(
      Number(id_payroll)
    );

    await logService.createLog({
      id_user: user.id_user,
      action: "CREATE",
      table_name: "payslip",
      description: `User (Role: ${user.role}) generate slip gaji untuk payroll ID: ${id_payroll}`
    });

    res.json({
      success: true,
      data: payslip
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// =======================
// GET PAYROLL BY MONTH
// =======================
export async function getPayrollByMonth(req: Request, res: Response) {
  try {
    const { periode_month, periode_year } = req.query;

    const payrolls = await payrollService.getPayrollByMonth(
      Number(periode_month),
      Number(periode_year)
    );

    res.json({ success: true, data: payrolls });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// =======================
// DELETE PAYROLL
// =======================
export async function deletePayroll(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;
    const id_payroll = Number(id);

    const payroll = await payrollService.deletePayrollById(
      id_payroll
    );

    await logService.createLog({
      id_user: user.id_user,
      action: "DELETE",
      table_name: "payroll",
      description: `Hapus payroll ID: ${id_payroll} (${payroll.employee.full_name})`
    });

    res.json({
      success: true,
      message: `Payroll ${payroll.employee.full_name} (${id_payroll}) berhasil dihapus beserta payslip`,
      deleted: payroll
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}