/*
  Warnings:

  - The `approved_by` column on the `leave` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `approved_by` column on the `overtime` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[id_employee,date]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_user]` on the table `employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nik]` on the table `employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_employee,periode_month,periode_year]` on the table `payroll` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `full_name` to the `employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nik` to the `employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periode_year` to the `payroll` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `periode_month` on the `payroll` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "employee" ADD COLUMN     "bank_account" TEXT,
ADD COLUMN     "bank_holder" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "nik" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT,
ALTER COLUMN "employee_status" SET DEFAULT 'AKTIF';

-- AlterTable
ALTER TABLE "leave" DROP COLUMN "approved_by",
ADD COLUMN     "approved_by" INTEGER;

-- AlterTable
ALTER TABLE "overtime" DROP COLUMN "approved_by",
ADD COLUMN     "approved_by" INTEGER;

-- AlterTable
ALTER TABLE "payroll" ADD COLUMN     "periode_year" INTEGER NOT NULL,
DROP COLUMN "periode_month",
ADD COLUMN     "periode_month" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "attendance_id_employee_date_key" ON "attendance"("id_employee", "date");

-- CreateIndex
CREATE UNIQUE INDEX "employee_id_user_key" ON "employee"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "employee_nik_key" ON "employee"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_id_employee_periode_month_periode_year_key" ON "payroll"("id_employee", "periode_month", "periode_year");

-- AddForeignKey
ALTER TABLE "leave" ADD CONSTRAINT "leave_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime" ADD CONSTRAINT "overtime_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;
