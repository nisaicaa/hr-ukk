import { Request, Response } from "express";
import { UserRole, OvertimeStatus } from "@prisma/client";
import * as employeeService from "../service/employeeService";
import * as overtimeService from "../service/overtimeService";
import * as logService from "../service/logService";
import prisma from "../utils/prisma"; // tambahan (AMAN)

// CONTROLLERS UNTUK OVERTIME
export async function createOvertime(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { date, start_time, end_time, overtime_reason } = req.body;

    const employee = await employeeService.findEmployeeByUserId(user.id_user);
    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee not found" });
    }

    //  VALIDASI INPUT WAJIB
    if (!date || !start_time || !end_time || !overtime_reason) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);

    // VALIDASI DATE VALID
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Format waktu tidak valid",
      });
    }

    // VALIDASI HARUS END > START
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "Jam selesai harus setelah jam mulai",
      });
    }

    const total_minutes = Math.round(
      (end.getTime() - start.getTime()) / 60000
    );

    // VALIDASI UTAMA (REVISI NO.1)
    if (total_minutes <= 0) {
      return res.status(400).json({
        success: false,
        message: "Durasi lembur tidak boleh 0",
      });
    }

    // VALIDASI MAX (biar ga ngaco)
    if (total_minutes > 720) {
      return res.status(400).json({
        success: false,
        message: "Lembur maksimal 12 jam",
      });
    }

    // VALIDASI HARUS SETELAH JAM KERJA
    const setting = await prisma.work_setting.findFirst({
      orderBy: { created_at: "desc" },
    });

    if (setting) {
      const [workHour, workMinute] = setting.work_end_time.split(":").map(Number);

      const workEnd = new Date(start);
      workEnd.setHours(workHour, workMinute, 0, 0);

      if (start < workEnd) {
        return res.status(400).json({
          success: false,
          message: "Lembur harus setelah jam kerja selesai",
        });
      }
    }

    const result = await overtimeService.createOvertime({
      id_employee: employee.id_employee,
      date: new Date(date),
      start_time: start,
      end_time: end,
      total_minutes,
      overtime_reason,
    });

    await logService.createLog({
      id_user: user.id_user,
      action: "CREATE",
      table_name: "overtime",
      description: `Karyawan ${employee.full_name} mengajukan lembur pada ${date}`,
    });

    //  BONUS: trigger socket (biar HR realtime)
    const io = req.app.get("io");
    io.emit("newOvertimeRequest");

    res.json({ success: true, data: result });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET OVERTIME (SEMUA UNTUK ADMIN/HR, KHUSUS UNTUK KARYAWAN)
export async function getOvertime(req: Request, res: Response) {
  try {
    const user = req.user!;

    if (user.role === UserRole.ADMIN || user.role === UserRole.HR) {
      const list = await overtimeService.getAllOvertime();
      return res.json({ success: true, data: list });
    }

    const employee = await employeeService.findEmployeeByUserId(user.id_user);
    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee not found" });
    }

    const list = await overtimeService.getOvertimeByEmployee(employee.id_employee);

    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// APPROVE OVERTIME (HANYA HR/ADMIN)
export async function approveOvertime(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;

    const result = await overtimeService.updateOvertimeStatus(
      Number(id),
      OvertimeStatus.APPROVED,
      user.id_user
    );

    await logService.createLog({
      id_user: user.id_user,
      action: "UPDATE",
      table_name: "overtime",
      description: `User (Role: ${user.role}) menyetujui pengajuan lembur ID: ${id}`,
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// REJECT OVERTIME (HR)
export async function rejectOvertime(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;

    const result = await overtimeService.updateOvertimeStatus(
      Number(id),
      OvertimeStatus.REJECTED,
      user.id_user
    );

    await logService.createLog({
      id_user: user.id_user,
      action: "UPDATE",
      table_name: "overtime",
      description: `User (Role: ${user.role}) menolak pengajuan lembur ID: ${id}`,
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}