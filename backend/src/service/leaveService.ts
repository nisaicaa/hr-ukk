// leaveService.ts - FULLY FIXED VERSION
import prisma from "../utils/prisma";
import { LeaveStatus, LeaveType } from "@prisma/client";
import path from 'path';
import fs from 'fs/promises';

// CREATE LEAVE
export async function createLeave(data: {
  id_employee: number;
  leave_type: LeaveType;
  start_date: Date;
  end_date: Date;
  reason: string;
  attachment?: string;
}) {
  return prisma.leave.create({
    data: {
      ...data,
      leave_status: LeaveStatus.PENDING,
    },
  });
}

// GET ALL LEAVE (HR / ADMIN)
export async function getAllLeave() {
  return prisma.leave.findMany({
    include: {
      employee: true,
      approver: true,
    },
    orderBy: { created_at: "desc" },
  });
}

// GET LEAVE BY EMPLOYEE
export async function getLeaveByEmployee(id_employee: number) {
  return prisma.leave.findMany({
    where: { id_employee },
    include: {
      approver: true,
    },
    orderBy: { created_at: "desc" },
  });
}

// UPDATE LEAVE STATUS (HR / ADMIN)
export async function updateLeaveStatus(
  id_leave: number,
  status: LeaveStatus,
  approved_by: number
) {
  return prisma.leave.update({
    where: { id_leave }, // Pastikan id_leave adalah @id di schema
    data: {
      leave_status: status,
      approved_by,
      approved_date: new Date(),
    },
    include: {
      employee: true,
    },
  });
}

// FIXED - Gunakan findFirst instead of findUnique
export async function getLeaveById(id_leave: number) {
  return prisma.leave.findFirst({
    where: { 
      id_leave // Simple where clause
    },
    include: {
      employee: true,
    },
  });
}

// FIXED - Bulk delete untuk multiple IDs
export async function bulkDeleteLeaves(ids: number[]) {
  const leaves = await prisma.leave.findMany({
    where: {
      id_leave: { in: ids },
      leave_status: "PENDING"
    },
    include: {
      employee: true,
    }
  });

  // Hapus attachments dulu
  for (const leave of leaves) {
    if (leave.attachment) {
      await deleteAttachment(leave.attachment);
    }
  }

  // Hapus records
  await prisma.leave.deleteMany({
    where: {
      id_leave: { in: ids }
    }
  });

  return leaves;
}

// Hapus single attachment
export async function deleteAttachment(filename: string) {
  try {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    await fs.unlink(filePath);
    console.log(` Attachment deleted: ${filename}`);
  } catch (error) {
    console.warn(`Failed to delete attachment ${filename}:`, error);
  }
}

// Hapus single leave
export async function deleteLeave(id_leave: number) {
  // Hapus attachment dulu
  const leave = await getLeaveById(id_leave);
  if (leave?.attachment) {
    await deleteAttachment(leave.attachment);
  }

  return prisma.leave.delete({
    where: { id_leave }
  });
}
