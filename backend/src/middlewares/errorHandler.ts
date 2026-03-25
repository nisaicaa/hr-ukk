import { Request, Response, NextFunction } from "express";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  const status = (err as any)?.status || 500;
  const message = (err as any)?.message || "Internal Server Error";
  res.status(status).json({ success: false, message });
}
