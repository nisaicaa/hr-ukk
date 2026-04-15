// src/controllers/dashboardController.ts
import { Request, Response } from "express";
import {
  getAdminDashboardData,
  getHRDashboardData,
  getFinanceDashboardData,
} from "../service/dashboardService";

export const dashboard = async (req: Request, res: Response) => {
  try {
    const role = (req as any).user?.role;

    let data;

    switch (role) {
      case "ADMIN":
        data = await getAdminDashboardData();
        break;
      case "HR":
        data = await getHRDashboardData();
        break;
      case "FINANCE":
         data = await getFinanceDashboardData();
        break;
      default:
        return res.status(403).json({ message: "Akses ditolak" });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};