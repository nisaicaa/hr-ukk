import prisma from "../utils/prisma";

export async function createLog(data: {
  id_user?: number;
  action: string;
  table_name: string;
  description: string;
}) {
  try {
    return await prisma.log_activity.create({
      data,
    });
  } catch (error) {
    console.error("Failed to create log:", error);
  }
}

export async function getAllLogs(filters?: {
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
}) {

  const where: any = {};

  if (filters?.startDate && filters?.endDate) {
    where.created_at = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate)
    };
  }

  if (filters?.month && filters?.year) {

    const start = new Date(filters.year, filters.month - 1, 1);
    const end = new Date(filters.year, filters.month, 0, 23, 59, 59);

    where.created_at = {
      gte: start,
      lte: end
    };

  }

  if (filters?.year && !filters?.month) {

    const start = new Date(filters.year, 0, 1);
    const end = new Date(filters.year, 11, 31, 23, 59, 59);

    where.created_at = {
      gte: start,
      lte: end
    };

  }

  return prisma.log_activity.findMany({
    where,
    orderBy: {
      created_at: "desc"
    },
    include: {
      user: {
        select: {
          username: true,
          role: true
        }
      }
    }
  });

}