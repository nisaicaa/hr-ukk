import prisma from "../utils/prisma"

// ====================== HR REPORT ======================
export const getHRReportData = async (month: number, year: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const employees = await prisma.employee.findMany();
  const attendance = await prisma.attendance.findMany({
    where: { date: { gte: start, lte: end } },
  });
  const overtime = await prisma.overtime.findMany({
    where: { date: { gte: start, lte: end } },
  });

  const reportMap: Record<number, any> = {};

  employees.forEach(emp => {
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

  attendance.forEach(a => {
    const row = reportMap[a.id_employee];
    if (!row) return;

    if (a.attendance_status === "PRESENT") row.attendance++;
    if (a.attendance_status === "LATE") {
      row.attendance++;
      row.late++;
    }
    if (a.attendance_status === "LEAVE") row.leave++;
  });

  overtime.forEach(o => {
    const row = reportMap[o.id_employee];
    if (!row) return;
    row.overtime++;
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
export const getAdminReportData = async (month: number, year: number) => {

  // TOTAL EMPLOYEE
  const employees = await prisma.employee.findMany();
  const totalEmployee = employees.length;

  // PAYROLL
  const payroll = await prisma.payroll.aggregate({
    _sum: {
      total_salary: true
    },
    where: {
      periode_month: month,
      periode_year: year
    }
  });

  // DATE RANGE
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  // ATTENDANCE
  const attendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: start,
        lte: end
      }
    }
  });

  // ✅ SUMMARY GLOBAL
  const hadir = attendances.filter(a => a.attendance_status === "PRESENT").length;
  const telat = attendances.filter(a => a.attendance_status === "LATE").length;
  const absen = attendances.filter(a => a.attendance_status === "ABSENT").length;

  // ✅ TABLE (PER EMPLOYEE)
  const table = employees.map(emp => {
    const empAttend = attendances.filter(a => a.id_employee === emp.id_employee);

    return {
      name: emp.full_name,
      department: emp.departemen,
      position: emp.jabatan,
      attendance: empAttend.filter(a => a.attendance_status === "PRESENT").length,
      late: empAttend.filter(a => a.attendance_status === "LATE").length,
      leave: empAttend.filter(a => a.attendance_status === "LEAVE").length,
      overtime: 0 // sementara (kalau belum ada tabel lembur)
    };
  });

  return {
    summary: {
      totalEmployees: totalEmployee,
      totalSalary: payroll._sum?.total_salary || 0,
      totalAttendance: hadir,
      totalLate: telat,
      totalLeave: absen,
      totalOvertime: 0
    },
    table
  };
}; 
//REPORT FINANCE
export const getFinanceReportData = async (month:number, year:number) => {
  const payrolls = await prisma.payroll.findMany({
    where:{
      periode_month: month,
      periode_year: year
    },
    include:{
      employee:true
    }
  });

  const table = payrolls.map(p => ({
    name: p.employee.full_name,
    department: p.employee.departemen,
    basicSalary: p.employee.basic_salary,
    attendance: p.total_attendance,
    overtime: p.total_overtime,
    deduction: p.deduction,
    totalSalary: p.total_salary
  }));

  const summary = {
    totalEmployee: table.length,
    totalPayroll: table.reduce((a,t)=>a+t.totalSalary,0),
    totalOvertime: table.reduce((a,t)=>a+t.overtime,0),
    totalDeduction: table.reduce((a,t)=>a+t.deduction,0),
  };

  return { table, summary };
};