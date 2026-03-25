// service/payrollService.ts - LENGKAP
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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

export async function getPayrollByEmployee(id_employee: number) {
  return await prisma.payroll.findMany({
    where: { id_employee },
    include: {
      employee: true,
      payslips: true
    }
  });
}

export async function generatePayroll(periode_month: number, periode_year: number) {
  // Cek payroll sudah ada belum untuk periode ini
  const existingPayrolls = await prisma.payroll.findMany({
    where: {
      periode_month,
      periode_year
    }
  });

  if (existingPayrolls.length > 0) {
    throw new Error(`Payroll untuk ${periode_month}/${periode_year} sudah ada! Hapus dulu atau generate periode lain.`);
  }

  // Ambil semua employee aktif
  const employees = await prisma.employee.findMany({
    where: { employee_status: 'AKTIF' },
    include: {
      user: true
    }
  });

  const payrolls = [];
  
  for (const emp of employees) {
    // Hitung attendance bulan ini
    const attendanceCount = await prisma.attendance.count({
      where: {
        id_employee: emp.id_employee,
        date: {
          gte: new Date(periode_year, periode_month - 1, 1),
          lt: new Date(periode_year, periode_month, 1)
        },
        attendance_status: 'PRESENT'
      }
    });

    // Hitung leave bulan ini
    const leaveCount = await prisma.leave.count({
      where: {
        id_employee: emp.id_employee,
        start_date: {
          gte: new Date(periode_year, periode_month - 1, 1),
          lt: new Date(periode_year, periode_month, 1)
        },
        leave_status: 'APPROVED'
      }
    });

    // Hitung overtime bulan ini
    const overtimeRecords = await prisma.overtime.findMany({
      where: {
        id_employee: emp.id_employee,
        date: {
          gte: new Date(periode_year, periode_month - 1, 1),
          lt: new Date(periode_year, periode_month, 1)
        },
        overtime_status: 'APPROVED'
      }
    });

    const totalOvertime = overtimeRecords.reduce((sum, ot) => sum + ot.total_minutes, 0);

    // Hitung gaji
    const basicSalary = emp.basic_salary;
    const daysInMonth = new Date(periode_year, periode_month, 0).getDate();
    const attendanceRate = attendanceCount / daysInMonth;
    
    // Deduction 5% kalau attendance < 80%
    const deduction = attendanceRate < 0.8 ? basicSalary * 0.05 : 0;
    
    // Overtime bonus Rp 50.000/jam
    const overtimeBonus = (totalOvertime / 60) * 50000;
    
    const totalSalary = basicSalary + overtimeBonus - deduction;

    const payroll = await prisma.payroll.create({
      data: {
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
        }
      }
    });

    payrolls.push(payroll);
  }

  return payrolls;
}

export async function generatePayslip(id_payroll: number) {
  // Cek payslip sudah ada
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

export async function getPayrollByMonth(periode_month: number, periode_year: number) {
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

// ✅ DELETE FUNCTION LENGKAP
export async function deletePayrollById(id_payroll: number) {
  // Cari payroll dulu beserta payslip
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

  // Hapus SEMUA payslip terkait
  const payslipCount = payroll.payslips.length;
  if (payslipCount > 0) {
    await prisma.payslip.deleteMany({
      where: { id_payroll }
    });
    console.log(`🗑️ Deleted ${payslipCount} payslips for payroll ${id_payroll}`);
  }

  // Hapus payroll
  await prisma.payroll.delete({
    where: { id_payroll }
  });

  console.log(`✅ Deleted payroll ${id_payroll} (${payroll.employee.full_name}) + ${payslipCount} payslips`);
  return payroll;
}
