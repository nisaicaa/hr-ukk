import { Request, Response } from "express";
import { 
  getHRReportData, 
  getFinanceReportData, 
  getAdminReportData 
} from "../service/repotService";

export const report = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month & Year wajib diisi" });
    }

    const role = (req as any).user?.role;

    let data;

    switch (role) {
      case "HR":
        data = await getHRReportData(Number(month), Number(year));
        break;

      case "FINANCE":
        data = await getFinanceReportData(Number(month), Number(year));
        break;

      case "ADMIN":
        data = await getAdminReportData(Number(month), Number(year));
        break;

      default:
        return res.status(403).json({ message: "Tidak ada akses" });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};