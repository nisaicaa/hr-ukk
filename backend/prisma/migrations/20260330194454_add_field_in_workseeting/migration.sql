-- AlterTable
ALTER TABLE "work_setting" ADD COLUMN     "late_tolerance" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "overtime_minimum" INTEGER NOT NULL DEFAULT 60;
