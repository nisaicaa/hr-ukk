import { Request, Response } from "express";
import { UserRole, LeaveStatus, LeaveType } from "@prisma/client";
import * as employeeService from "../service/employeeService";
import * as leaveService from "../service/leaveService";
import * as logService from "../service/logService";

/* =========================
   HELPER NORMALIZE DATE
========================= */
function normalizeDate(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* =========================
   CREATE LEAVE
========================= */
export async function createLeave(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { leave_type, start_date, end_date, reason } = req.body;

    const employee = await employeeService.findEmployeeByUserId(user.id_user);

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee not found",
      });
    }

    const startDate = normalizeDate(new Date(start_date));
    const endDate = normalizeDate(new Date(end_date));

    const today = normalizeDate(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (leave_type !== LeaveType.SICK && startDate < tomorrow) {
      return res.status(400).json({
        success: false,
        message: "Pengajuan cuti minimal H-1",
      });
    }

    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: "Tanggal selesai tidak valid",
      });
    }

    const diffDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;

    if (diffDays > 30) {
      return res.status(400).json({
        success: false,
        message: "Maksimal 30 hari",
      });
    }

    const result = await leaveService.createLeave({
      id_employee: employee.id_employee,
      leave_type: leave_type as LeaveType,
      start_date: startDate,
      end_date: endDate,
      reason,
      attachment: req.file ? req.file.filename : undefined,
    });

    await logService.createLog({
      id_user: user.id_user,
      action: "CREATE",
      table_name: "leave",
      description: `Pengajuan cuti ${leave_type}`,
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/* =========================
   GET LEAVE
========================= */
export async function getLeave(req: Request, res: Response) {
  try {
    const user = req.user!;

    if (user.role === UserRole.ADMIN || user.role === UserRole.HR) {
      const list = await leaveService.getAllLeave();
      return res.json({ success: true, data: list });
    }

    const employee = await employeeService.findEmployeeByUserId(user.id_user);

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee not found",
      });
    }

    const list = await leaveService.getLeaveByEmployee(employee.id_employee);

    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/* =========================
   APPROVE
========================= */
export async function approveLeave(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;

    const result = await leaveService.updateLeaveStatus(
      Number(id),
      LeaveStatus.APPROVED,
      user.id_user
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/* =========================
   REJECT
========================= */
export async function rejectLeave(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;

    const result = await leaveService.updateLeaveStatus(
      Number(id),
      LeaveStatus.REJECTED,
      user.id_user
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/* =========================
   DELETE SINGLE
========================= */
export async function deleteLeave(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await leaveService.deleteLeave(Number(id));

    res.json({
      success: true,
      message: "Deleted",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/* =========================
   BULK DELETE
========================= */
export async function bulkDeleteLeave(req: Request, res: Response) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "ids harus array",
      });
    }

    const result = await leaveService.bulkDeleteLeaves(ids);

    res.json({
      success: true,
      message: "Bulk deleted",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}