-- CreateTable
CREATE TABLE "log_activity" (
    "id_log" SERIAL NOT NULL,
    "id_user" INTEGER,
    "action" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_activity_pkey" PRIMARY KEY ("id_log")
);

-- AddForeignKey
ALTER TABLE "log_activity" ADD CONSTRAINT "log_activity_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;
