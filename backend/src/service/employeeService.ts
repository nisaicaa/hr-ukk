import prisma from "../utils/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs";
import csv from "csv-parser";
import XLSX from "xlsx";

const DEFAULT_PASSWORD = "humanest26";

/* =========================
   HELPER
========================= */

function normalizeHeader(header: string) {
  return header
    ?.toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .trim();
}

function formatDate(value: any) {
  if (!value) return "1990-01-01";

  if (!isNaN(value)) {
    const date = new Date((value - 25569) * 86400 * 1000);
    return date.toISOString();
  }

  const d = new Date(value);
  return isNaN(d.getTime()) ? "1990-01-01" : d.toISOString();
}

/* =========================
   MAIN SERVICES
========================= */

export async function listEmployees() {
  return prisma.employee.findMany({
    where: { employee_status: "AKTIF" },
    include: {
      user: {
        select: {
          id_user: true,
          username: true,
          email: true,
          role: true,
          is_active: true
        }
      }
    },
    orderBy: { created_at: "desc" }
  });
}

export async function createEmployeeWithUser(data: any) {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  return prisma.$transaction(async (tx) => {
    if (!data.nik || !data.full_name) {
      throw new Error("nik dan full_name wajib diisi");
    }

    const existingNik = await tx.employee.findUnique({
      where: { nik: data.nik.trim() }
    });
    if (existingNik) throw new Error("NIK sudah terdaftar");

    let finalEmail = data.email?.trim();
    if (!finalEmail?.includes("@")) {
      finalEmail = `${data.nik}@perusahaan.local`;
    }

    const existingEmail = await tx.users.findUnique({
      where: { email: finalEmail }
    });
    if (existingEmail) throw new Error("Email sudah digunakan");

    const user = await tx.users.create({
      data: {
        username: data.username?.trim() || data.nik.trim(),
        email: finalEmail,
        password: hashedPassword,
        role: UserRole.EMPLOYEE
      }
    });

    return tx.employee.create({
      data: {
        id_user: user.id_user,
        nik: data.nik.trim(),
        full_name: data.full_name.trim(),
        departemen: data.departemen || "Umum",
        jabatan: data.jabatan || "Staff",
        birth_date: new Date(formatDate(data.birth_date)),
        hire_date: new Date(formatDate(data.hire_date)),
        employee_status: "AKTIF",
        basic_salary: Number(data.basic_salary) || 0,
        phone_number: data.phone_number || "",
        bank_name: data.bank_name || "",
        bank_account: data.bank_account || "",
        bank_holder: data.bank_holder || ""
      },
      include: { user: true }
    });
  });
}

/* =========================
   BULK IMPORT (FIX TOTAL)
========================= */

export async function bulkProcessExcel(filePath: string) {
  const results: any[] = [];
  const errors: string[] = [];

  try {
    let resultsArray: any[] = [];
    const ext = filePath.split(".").pop()?.toLowerCase();

    /* ================= CSV ================= */
    if (ext === "csv") {
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
         .pipe(csv({
  skipEmptyLines: true,
  mapHeaders: ({ header }) =>
    header
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .trim()
}))
          .on("data", (row) => resultsArray.push(row))
          .on("end", resolve)
          .on("error", reject);
      });
    }

    /* ================= XLSX ================= */
    else {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1
      });

      const headers = (jsonData[0] as string[]).map(normalizeHeader);

      resultsArray = jsonData.slice(1).map((row: any) => {
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      });
    }

    console.log("TOTAL DATA:", resultsArray.length);

    /* ================= LOOP PROCESS ================= */
    for (let i = 0; i < resultsArray.length; i++) {
      const row = resultsArray[i];

      const cleanRow = Object.fromEntries(
        Object.entries(row).map(([key, val]) => [
          normalizeHeader(key),
          typeof val === "string" ? val.trim() : val
        ])
      );

      try {
        const normalizedRow: any = {
          nik: cleanRow.nik || cleanRow.nik_karyawan || "",

          full_name:
            cleanRow.full_name ||
            cleanRow.nama ||
            cleanRow.nama_lengkap ||
            "",

          email: cleanRow.email || "",
          username: cleanRow.username || cleanRow.nik || "",

          departemen:
            cleanRow.departemen ||
            cleanRow.dept ||
            "Umum",

          jabatan:
            cleanRow.jabatan ||
            cleanRow.posisi ||
            "Staff",

          birth_date: formatDate(
            cleanRow.birth_date || cleanRow.tanggal_lahir
          ),

          hire_date: formatDate(
            cleanRow.hire_date || cleanRow.tanggal_masuk
          ),

          basic_salary: Number(
            cleanRow.basic_salary || cleanRow.gaji || 0
          ),

          phone_number:
            cleanRow.phone_number ||
            cleanRow.no_hp ||
            "",

          bank_name:
            cleanRow.bank_name ||
            cleanRow.bank ||
            "",

          bank_account:
            cleanRow.bank_account ||
            cleanRow.rekening ||
            "",

          bank_holder:
            cleanRow.bank_holder ||
            cleanRow.nama_rekening ||
            ""
        };

        // DEBUG (penting!)
        console.log("ROW:", normalizedRow);

        if (!normalizedRow.nik) {
          errors.push(`Baris ${i + 1}: NIK kosong`);
          continue;
        }

        if (!normalizedRow.full_name) {
          errors.push(`Baris ${i + 1}: Nama kosong`);
          continue;
        }

        await createEmployeeWithUser(normalizedRow);

        results.push({
          row: i + 1,
          nik: normalizedRow.nik,
          full_name: normalizedRow.full_name
        });
      } catch (err: any) {
        errors.push(`Baris ${i + 1}: ${err.message}`);
      }
    }

    return {
      results,
      errors,
      summary: `${results.length} berhasil, ${errors.length} gagal`
    };
  } catch (error: any) {
    throw new Error(`Gagal memproses file: ${error.message}`);
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

/* =========================
   FIND
========================= */

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