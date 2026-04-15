import prisma from "../utils/prisma";

// Helper untuk menentukan rentang tanggal dalam satu bulan
const getDateRange = (month: number, year: number) => {
  const start = new Date(year, month - 1, 1, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59);
  return { start, end };
};

//
// ======================
// ADMIN REPORT
// ======================
export const getAdminReportData = async (
  month: number,
  year: number
) => {
  const { start, end } = getDateRange(month, year);

  // Total Karyawan
  const totalEmployees = await prisma.employee.count();

  // Total Departemen & Posisi
  const totalDepartments = await prisma.employee.groupBy({
    by: ["departemen"],
  });

  const totalPositions = await prisma.employee.groupBy({
    by: ["jabatan"],
  });

  // Total Pengeluaran Gaji pada bulan tersebut
  const payroll = await prisma.payroll.aggregate({
    _sum: {
      total_salary: true,
    },
    where: {
      periode_month: month,
      periode_year: year,
    },
  });

  // ======================
  // ATTENDANCE
  // ======================

  // Kehadiran: PRESENT + LATE
  const totalAttendance = await prisma.attendance.count({
    where: {
      date: {
        gte: start,
        lte: end,
      },
      attendance_status: {
        in: ["PRESENT", "LATE"],
      },
    },
  });

  // Total Keterlambatan
  const totalLate = await prisma.attendance.count({
    where: {
      date: {
        gte: start,
        lte: end,
      },
      attendance_status: "LATE",
    },
  });

  // Total Absen Tanpa Keterangan
  const totalLeave = await prisma.attendance.count({
    where: {
      date: {
        gte: start,
        lte: end,
      },
      attendance_status: "ABSENT",
    },
  });

  // Distribusi karyawan per departemen (untuk chart jika diperlukan)
  const departmentDistribution = await prisma.employee.groupBy({
    by: ["departemen"],
    _count: {
      id_employee: true,
    },
  });

  return {
    summary: {
      totalEmployees,
      totalDepartments: totalDepartments.length,
      totalPositions: totalPositions.length,
      totalSalary: payroll._sum.total_salary || 0,
      totalAttendance,
      totalLate,
      totalLeave,
    },
    charts: {
      departmentDistribution: departmentDistribution.map((d) => ({
        name: d.departemen,
        total: d._count.id_employee,
      })),
    },
  };
};

//
// ======================
// HR REPORT
// ======================
export const getHRReportData = async (
  month: number,
  year: number
) => {
  const { start, end } = getDateRange(month, year);

  const employees = await prisma.employee.findMany();

  const attendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  const leaves = await prisma.leave.findMany({
    where: {
      leave_status: "APPROVED",
      start_date: { lte: end },
      end_date: { gte: start },
    },
  });

  const overtimes = await prisma.overtime.findMany({
    where: {
      overtime_status: "APPROVED",
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  const reportMap: Record<number, any> = {};

  // Inisialisasi data karyawan
  employees.forEach((emp) => {
    reportMap[emp.id_employee] = {
      name: emp.full_name,
      department: emp.departemen,
      position: emp.jabatan,
      attendance: 0,
      late: 0,
      leave: 0,
      overtime: 0,
    };
  });

  // Hitung kehadiran dan keterlambatan
  attendances.forEach((a) => {
    const row = reportMap[a.id_employee];
    if (!row) return;

    if (a.attendance_status === "PRESENT") {
      row.attendance++;
    }

    if (a.attendance_status === "LATE") {
      row.attendance++;
      row.late++;
    }

    if (a.attendance_status === "ABSENT") {
      row.leave++;
    }
  });

  // Hitung cuti berdasarkan rentang tanggal
  leaves.forEach((l) => {
    const row = reportMap[l.id_employee];
    if (!row) return;

    const startDate = new Date(
      Math.max(new Date(l.start_date).getTime(), start.getTime())
    );
    const endDate = new Date(
      Math.min(new Date(l.end_date).getTime(), end.getTime())
    );

    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    if (days > 0) {
      row.leave += days;
    }
  });

  // Hitung lembur dalam jam
  overtimes.forEach((o) => {
    const row = reportMap[o.id_employee];
    if (!row) return;
    row.overtime += Math.round(o.total_minutes / 60);
  });

  const table = Object.values(reportMap);

  const summary = {
    totalEmployees: table.length,
    totalAttendance: table.reduce(
      (a, t) => a + t.attendance,
      0
    ),
    totalLate: table.reduce((a, t) => a + t.late, 0),
    totalLeave: table.reduce((a, t) => a + t.leave, 0),
    totalOvertime: table.reduce(
      (a, t) => a + t.overtime,
      0
    ),
  };

  return { summary, table };
};

//
// ======================
// FINANCE REPORT
// ======================
export const getFinanceReportData = async (
  month: number,
  year: number
) => {
  const payrolls = await prisma.payroll.findMany({
    where: {
      periode_month: month,
      periode_year: year,
    },
    include: {
      employee: true,
    },
  });

  const table = payrolls.map((p) => ({
    name: p.employee.full_name,
    department: p.employee.departemen,
    basicSalary: p.employee.basic_salary,
    attendance: p.total_attendance,
    overtime: p.total_overtime,
    deduction: p.deduction,
    totalSalary: p.total_salary,
  }));

  const summary = {
    totalEmployee: table.length,
    totalPayroll: table.reduce(
      (a, t) => a + t.totalSalary,
      0
    ),
    totalOvertime: table.reduce(
      (a, t) => a + t.overtime,
      0
    ),
    totalDeduction: table.reduce(
      (a, t) => a + t.deduction,
      0
    ),
  };

  return { table, summary };
};