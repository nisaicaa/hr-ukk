// src/service/dashboardService.ts
import prisma from "../utils/prisma";

// Helper untuk mendapatkan rentang hari ini
const getTodayRange = () => {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));
  return { start, end };
};

// ======================= ADMIN DASHBOARD =======================
export const getAdminDashboardData = async () => {
  const { start, end } = getTodayRange();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const totalUsers = await prisma.users.count();
  const totalEmployees = await prisma.employee.count();

  const departments = await prisma.employee.groupBy({
    by: ["departemen"],
  });

  const positions = await prisma.employee.groupBy({
    by: ["jabatan"],
  });

  const presentToday = await prisma.attendance.count({
    where: {
      date: { gte: start, lte: end },
      attendance_status: { in: ["PRESENT", "LATE"] },
    },
  });

  const leaveRequests = await prisma.leave.count({
    where: { leave_status: "PENDING" },
  });

  const payroll = await prisma.payroll.aggregate({
    _sum: { total_salary: true },
    where: {
      periode_month: month,
      periode_year: year,
    },
  });

  // Tren kehadiran tahunan
  const monthlyAttendance: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const count = await prisma.attendance.count({
      where: {
        date: {
          gte: new Date(year, i - 1, 1),
          lte: new Date(year, i, 0, 23, 59, 59),
        },
        attendance_status: { in: ["PRESENT", "LATE"] },
      },
    });
    monthlyAttendance.push(count);
  }

  // Distribusi departemen
  const departmentDistribution = await prisma.employee.groupBy({
    by: ["departemen"],
    _count: { id_employee: true },
  });

  return {
    summary: {
      totalUsers,
      totalEmployees,
      totalDepartments: departments.length,
      totalPositions: positions.length,
      presentToday,
      leaveRequests,
      totalSalary: payroll._sum.total_salary || 0,
    },
    monthlyAttendance,
    departmentDistribution: departmentDistribution.map((d) => ({
      name: d.departemen,
      total: d._count.id_employee,
    })),
  };
};

// ======================= HR DASHBOARD =======================
export const getHRDashboardData = async () => {
  const { start, end } = getTodayRange();
  const today = new Date();
  const year = today.getFullYear();

  const totalEmployees = await prisma.employee.count();

  const presentToday = await prisma.attendance.count({
    where: {
      date: { gte: start, lte: end },
      attendance_status: { in: ["PRESENT", "LATE"] },
    },
  });

  const leaveRequests = await prisma.leave.count({
    where: { leave_status: "PENDING" },
  });

  const approvedOvertime = await prisma.overtime.count({
    where: { overtime_status: "APPROVED" },
  });

  // Rasio absensi bulan ini
  const month = today.getMonth();
  const startMonth = new Date(year, month, 1);
  const endMonth = new Date(year, month + 1, 0, 23, 59, 59);

  const hadir = await prisma.attendance.count({
    where: {
      date: { gte: startMonth, lte: endMonth },
      attendance_status: "PRESENT",
    },
  });

  const telat = await prisma.attendance.count({
    where: {
      date: { gte: startMonth, lte: endMonth },
      attendance_status: "LATE",
    },
  });

  const cuti = await prisma.leave.count({
    where: {
      leave_status: "APPROVED",
      start_date: { lte: endMonth },
      end_date: { gte: startMonth },
    },
  });

  // Tren kehadiran tahunan
  const monthlyAttendance: number[] = [];
  for (let i = 0; i < 12; i++) {
    const count = await prisma.attendance.count({
      where: {
        date: {
          gte: new Date(year, i, 1),
          lte: new Date(year, i + 1, 0, 23, 59, 59),
        },
        attendance_status: { in: ["PRESENT", "LATE"] },
      },
    });
    monthlyAttendance.push(count);
  }

  // Cuti terbaru
  const recentLeaves = await prisma.leave.findMany({
    take: 5,
    orderBy: { created_at: "desc" },
    include: {
      employee: {
        select: {
          full_name: true,
          jabatan: true,
        },
      },
    },
  });

  return {
    summary: {
      totalEmployees,
      presentToday,
      leaveRequests,
      approvedOvertime,
    },
    chart: {
      hadir,
      telat,
      cuti,
    },
    monthlyAttendance,
    recentLeaves: recentLeaves.map((l) => ({
      name: l.employee.full_name,
      position: l.employee.jabatan,
      type: l.leave_type,
      duration:
        Math.ceil(
          (l.end_date.getTime() - l.start_date.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1,
      status: l.leave_status,
    })),
  };
};
export const getFinanceDashboardData = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // Total payroll bulan berjalan
  const payrollSummary = await prisma.payroll.aggregate({
    _sum: {
      total_salary: true,
    },
    _count: {
      id_payroll: true,
    },
    where: {
      periode_month: month,
      periode_year: year,
    },
  });

  // Payroll yang sudah dibayarkan (memiliki payslip)
  const paidPayroll = await prisma.payroll.count({
    where: {
      periode_month: month,
      periode_year: year,
      payslips: {
        some: {},
      },
    },
  });

  // Payroll yang masih pending (belum memiliki payslip)
  const pendingPayroll = await prisma.payroll.count({
    where: {
      periode_month: month,
      periode_year: year,
      payslips: {
        none: {},
      },
    },
  });

  // Payroll bermasalah (gaji <= 0 atau null)
  const issuesPayroll = await prisma.payroll.count({
  where: {
    periode_month: month,
    periode_year: year,
    total_salary: {
      lte: 0,
    },
  },
});

  // Tren payroll bulanan dalam satu tahun
  const monthlyPayroll: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const result = await prisma.payroll.aggregate({
      _sum: {
        total_salary: true,
      },
      where: {
        periode_month: i,
        periode_year: year,
      },
    });

    monthlyPayroll.push(result._sum.total_salary || 0);
  }

  // Aktivitas payroll terbaru
  const recentPayrolls = await prisma.payroll.findMany({
    take: 5,
    orderBy: {
      created_date: "desc",
    },
    include: {
      employee: {
        select: {
          full_name: true,
          nik: true,
          departemen: true,
        },
      },
    },
  });

  return {
    summary: {
      totalPayroll: payrollSummary._sum.total_salary || 0,
      totalStaffPaid: paidPayroll,
      totalPending: pendingPayroll,
      totalIssues: issuesPayroll,
      totalPayrollGenerated: payrollSummary._count.id_payroll,
    },
    monthlyPayroll,
    recentPayrolls,
  };
};