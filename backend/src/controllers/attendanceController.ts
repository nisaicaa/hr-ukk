import { Request, Response } from "express";
import { UserRole, AttendanceStatus } from "@prisma/client";
import * as employeeService from "../service/employeeService";
import * as attendanceService from "../service/attendanceService";

function isLate(date: Date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  if (hour > 9) return true;
  if (hour === 9 && minute > 0) return true;
  return false;
}

export async function checkIn(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { latitude, longitude, address } = req.body;
    const photo = req.file;

    const employee = await employeeService.findEmployeeByUserId(user.id_user);
    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee record not found" });
    }

    const today = new Date();
    const dateOnly = attendanceService.makeDateOnly(today);
    const existing = await attendanceService.findAttendanceForEmployeeOnDate(
      employee.id_employee,
      dateOnly
    );

    if (existing && existing.check_in) {
      return res.status(400).json({ success: false, message: "Already checked in today" });
    }

    const checkInTime = new Date();
    const status = isLate(checkInTime) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    const result = await attendanceService.upsertCheckIn({
      id_employee: employee.id_employee,
      date: dateOnly,
      check_in: checkInTime,
      checkin_latitude: latitude ? parseFloat(latitude) : undefined,
      checkin_longitude: longitude ? parseFloat(longitude) : undefined,
      checkin_address: address,
      attendance_status: status,
      checkin_photo: photo ? photo.filename : undefined,
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Check-in error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function checkOut(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { latitude, longitude, address } = req.body;
    const photo = req.file;

    const employee = await employeeService.findEmployeeByUserId(user.id_user);
    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee not found" });
    }

    const today = new Date();
    const dateOnly = attendanceService.makeDateOnly(today);
    const attendance = await attendanceService.findAttendanceForEmployeeOnDate(
      employee.id_employee,
      dateOnly
    );

    if (!attendance || !attendance.check_in) {
      return res.status(400).json({ success: false, message: "No check-in record found for today" });
    }

    if (attendance.check_out) {
      return res.status(400).json({ success: false, message: "Already checked out" });
    }

    const checkOutTime = new Date();
    const duration = Math.max(
      0,
      Math.round((checkOutTime.getTime() - new Date(attendance.check_in).getTime()) / 60000)
    );

    const updated = await attendanceService.checkOutAttendance(attendance.id_attendance, {
      check_out: checkOutTime,
      checkout_latitude: latitude ? parseFloat(latitude) : undefined,
      checkout_longitude: longitude ? parseFloat(longitude) : undefined,
      checkout_address: address,
      work_duration_minutes: duration,
      checkout_photo: photo ? photo.filename : undefined,
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Check-out error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// ✅ ENDPOINT BARU UNTUK ADMIN/HR
// Pastikan export getAllAttendance
export async function getAllAttendance(req: Request, res: Response) {
  try {
    console.log("Admin fetching ALL attendance");
    const list = await attendanceService.listAllAttendance();
    console.log("Found", list.length, "attendance records");
    res.json({ success: true, data: list });
  } catch (error: any) {
    console.error("Get all attendance error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Endpoint lama untuk employee/personal
export async function getAttendance(req: Request, res: Response) {
  try {
    console.log("User accessing personal attendance:", req.user?.id_user, req.user?.role);
    
    const user = req.user!;
    
    // Employee - personal data only
    console.log("Fetching personal attendance for employee");
    const employee = await employeeService.findEmployeeByUserId(user.id_user);
    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee not found" });
    }

    const list = await attendanceService.listAttendanceForEmployee(employee.id_employee);
    res.json({ success: true, data: list });
  } catch (error: any) {
    console.error("Get personal attendance error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
