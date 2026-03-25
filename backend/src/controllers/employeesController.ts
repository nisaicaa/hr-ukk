import { Request, Response } from "express";
import * as employeeService from "../service/employeeService";
import prisma from "../utils/prisma";
import { UserRole } from "@prisma/client";
import * as XLSX from "xlsx";
import fs from "fs";
import csv from "csv-parser";
// ✅ 1. IMPORT SERVICE LOG
import * as logService from "../service/logService";

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
    return res.status(400).json({ success: false, error: "File tidak ditemukan" });
  }

  const results: any[] = [];
  const errors: string[] = [];

  try {
    const fileExt = filePath.split('.').pop()?.toLowerCase();
    let rows: any[] = [];

    // ===========================
    // HANDLE CSV
    // ===========================
    if (fileExt === "csv") {
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv({ trim: true }))
          .on("data", (row) => rows.push(row))
          .on("end", () => resolve())
          .on("error", (err) => reject(err));
      });
    }

    // ===========================
    // HANDLE EXCEL (.xlsx / .xls)
    // ===========================
    else if (fileExt === "xlsx" || fileExt === "xls") {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      rows = XLSX.utils.sheet_to_json(sheet, {
        defval: "", // supaya field kosong tidak undefined
        raw: false
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Format file tidak didukung"
      });
    }

    // ===========================
    // PROCESS DATA
    // ===========================
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        if (!row.nik || !row.full_name || !row.email) {
          errors.push(`Baris ${i + 1}: NIK, nama, atau email kosong`);
          continue;
        }

        await employeeService.createEmployeeWithUser({
          nik: String(row.nik).trim(),
          full_name: String(row.full_name).trim(),
          email: String(row.email).trim(),
          username: row.username ? String(row.username).trim() : String(row.nik).trim(),
          departemen: row.departemen ? String(row.departemen).trim() : "Umum",
          jabatan: row.jabatan ? String(row.jabatan).trim() : "Staff",
          birth_date: row.birth_date || "1990-01-01",
          hire_date: row.hire_date || new Date().toISOString().split("T")[0],
          basic_salary: row.basic_salary ? Number(row.basic_salary) : 0,
          phone_number: row.phone_number ? String(row.phone_number).trim() : "",
          bank_name: row.bank_name ? String(row.bank_name).trim() : "",
          bank_account: row.bank_account ? String(row.bank_account).trim() : "",
          bank_holder: row.bank_holder ? String(row.bank_holder).trim() : "",
        });

        results.push({
          nik: row.nik,
          full_name: row.full_name,
          email: row.email
        });

      } catch (err: any) {
        errors.push(`Baris ${i + 1} (${row.nik}): ${err.message}`);
      }
    }

    // ✅ 5. LOG AKTIVITAS (BULK IMPORT)
    await logService.createLog({
      id_user: (req as any).user?.id_user,
      action: "IMPORT",
      table_name: "employee",
      description: `Bulk import karyawan berhasil: ${results.length} data, gagal: ${errors.length} data`
    });

    // Hapus file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.json({
      success: true,
      summary: `${results.length} berhasil, ${errors.length} gagal`,
      results,
      errors,
      password: "humanest26"
    });

  } catch (error: any) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(500).json({ success: false, error: error.message });
  }
};