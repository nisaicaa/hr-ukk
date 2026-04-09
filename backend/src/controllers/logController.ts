import { Request, Response } from "express";
import * as logService from "../service/logService";

// Get all logs with optional date filters
export async function getLogs(req: Request, res: Response) {
  try {

    const { startDate, endDate, month, year } = req.query;

    const logs = await logService.getAllLogs({
      startDate: startDate as string,
      endDate: endDate as string,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined
    });

    res.json({
      success: true,
      data: logs
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}