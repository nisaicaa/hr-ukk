-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'HR', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'LEAVE');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'SICK', 'SPECIAL', 'UNPAID');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OvertimeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "employee" (
    "id_employee" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "departemen" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "hire_date" TIMESTAMP(3) NOT NULL,
    "employee_status" TEXT NOT NULL,
    "basic_salary" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id_employee")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id_attendance" SERIAL NOT NULL,
    "id_employee" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "checkin_latitude" DOUBLE PRECISION,
    "checkin_longitude" DOUBLE PRECISION,
    "checkin_address" TEXT,
    "checkout_latitude" DOUBLE PRECISION,
    "checkout_longitude" DOUBLE PRECISION,
    "checkout_address" TEXT,
    "work_duration_minutes" INTEGER,
    "attendance_status" "AttendanceStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id_attendance")
);

-- CreateTable
CREATE TABLE "leave" (
    "id_leave" SERIAL NOT NULL,
    "id_employee" INTEGER NOT NULL,
    "leave_type" "LeaveType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "attachment" TEXT,
    "leave_status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "approved_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_pkey" PRIMARY KEY ("id_leave")
);

-- CreateTable
CREATE TABLE "overtime" (
    "id_overtime" SERIAL NOT NULL,
    "id_employee" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "total_minutes" INTEGER NOT NULL,
    "overtime_reason" TEXT NOT NULL,
    "overtime_status" "OvertimeStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "approved_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "overtime_pkey" PRIMARY KEY ("id_overtime")
);

-- CreateTable
CREATE TABLE "payroll" (
    "id_payroll" SERIAL NOT NULL,
    "id_employee" INTEGER NOT NULL,
    "periode_month" TEXT NOT NULL,
    "total_attendance" INTEGER NOT NULL,
    "total_leave" INTEGER NOT NULL,
    "total_overtime" INTEGER NOT NULL,
    "deduction" DOUBLE PRECISION NOT NULL,
    "total_salary" DOUBLE PRECISION NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_pkey" PRIMARY KEY ("id_payroll")
);

-- CreateTable
CREATE TABLE "payslip" (
    "id_payslip" SERIAL NOT NULL,
    "id_payroll" INTEGER NOT NULL,
    "net_salary" DOUBLE PRECISION NOT NULL,
    "generated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payslip_pkey" PRIMARY KEY ("id_payslip")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "payslip_id_payroll_key" ON "payslip"("id_payroll");

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_id_employee_fkey" FOREIGN KEY ("id_employee") REFERENCES "employee"("id_employee") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave" ADD CONSTRAINT "leave_id_employee_fkey" FOREIGN KEY ("id_employee") REFERENCES "employee"("id_employee") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime" ADD CONSTRAINT "overtime_id_employee_fkey" FOREIGN KEY ("id_employee") REFERENCES "employee"("id_employee") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_id_employee_fkey" FOREIGN KEY ("id_employee") REFERENCES "employee"("id_employee") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip" ADD CONSTRAINT "payslip_id_payroll_fkey" FOREIGN KEY ("id_payroll") REFERENCES "payroll"("id_payroll") ON DELETE RESTRICT ON UPDATE CASCADE;
