import prisma from "../utils/prisma";
import { OvertimeStatus } from "@prisma/client";

// CREATE OVERTIME 
export async function createOvertime(data: {
  id_employee: number;
  date: Date;
  start_time: Date;
  end_time: Date;
  total_minutes: number;
  overtime_reason: string;
}) {
  return prisma.overtime.create({
    data: {
      ...data,
      overtime_status: OvertimeStatus.PENDING,
    },
  });
}

// GET OVERTIME BY EMPLOYEE
export async function getOvertimeByEmployee(id_employee: number) {
  return prisma.overtime.findMany({
    where: { id_employee },
    orderBy: { created_at: "desc" },
  });
}

export async function getAllOvertime() {
  return prisma.overtime.findMany({
    include: {
      employee: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function updateOvertimeStatus(
  id_overtime: number,
  status: OvertimeStatus,
  approved_by: number // FIXED TYPE
) {
  return prisma.overtime.update({
    where: { id_overtime },
    data: {
      overtime_status: status,
      approved_by,
      approved_date: new Date(),
    },
  });
}