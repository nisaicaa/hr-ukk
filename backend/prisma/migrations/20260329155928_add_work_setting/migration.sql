-- CreateTable
CREATE TABLE "work_setting" (
    "id" SERIAL NOT NULL,
    "work_start_time" TEXT NOT NULL,
    "work_end_time" TEXT NOT NULL,
    "work_days" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_setting_pkey" PRIMARY KEY ("id")
);
