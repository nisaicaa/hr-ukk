import express from "express";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance
} from "../controllers/attendanceController";
import { authMiddleware } from "../middlewares/authMiddleware";
import upload from "../utils/multer";

const router = express.Router();

router.use(authMiddleware);

router.post("/checkin", upload.single("photo"), checkIn);
router.post("/checkout", upload.single("photo"), checkOut);
router.get("/", getMyAttendance);
router.get("/all", getAllAttendance);

export default router;