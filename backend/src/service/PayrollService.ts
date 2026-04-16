// service/payrollService.ts - FINAL VERSION (SUPPORT REGENERATE)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =======================
// GET ALL PAYROLL
// =======================
export async function getAllPayroll() {
  return await prisma.payroll.findMany({
    include: {
      employee: {
        include: {
          user: true
        }
      },
      payslips: true
    },
    orderBy: {
      created_date: 'desc'
    }
  });
}

// =======================
// GET PAYROLL BY EMPLOYEE
// =======================
export async function getPayrollByEmployee(id_employee: number) {
  return await prisma.payroll.findMany({
    where: { id_employee },
    include: {
      employee: true,
      payslips: true
    },
    orderBy: [
      { periode_year: 'desc' },
      { periode_month: 'desc' }
    ]
  });
}

// =======================
// GENERATE / REGENERATE PAYROLL
// =======================
export async function generatePayroll(
  periode_month: number,
  periode_year: number
) {
  // Ambil semua employee aktif
  const employees = await prisma.employee.findMany({
    where: { employee_status: 'AKTIF' },
    include: { user: true }
  });

  const payrolls = [];

  for (const emp of employees) {
    const startDate = new Date(periode_year, periode_month - 1, 1);
    const endDate = new Date(periode_year, periode_month, 1);

    // =========================
    // HITUNG ATTENDANCE (PRESENT + LATE)
    // =========================
    const attendanceCount = await prisma.attendance.count({
      where: {
        id_employee: emp.id_employee,
        date: {
          gte: startDate,
          lt: endDate
        },
        attendance_status: {
          in: ['PRESENT', 'LATE']
        }
      }
    });

    // =========================
    // HITUNG LEAVE (APPROVED)
    // =========================
    const leaveCount = await prisma.leave.count({
      where: {
        id_employee: emp.id_employee,
        leave_status: 'APPROVED',
        OR: [
          {
            start_date: { lte: endDate },
            end_date: { gte: startDate }
          }
        ]
      }
    });

    // =========================
    // HITUNG OVERTIME
    // =========================
    const overtimeRecords = await prisma.overtime.findMany({
      where: {
        id_employee: emp.id_employee,
        date: {
          gte: startDate,
          lt: endDate
        },
        overtime_status: 'APPROVED'
      }
    });

    const totalOvertime = overtimeRecords.reduce(
      (sum, ot) => sum + ot.total_minutes,
      0
    );

    // =========================
    // PERHITUNGAN GAJI
    // =========================
    const basicSalary = emp.basic_salary;
    const workingDays = 22; // Standar hari kerja
    const attendanceRate = attendanceCount / workingDays;

    // Potongan jika kehadiran < 80%
    const deduction = attendanceRate < 0.8 ? basicSalary * 0.05 : 0;

    // Bonus lembur (Rp 50.000 per jam)
    const overtimeBonus = (totalOvertime / 60) * 50000;

    const totalSalary = basicSalary + overtimeBonus - deduction;

    // =========================
    // UPSERT PAYROLL (CREATE / UPDATE)
    // =========================
    const payroll = await prisma.payroll.upsert({
      where: {
        id_employee_periode_month_periode_year: {
          id_employee: emp.id_employee,
          periode_month,
          periode_year
        }
      },
      update: {
        total_attendance: attendanceCount,
        total_leave: leaveCount,
        total_overtime: totalOvertime,
        deduction,
        total_salary: totalSalary
      },
      create: {
        id_employee: emp.id_employee,
        periode_month,
        periode_year,
        total_attendance: attendanceCount,
        total_leave: leaveCount,
        total_overtime: totalOvertime,
        deduction,
        total_salary: totalSalary
      },
      include: {
        employee: {
          include: { user: true }
        },
        payslips: true
      }
    });

    // =========================
    // UPDATE NET SALARY JIKA PAYSLIP SUDAH ADA
    // =========================
    if (payroll.payslips.length > 0) {
      await prisma.payslip.update({
        where: { id_payroll: payroll.id_payroll },
        data: { net_salary: totalSalary }
      });
    }

    payrolls.push(payroll);
  }

  return payrolls;
}

// =======================
// GENERATE PAYSLIP
// =======================
export async function generatePayslip(id_payroll: number) {
  // Cek apakah payslip sudah ada
  const existingPayslip = await prisma.payslip.findUnique({
    where: { id_payroll }
  });

  if (existingPayslip) {
    throw new Error('Payslip sudah dibuat untuk payroll ini!');
  }

  const payroll = await prisma.payroll.findUnique({
    where: { id_payroll },
    include: { employee: true }
  });

  if (!payroll) {
    throw new Error('Payroll tidak ditemukan!');
  }

  const payslip = await prisma.payslip.create({
    data: {
      id_payroll,
      net_salary: payroll.total_salary
    },
    include: {
      payroll: {
        include: {
          employee: true
        }
      }
    }
  });

  return payslip;
}

// =======================
// GET PAYROLL BY MONTH
// =======================
export async function getPayrollByMonth(
  periode_month: number,
  periode_year: number
) {
  return await prisma.payroll.findMany({
    where: {
      periode_month,
      periode_year
    },
    include: {
      employee: {
        include: { user: true }
      },
      payslips: true
    }
  });
}

// =======================
// DELETE PAYROLL (OPSIONAL)
// =======================
export async function deletePayrollById(id_payroll: number) {
  const payroll = await prisma.payroll.findUnique({
    where: { id_payroll },
    include: {
      employee: true,
      payslips: true
    }
  });

  if (!payroll) {
    throw new Error("Payroll tidak ditemukan");
  }

  // Hapus payslip terkait terlebih dahulu
  await prisma.payslip.deleteMany({
    where: { id_payroll }
  });

  // Hapus payroll
  await prisma.payroll.delete({
    where: { id_payroll }
  });

  return payroll;
}