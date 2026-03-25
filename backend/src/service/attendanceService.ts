import prisma from "../utils/prisma";
import { AttendanceStatus } from "@prisma/client";

export function makeDateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function findAttendanceForEmployeeOnDate(id_employee: number, date: Date) {
  return prisma.attendance.findFirst({
    where: { 
      id_employee, 
      date 
    }
  });
}

export async function upsertCheckIn(payload: {
  id_employee: number;
  date: Date;
  check_in: Date;
  checkin_latitude?: number;
  checkin_longitude?: number;
  checkin_address?: string;
  attendance_status: AttendanceStatus;
  checkin_photo?: string;
}) {
  const existing = await findAttendanceForEmployeeOnDate(payload.id_employee, payload.date);
  
  if (!existing) {
    return prisma.attendance.create({ 
      data: payload as any 
    });
  }
  
  return prisma.attendance.update({
    where: { id_attendance: existing.id_attendance },
    data: payload as any
  });
}

export async function checkOutAttendance(
  id_attendance: number, 
  data: {
    check_out: Date;
    checkout_latitude?: number;
    checkout_longitude?: number;
    checkout_address?: string;
    work_duration_minutes?: number;
    checkout_photo?: string;
  }
) {
  return prisma.attendance.update({
    where: { id_attendance },
    data
  });
}

export async function listAttendanceForEmployee(id_employee: number) {
  return prisma.attendance.findMany({
    where: { id_employee },
    orderBy: { date: 'desc' }
  });
}

// ✅ FIX: Ambil full_name dari employee, bukan user
export async function listAllAttendance() {
  try {
    const result = await prisma.attendance.findMany({
      include: {
        employee: {
          // ✅ full_name ada di employee, bukan user
          select: {
            id_employee: true,
            full_name: true,
            nik: true,
            departemen: true
          }
        }
      },
      orderBy: { 
        date: 'desc' 
      }
    });
    
    console.log("Service - Total attendance records:", result.length);
    return result;
  } catch (error) {
    console.error("listAllAttendance error:", error);
    throw error;
  }
}
