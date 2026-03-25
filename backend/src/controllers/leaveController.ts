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

    const employee = await employeeService.findEmployeeByUserId(
      user.id_user
    );

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee not found",
      });
    }

    /* =========================
       VALIDASI TANGGAL
    ========================= */

    const startDate = normalizeDate(new Date(start_date));
    const endDate = normalizeDate(new Date(end_date));

    const today = normalizeDate(new Date());

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // minimal H-1 kecuali sakit
    if (leave_type !== LeaveType.SICK && startDate < tomorrow) {
      return res.status(400).json({
        success: false,
        message: "Pengajuan cuti minimal H-1 (tidak bisa hari ini)",
      });
    }

    // end tidak boleh sebelum start
    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
      });
    }

    // hitung durasi
    const diffDays =
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24) +
      1;

    if (diffDays > 30) {
      return res.status(400).json({
        success: false,
        message: "Durasi cuti maksimal 30 hari",
      });
    }

    /* =========================
       CREATE DATA
    ========================= */

    const result = await leaveService.createLeave({
      id_employee: employee.id_employee,
      leave_type: leave_type as LeaveType,
      start_date: startDate,
      end_date: endDate,
      reason,
      attachment: req.file ? req.file.filename : undefined,
    });

    /* =========================
       LOG ACTIVITY
    ========================= */

    await logService.createLog({
      id_user: user.id_user,
      action: "CREATE",
      table_name: "leave",
      description: `Karyawan ${employee.full_name} mengajukan cuti ${leave_type}`,
    });

    /* =========================
       SOCKET NOTIFICATION
    ========================= */

    const io = req.app.get("io");

    if (io) {
      io.emit("newLeaveRequest", {
        message: `Pengajuan ${leave_type} baru dari ${employee.full_name}`,
        employee: employee.full_name,
        type: leave_type,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
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

      return res.json({
        success: true,
        data: list,
      });
    }

    const employee = await employeeService.findEmployeeByUserId(
      user.id_user
    );

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee not found",
      });
    }

    const list = await leaveService.getLeaveByEmployee(
      employee.id_employee
    );

    res.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}

/* =========================
   APPROVE LEAVE
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

    await logService.createLog({
      id_user: user.id_user,
      action: "UPDATE",
      table_name: "leave",
      description: `User (Role: ${user.role}) menyetujui pengajuan cuti ID: ${id}`,
    });

    const io = req.app.get("io");

    if (io) {
      io.emit(`leaveStatus_${result.employee.id_employee}`, {
        message: "Pengajuan cuti Anda telah DISETUJUI",
        status: "APPROVED",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}

/* =========================
   REJECT LEAVE
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

    await logService.createLog({
      id_user: user.id_user,
      action: "UPDATE",
      table_name: "leave",
      description: `User (Role: ${user.role}) menolak pengajuan cuti ID: ${id}`,
    });

    const io = req.app.get("io");

    if (io) {
      io.emit(`leaveStatus_${result.employee.id_employee}`, {
        message: "Pengajuan cuti Anda telah DITOLAK",
        status: "REJECTED",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}