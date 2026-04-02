import { Request, Response } from "express";
import * as workSettingService from "../service/workSettingService";

export async function getSetting(req: Request, res: Response) {
  try {
    const setting = await workSettingService.getWorkSetting();
    res.json({ success: true, data: setting });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateSetting(req: Request, res: Response) {
  try {
    const { work_start_time, work_end_time, work_days } = req.body; // ✅ snake_case

    const updated = await workSettingService.updateWorkSetting({
      work_start_time,
      work_end_time,
      work_days
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}