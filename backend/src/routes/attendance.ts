import express from "express";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance
} from "../controllers/attendanceController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authMiddleware);

router.post("/checkin", checkIn);
router.post("/checkout", checkOut);
router.get("/", getMyAttendance);
router.get("/all", getAllAttendance);

export default router;