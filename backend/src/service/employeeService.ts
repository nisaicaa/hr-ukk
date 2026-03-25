import prisma from "../utils/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs";
import csv from "csv-parser";
import XLSX from "xlsx"; // npm install xlsx

const DEFAULT_PASSWORD = "humanest26";

export async function listEmployees() {
  return prisma.employee.findMany({
    where: { employee_status: "AKTIF" },
    include: { user: { select: { id_user: true, username: true, email: true, role: true, is_active: true } } },
    orderBy: { created_at: "desc" },
  });
}

export async function createEmployeeWithUser(data: any) {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  return prisma.$transaction(async (tx) => {
    if (!data.nik || !data.full_name) {
      throw new Error("nik dan full_name wajib diisi");
    }

    // Cek NIK sudah ada
    const existingNik = await tx.employee.findUnique({ where: { nik: data.nik.trim() } });
    if (existingNik) throw new Error("NIK sudah terdaftar");

    // Generate email jika kosong
    let finalEmail = data.email?.trim();
    if (!finalEmail?.includes("@")) {
      finalEmail = `${data.nik}@perusahaan.local`;
    }

    // Cek email sudah ada
    const existingEmail = await tx.users.findUnique({ where: { email: finalEmail } });
    if (existingEmail) throw new Error("Email sudah digunakan");

    // Buat user dulu
    const user = await tx.users.create({
      data: { 
        username: data.username?.trim() || data.nik.trim(), 
        email: finalEmail, 
        password: hashedPassword, 
        role: UserRole.EMPLOYEE 
      },
    });

    // Buat employee
    return tx.employee.create({
      data: {
        id_user: user.id_user,
        nik: data.nik.trim(),
        full_name: data.full_name.trim(),
        departemen: data.departemen || 'Umum',
        jabatan: data.jabatan || 'Staff',
        birth_date: new Date(data.birth_date),
        hire_date: new Date(data.hire_date),
        employee_status: "AKTIF",
        basic_salary: Number(data.basic_salary) || 0,
        phone_number: data.phone_number || '',
        bank_name: data.bank_name || '',
        bank_account: data.bank_account || '',
        bank_holder: data.bank_holder || '',
      },
      include: { user: true },
    });
  });
}

// **BARU: BULK PROCESSING**
export async function bulkProcessExcel(filePath: string) {
  const results: any[] = [];
  const errors: string[] = [];

  try {
    let resultsArray: any[] = [];

    // **SUPPORT XLSX DAN CSV**
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    if (ext === 'csv') {
      // Parse CSV
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv({
            headers: true,
            skipEmptyLines: true,
            trim: true,
            skipLines: 1 // Skip header jika ada
          }))
          .on('data', (row) => resultsArray.push(row))
          .on('end', () => resolve())
          .on('error', reject);
      });
    } else {
      // Parse XLSX
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Ambil header dari baris pertama
      const headers = jsonData[0] as string[];
      resultsArray = jsonData.slice(1).map((row: any) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header?.toLowerCase().trim()] = row[index];
        });
        return obj;
      });
    }

    console.log(`Processing ${resultsArray.length} rows...`);

    // **TRANSACTION BULK UNTUK KEAMANAN**
    for (let i = 0; i < resultsArray.length; i++) {
      const row = resultsArray[i];
      
      try {
        // **VALIDASI LENGKAP**
        if (!row.nik || !row['full_name'] && !row.full_name) {
          errors.push(`Baris ${i + 1}: NIK atau nama lengkap kosong`);
          continue;
        }

        // Normalisasi field names
        const normalizedRow: any = {
          nik: row.nik || row['nik'] || '',
          full_name: row['full_name'] || row.full_name || row.nama || '',
          email: row.email || row['email'] || '',
          username: row.username || row['username'] || '',
          departemen: row.departemen || row['departemen'] || row.departemen || '',
          jabatan: row.jabatan || row['jabatan'] || '',
          birth_date: row.birth_date || row['birth_date'] || '1990-01-01',
          hire_date: row.hire_date || row['hire_date'] || new Date().toISOString().split('T')[0],
          basic_salary: row.basic_salary || row['basic_salary'] || 0,
          phone_number: row.phone_number || row['phone_number'] || '',
          bank_name: row.bank_name || row['bank_name'] || '',
          bank_account: row.bank_account || row['bank_account'] || '',
          bank_holder: row.bank_holder || row['bank_holder'] || ''
        };

        await createEmployeeWithUser(normalizedRow);
        results.push({
          row: i + 1,
          nik: normalizedRow.nik,
          full_name: normalizedRow.full_name,
          email: normalizedRow.email
        });

      } catch (err: any) {
        errors.push(`Baris ${i + 1} (${row.nik || 'N/A'}): ${err.message}`);
      }
    }

    return { results, errors, summary: `${results.length} berhasil, ${errors.length} gagal` };

  } catch (error: any) {
    throw new Error(`Gagal memproses file: ${error.message}`);
  } finally {
    // Cleanup file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
export async function findEmployeeByUserId(userId: number) {
  return prisma.employee.findUnique({
    where: { id_user: userId },
    include: {
      user: {
        select: {
          id_user: true,
          username: true,
          email: true,
          role: true
        }
      }
    }
  });
}