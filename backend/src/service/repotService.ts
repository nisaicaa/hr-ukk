// src/services/reportService.ts

import prisma from "../utils/prisma"

export const getHRReportData = async (month: number, year: number) => {

 const start = new Date(year, month - 1, 1)
 const end = new Date(year, month, 0, 23, 59, 59)

 const attendance = await prisma.attendance.findMany({
  where:{
   date:{
    gte:start,
    lte:end
   }
  },
  include:{
   employee:true
  }
 })

 const summary = {
  present: attendance.filter(a=>a.attendance_status==="PRESENT").length,
  late: attendance.filter(a=>a.attendance_status==="LATE").length,
  absent: attendance.filter(a=>a.attendance_status==="ABSENT").length,
  leave: attendance.filter(a=>a.attendance_status==="LEAVE").length
 }

 const table = attendance.map(a=>({
  name:a.employee.full_name,
  department:a.employee.departemen,
  date:a.date,
  checkIn:a.check_in,
  checkOut:a.check_out,
  status:a.attendance_status
 }))

 return {summary,table}

}



export const getFinanceReportData = async (month:number,year:number)=>{

 const payroll = await prisma.payroll.findMany({
  where:{
   periode_month:month,
   periode_year:year
  },
  include:{
   employee:true
  }
 })

 const totalPayroll = payroll.reduce((acc,p)=>acc+p.total_salary,0)

 const summary = {
  totalPayroll,
  totalEmployee: payroll.length
 }

 const table = payroll.map(p=>({
  name:p.employee.full_name,
  department:p.employee.departemen,
  basicSalary:p.employee.basic_salary,
  attendance:p.total_attendance,
  overtime:p.total_overtime,
  deduction:p.deduction,
  totalSalary:p.total_salary
 }))

 return {summary,table}

}



export const getAdminReportData = async (month:number,year:number)=>{

 const payroll = await prisma.payroll.findMany({
  where:{
   periode_month:month,
   periode_year:year
  },
  include:{
   employee:true
  }
 })

 const table = payroll.map(p=>({
  name:p.employee.full_name,
  department:p.employee.departemen,
  position:p.employee.jabatan,
  attendance:p.total_attendance,
  leave:p.total_leave,
  overtime:p.total_overtime,
  salary:p.total_salary
 }))

 return {table}

}