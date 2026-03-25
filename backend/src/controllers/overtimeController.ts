import { Request, Response } from "express";
import { UserRole, OvertimeStatus } from "@prisma/client";
import * as employeeService from "../service/employeeService";
import * as overtimeService from "../service/overtimeService";
// ✅ 1. IMPORT SERVICE LOG
import * as logService from "../service/logService";

export async function createOvertime(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { date, start_time, end_time, overtime_reason } = req.body;

    const employee = await employeeService.findEmployeeByUserId(user.id_user);
    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee not found" });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);

    const total_minutes = Math.max(
      0,
      Math.round((end.getTime() - start.getTime()) / 60000)
    );

    const result = await overtimeService.createOvertime({
      id_employee: employee.id_employee,
      date: new Date(date),
      start_time: start,
      end_time: end,
      total_minutes,
      overtime_reason,
    });

    // ✅ 2. LOG AKTIVITAS (CREATE)
    await logService.createLog({
      id_user: user.id_user,
      action: "CREATE",
      table_name: "overtime",
      description: `Karyawan ${employee.full_name} mengajukan lembur pada ${date}`
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

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

export async function approveOvertime(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;

    const result = await overtimeService.updateOvertimeStatus(
      Number(id),
      OvertimeStatus.APPROVED,
      user.id_user // FIXED
    );

    // ✅ 3. LOG AKTIVITAS (UPDATE - APPROVE)
    await logService.createLog({
      id_user: user.id_user,
      action: "UPDATE",
      table_name: "overtime",
      description: `User (Role: ${user.role}) menyetujui pengajuan lembur ID: ${id}`
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function rejectOvertime(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;

    const result = await overtimeService.updateOvertimeStatus(
      Number(id),
      OvertimeStatus.REJECTED,
      user.id_user // FIXED
    );

    // ✅ 4. LOG AKTIVITAS (UPDATE - REJECT)
    await logService.createLog({
      id_user: user.id_user,
      action: "UPDATE",
      table_name: "overtime",
      description: `User (Role: ${user.role}) menolak pengajuan lembur ID: ${id}`
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}