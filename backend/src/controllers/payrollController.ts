// controllers/payrollController.ts - LENGKAP & READY
import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import * as payrollService from "../service/PayrollService";
import * as logService from "../service/logService";

const prisma = new PrismaClient();

// GET ALL PAYROLL (HR/Admin)
export async function getAllPayroll(req: Request, res: Response) {
  try {
    const payrolls = await payrollService.getAllPayroll();
    res.json({ success: true, data: payrolls });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET PAYROLL BY EMPLOYEE (HR/Admin untuk semua employee, Employee untuk dirinya sendiri)
export async function getPayrollByEmployee(req: Request, res: Response) {
  try {
    const { id_employee } = req.params;
    const payrolls = await payrollService.getPayrollByEmployee(Number(id_employee));
    res.json({ success: true, data: payrolls });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET MY PAYROLL (EMPLOYEE)
export async function getMyPayroll(req: Request, res: Response) {
  try {
    const user = req.user!;
    
    const employee = await prisma.employee.findFirst({
      where: { id_user: user.id_user }
    });
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: "Employee record tidak ditemukan" 
      });
    }
    
    const payrolls = await prisma.payroll.findMany({
      where: { id_employee: employee.id_employee },
      include: {
        employee: {
          include: { user: true }
        },
        payslips: true
      },
      orderBy: { created_date: 'desc' }
    });
    
    res.json({ success: true, data: payrolls });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GENERATE PAYROLL (HR/Admin)
export async function generatePayroll(req: Request, res: Response) {
  try {
    const { periode_month, periode_year } = req.body;
    const user = req.user!;

    if (!periode_month || !periode_year) {
      return res.status(400).json({
        success: false,
        message: "periode_month dan periode_year wajib diisi"
      });
    }

    const payrolls = await payrollService.generatePayroll(
      Number(periode_month),
      Number(periode_year)
    );

    await logService.createLog({
      id_user: user.id_user,
      action: "CREATE",
      table_name: "payroll",
      description: `User (Role: ${user.role}) generate payroll periode ${periode_month}/${periode_year}`
    });

    res.json({
      success: true,
      message: `${payrolls.length} payroll berhasil dibuat`,
      data: payrolls
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GENERATE PAYSLIP (HR/Admin)
export async function generatePayslip(req: Request, res: Response) {
  try {
    const { id_payroll } = req.params;
    const user = req.user!;

    const payslip = await payrollService.generatePayslip(Number(id_payroll));

    await logService.createLog({
      id_user: user.id_user,
      action: "CREATE",
      table_name: "payslip",
      description: `User (Role: ${user.role}) generate slip gaji untuk payroll ID: ${id_payroll}`
    });

    res.json({ success: true, data: payslip });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET PAYROLL BY MONTH (HR/Admin)
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

// DELETE PAYROLL BY ID (HR/Admin)
export async function deletePayroll(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;
    const id_payroll = Number(id);

    const payroll = await payrollService.deletePayrollById(id_payroll);

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
