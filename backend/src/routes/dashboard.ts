// src/routes/dashboard.ts
import { Router } from "express";
import { dashboard } from "../controllers/dashboardController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, dashboard);

export default router;