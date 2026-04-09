import prisma from "../utils/prisma";

// Helper untuk menentukan rentang tanggal
const getDateRange = (month: number, year: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return { start, end };
};

// ====================== HR REPORT ======================
export const getHRReportData = async (month: number, year: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  // Ambil semua karyawan
  const employees = await prisma.employee.findMany();

  // Attendance
  const attendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  // Leave (CUTI) dari tabel leave
  const leaves = await prisma.leave.findMany({
    where: {
      leave_status: "APPROVED",
      start_date: { lte: end },
      end_date: { gte: start },
    },
  });

  // Overtime
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

  // Inisialisasi data
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

  // Hitung attendance
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
  });

  // Hitung cuti dari tabel leave
  leaves.forEach((l) => {
    const row = reportMap[l.id_employee];
    if (!row) return;

    const startDate = new Date(l.start_date);
    const endDate = new Date(l.end_date);

    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    row.leave += days;
  });

  // Hitung lembur
  overtimes.forEach((o) => {
    const row = reportMap[o.id_employee];
    if (!row) return;

    row.overtime += Math.round(o.total_minutes / 60);
  });

  const table = Object.values(reportMap);

  const summary = {
    totalEmployees: table.length,
    totalAttendance: table.reduce((a, t) => a + t.attendance, 0),
    totalLate: table.reduce((a, t) => a + t.late, 0),
    totalLeave: table.reduce((a, t) => a + t.leave, 0),
    totalOvertime: table.reduce((a, t) => a + t.overtime, 0),
  };

  return { summary, table };
};

// ====================== ADMIN REPORT ======================
// ====================== ADMIN REPORT ======================
export const getAdminReportData = async (
  month: number,
  year: number
) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const totalEmployee = await prisma.employee.count();

  // Payroll
  const payroll = await prisma.payroll.aggregate({
    _sum: {
      total_salary: true,
    },
    where: {
      periode_month: month,
      periode_year: year,
    },
  });

  // Attendance
  const attendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  const hadir = attendances.filter(
    (a) => a.attendance_status === "PRESENT"
  ).length;

  const telat = attendances.filter(
    (a) => a.attendance_status === "LATE"
  ).length;

  const absen = attendances.filter(
    (a) => a.attendance_status === "ABSENT"
  ).length;

  const leaves = await prisma.leave.count({
    where: {
      leave_status: "APPROVED",
      start_date: { lte: end },
      end_date: { gte: start },
    },
  });

  return {
    summary: {
      totalEmployees: totalEmployee,
      totalSalary: payroll._sum.total_salary || 0,
      totalAttendance: hadir,
      totalLate: telat,
      totalAbsent: absen,
      totalLeave: leaves,
      totalOvertime: 0,
    },
  };
};

// ====================== FINANCE REPORT ======================
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
    totalPayroll: table.reduce((a, t) => a + t.totalSalary, 0),
    totalOvertime: table.reduce((a, t) => a + t.overtime, 0),
    totalDeduction: table.reduce((a, t) => a + t.deduction, 0),
  };

  return { table, summary };
};