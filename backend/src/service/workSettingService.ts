// src/service/workSettingService.ts
import prisma from '../utils/prisma';

export async function getWorkSetting() {
  let setting = await prisma.work_setting.findFirst(); // ✅ underscore
  if (!setting) {
    setting = await prisma.work_setting.create({
      data: {
        work_start_time: '08:00',
        work_end_time: '17:00',
        work_days: '1,2,3,4,5',
        late_tolerance: 15,
        overtime_minimum: 60
      }
    });
  }
  return setting;
}

export async function updateWorkSetting(data: {
  work_start_time: string;
  work_end_time: string;
  work_days: string;
}) {
  const existing = await prisma.work_setting.findFirst();
  if (!existing) {
    return prisma.work_setting.create({ data });
  }
  return prisma.work_setting.update({
    where: { id: existing.id },
    data
  });
}