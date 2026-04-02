import { Request, Response } from 'express';
import {
  upsertCheckIn,
  makeDateOnly,
  findAttendanceForEmployeeOnDate,
  checkOutAttendance,
  listAttendanceForEmployee,
  listAllAttendance
} from '../service/attendanceService';
import prisma from '../utils/prisma';
import { AttendanceStatus } from '@prisma/client';

export const checkIn = async (req: any, res: Response) => {
  try {
    const { latitude, longitude, address, photo } = req.body;

    // fix: ambil user login
    const userId = req.user.id_user;

    const emp = await prisma.employee.findUnique({
      where: { id_user: userId }
    });

    if (!emp) {
      return res.status(404).json({ success: false, message: "Employee tidak ditemukan" });
    }

    const idemployee = emp.id_employee;

    const now = new Date();
    const today = makeDateOnly(now);

    const setting = await prisma.work_setting.findFirst();
    if (!setting) {
      return res.status(500).json({ success: false, message: "Setting kerja belum diatur" });
    }

    // VALIDASI HARI KERJA
    const todayDay = now.getDay(); // 0 minggu
    const allowedDays = setting.work_days.split(',').map(Number);

    if (!allowedDays.includes(todayDay)) {
      return res.status(400).json({
        success: false,
        message: "Hari ini hari libur!"
      });
    }

    // jam masuk
    const [h, m] = setting.work_start_time.split(':').map(Number);
    const start = new Date(today);
    start.setHours(h, m, 0, 0);

    let status: AttendanceStatus = AttendanceStatus.PRESENT;
    let late_minutes = 0;

    //  PAKAI TOLERANCE
    const tolerance = setting.late_tolerance || 0;
    const lateLimit = new Date(start.getTime() + tolerance * 60000);

    if (now > lateLimit) {
      status = AttendanceStatus.LATE;
      late_minutes = Math.floor((now.getTime() - start.getTime()) / 60000);
    }

    const attendance = await upsertCheckIn({
      idemployee,
      date: today,
      check_in: now,
      checkin_latitude: latitude ? Number(latitude) : undefined,
      checkin_longitude: longitude ? Number(longitude) : undefined,
      checkin_address: address,
      attendance_status: status,
      checkin_photo: photo,
      late_minutes
    });

    const message = status === AttendanceStatus.LATE
      ? `Check-in berhasil. Kamu terlambat ${late_minutes} menit.`
      : 'Check-in berhasil tepat waktu!';

    res.json({
      success: true,
      message,
      data: attendance,
      is_late: status === AttendanceStatus.LATE,
      late_minutes
    });

  } catch (error: any) {
    console.error("Check-in error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkOut = async (req: any, res: Response) => {
  try {
    const { latitude, longitude, address, photo } = req.body;

    const userId = req.user.id_user;

    const emp = await prisma.employee.findUnique({
      where: { id_user: userId }
    });

    if (!emp) {
      return res.status(404).json({ success: false, message: "Employee tidak ditemukan" });
    }

    const idemployee = emp.id_employee;

    const now = new Date();
    const today = makeDateOnly(now);

    const attendance = await findAttendanceForEmployeeOnDate(idemployee, today);

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'Belum check-in hari ini' });
    }

    // biar ga double checkout
    if (attendance.check_out) {
      return res.status(400).json({
        success: false,
        message: "Sudah check-out hari ini"
      });
    }

    const duration = Math.floor(
      (now.getTime() - new Date(attendance.check_in!).getTime()) / 60000
    );

    const updated = await checkOutAttendance(attendance.id_attendance, {
      check_out: now,
      checkout_latitude: latitude ? Number(latitude) : undefined,
      checkout_longitude: longitude ? Number(longitude) : undefined,
      checkout_address: address,
      work_duration_minutes: duration,
      checkout_photo: photo
    });

    res.json({
      success: true,
      message: 'Check-out berhasil',
      data: updated
    });

  } catch (error: any) {
    console.error("Check-out error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAttendance = async (req: any, res: Response) => {
  try {
    const userId = req.user.id_user;

    const emp = await prisma.employee.findUnique({
      where: { id_user: userId }
    });

    if (!emp) {
      return res.status(404).json({ success: false, message: "Employee tidak ditemukan" });
    }

    const data = await listAttendanceForEmployee(emp.id_employee);

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data absensi' });
  }
};

export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    const data = await listAllAttendance();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal mengambil semua data absensi' });
  }
};