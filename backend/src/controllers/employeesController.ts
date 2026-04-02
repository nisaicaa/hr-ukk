import { Request, Response } from "express";
import * as employeeService from "../service/employeeService";
import prisma from "../utils/prisma";
import { UserRole } from "@prisma/client";
import * as XLSX from "xlsx";
import fs from "fs";
import csv from "csv-parser";
// 1. IMPORT SERVICE LOG
import * as logService from "../service/logService";

// GET profile
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id_user;

    const employee = await prisma.employee.findFirst({
      where: { id_user: userId },
      include: {
        user: {
          select: {
            id_user: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Profile tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//UPDATE profile (employee sendiri)
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id_user;

    const employee = await prisma.employee.findFirst({
      where: { id_user: userId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Profile tidak ditemukan",
      });
    }

    const {
      full_name,
      phone_number,
      bank_name,
      bank_account,
      bank_holder,
    } = req.body;

    // ✅ ambil file
    const profile_picture = (req as any).file?.filename;

    const updated = await prisma.employee.update({
      where: { id_employee: employee.id_employee },
      data: {
        full_name,
        phone_number,
        bank_name,
        bank_account,
        bank_holder,
        ...(profile_picture && { profile_picture }),
      },
    });

    await logService.createLog({
      id_user: userId,
      action: "UPDATE",
      table_name: "employee",
      description: `Update profile sendiri: ${updated.full_name}`,
    });

    res.json({
      success: true,
      data: updated,
    });

  } catch (error: any) {
    console.log(error); // 🔥 WAJIB BIAR KELIHATAN ERROR ASLI
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET semua employee
export const getEmployees = async (_req: Request, res: Response) => {
  try {
    const employees = await employeeService.listEmployees();
    res.json({ success: true, data: employees });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET employee by ID
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const employee = await prisma.employee.findUnique({
      where: { id_employee: id },
      include: { user: { select: { id_user: true, username: true, email: true, role: true, is_active: true } } },
    });
    if (!employee) return res.status(404).json({ success: false, message: "Karyawan tidak ditemukan" });
    res.json({ success: true, data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// CREATE employee SINGLE (form manual)
export const createEmployeeSingle = async (req: Request, res: Response) => {
  try {
    const {
      nik, full_name, email, username, departemen, jabatan,
      birth_date, hire_date, basic_salary, phone_number,
      bank_name, bank_account, bank_holder
    } = req.body;

    if (!nik || !full_name || !email) {
      return res.status(400).json({
        success: false,
        message: "nik, full_name, dan email wajib diisi"
      });
    }

    const employee = await employeeService.createEmployeeWithUser({
      nik: nik.trim(),
      full_name: full_name.trim(),
      email: email.trim(),
      username: username?.trim() || nik.trim(),
      departemen: departemen?.trim() || 'Umum',
      jabatan: jabatan?.trim() || 'Staff',
      birth_date: birth_date || '1990-01-01',
      hire_date: hire_date || new Date().toISOString().split('T')[0],
      basic_salary: Number(basic_salary) || 0,
      phone_number: phone_number?.trim() || '',
      bank_name: bank_name?.trim() || '',
      bank_account: bank_account?.trim() || '',
      bank_holder: bank_holder?.trim() || '',
    });

    // ✅ 2. LOG AKTIVITAS (CREATE)
    await logService.createLog({
      id_user: (req as any).user?.id_user,
      action: "CREATE",
      table_name: "employee",
      description: `Menambahkan karyawan: ${employee.full_name} (NIK: ${employee.nik})`
    });

    res.status(201).json({
      success: true,
      data: employee,
      password: "humanest26"
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// UPDATE employee
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existingEmployee = await prisma.employee.findUnique({
      where: { id_employee: id },
      include: { user: true }
    });

    if (!existingEmployee) {
      return res.status(404).json({ success: false, message: "Karyawan tidak ditemukan" });
    }

    const {
      nik, full_name, departemen, jabatan, birth_date, hire_date,
      basic_salary, phone_number, bank_name, bank_account, bank_holder,
      username, email
    } = req.body;

    const data: any = {
      nik: nik?.trim(),
      full_name: full_name?.trim(),
      departemen: departemen?.trim(),
      jabatan: jabatan?.trim(),
      birth_date: new Date(birth_date),
      hire_date: new Date(hire_date),
      basic_salary: Number(basic_salary),
      phone_number: phone_number?.trim(),
      bank_name: bank_name?.trim(),
      bank_account: bank_account?.trim(),
      bank_holder: bank_holder?.trim(),
    };

    // Update user jika ada perubahan username/email
    if (username || email) {
      await prisma.users.update({
        where: { id_user: existingEmployee.id_user },
        data: {
          username: username?.trim() || existingEmployee.user.username,
          email: email?.trim() || existingEmployee.user.email,
        }
      });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id_employee: id },
      data,
      include: { user: true }
    });

    // ✅ 3. LOG AKTIVITAS (UPDATE)
    await logService.createLog({
      id_user: (req as any).user?.id_user,
      action: "UPDATE",
      table_name: "employee",
      description: `Mengupdate data karyawan: ${updatedEmployee.full_name} (NIK: ${updatedEmployee.nik})`
    });

    res.json({ success: true, data: updatedEmployee });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE employee (soft delete)
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    // Temukan employee dulu untuk log nama
    const employee = await prisma.employee.findUnique({ where: { id_employee: id } });
    if (!employee) {
        return res.status(404).json({ success: false, message: "Karyawan tidak ditemukan" });
    }

    const deletedEmployee = await prisma.employee.updateMany({
      where: { id_employee: id },
      data: { employee_status: "NONAKTIF" }
    });

    if (deletedEmployee.count === 0) {
      return res.status(404).json({ success: false, message: "Karyawan tidak ditemukan" });
    }

    // ✅ 4. LOG AKTIVITAS (DELETE/SOFT DELETE)
    await logService.createLog({
      id_user: (req as any).user?.id_user,
      action: "DELETE",
      table_name: "employee",
      description: `Menonaktifkan karyawan: ${employee.full_name} (NIK: ${employee.nik})`
    });

    res.json({ success: true, message: "Karyawan berhasil dihapus (dinonaktifkan)" });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// BULK IMPORT - CLEAN & ROBUST
export const bulkImport = async (req: Request, res: Response) => {
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({
      success: false,
      error: "File tidak ditemukan"
    });
  }

  try {
    const result = await employeeService.bulkProcessExcel(filePath);

    await logService.createLog({
      id_user: (req as any).user?.id_user,
      action: "IMPORT",
      table_name: "employee",
      description: `Import karyawan: ${result.summary}`
    });

    return res.json({
      success: true,
      ...result,
      password: "humanest26"
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};