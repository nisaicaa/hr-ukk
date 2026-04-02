import express from "express";
import { report } from "../controllers/repotController";
import {authMiddleware} from "../middlewares/authMiddleware"; // pastikan middleware set req.user

const router = express.Router();

// semua role pakai endpoint sama, middleware cek role
router.get("/", authMiddleware, report);

export default router;