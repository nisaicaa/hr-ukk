import prisma from "../utils/prisma";
import { AttendanceStatus } from "@prisma/client";

// ✅ helper: ambil tanggal tanpa jam
export function makeDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// ✅ cari attendance hari ini
export async function findAttendanceForEmployeeOnDate(
  idemployee: number,
  date: Date
) {
  return prisma.attendance.findFirst({
    where: {
      id_employee: idemployee,
      date: date,
    },
  });
}

// ✅ CHECK-IN (ANTI DOUBLE + UPDATE KALAU ADA RECORD TANPA CHECKIN)
export async function upsertCheckIn(payload: {
  idemployee: number;
  date: Date;
  check_in: Date;
  checkin_latitude?: number;
  checkin_longitude?: number;
  checkin_address?: string;
  attendance_status: AttendanceStatus;
  checkin_photo?: string;
  late_minutes?: number;
}) {
  const existing = await findAttendanceForEmployeeOnDate(
    payload.idemployee,
    payload.date
  );

  const photoString = payload.checkin_photo
    ? String(payload.checkin_photo)
    : undefined;

  // ❗ kalau BELUM ADA → create
  if (!existing) {
    return prisma.attendance.create({
      data: {
        id_employee: payload.idemployee,
        date: payload.date,
        check_in: payload.check_in,
        checkin_latitude: payload.checkin_latitude,
        checkin_longitude: payload.checkin_longitude,
        checkin_address: payload.checkin_address,
        attendance_status: payload.attendance_status,
        checkin_photo: photoString,
        late_minutes: payload.late_minutes || 0,
      },
    });
  }

  // ❌ kalau sudah check-in → blok
  if (existing.check_in) {
    throw new Error("Kamu sudah check-in hari ini");
  }

  // ✅ kalau record ada tapi belum check-in → update
  return prisma.attendance.update({
    where: { id_attendance: existing.id_attendance },
    data: {
      check_in: payload.check_in,
      checkin_latitude: payload.checkin_latitude,
      checkin_longitude: payload.checkin_longitude,
      checkin_address: payload.checkin_address,
      attendance_status: payload.attendance_status,
      checkin_photo: photoString,
      late_minutes: payload.late_minutes || 0,
    },
  });
}

// ✅ CHECK-OUT
export async function checkOutAttendance(
  id_attendance: number,
  payload: {
    check_out: Date;
    checkout_latitude?: number;
    checkout_longitude?: number;
    checkout_address?: string;
    work_duration_minutes?: number;
    checkout_photo?: string;
  }
) {
  const photoString = payload.checkout_photo
    ? String(payload.checkout_photo)
    : undefined;

  return prisma.attendance.update({
    where: { id_attendance },
    data: {
      check_out: payload.check_out,
      checkout_latitude: payload.checkout_latitude,
      checkout_longitude: payload.checkout_longitude,
      checkout_address: payload.checkout_address,
      work_duration_minutes: payload.work_duration_minutes,
      checkout_photo: photoString,
    },
  });
}

// ✅ LIST PUNYA SENDIRI
export async function listAttendanceForEmployee(idemployee: number) {
  return prisma.attendance.findMany({
    where: { id_employee: idemployee },
    orderBy: { date: "desc" },
  });
}

// ✅ LIST SEMUA (HR / ADMIN)
export async function listAllAttendance() {
  return prisma.attendance.findMany({
    include: {
      employee: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });
}